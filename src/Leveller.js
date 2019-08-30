const fs = require('fs');
const ImageGenerator = require("./ImageGenerator.js");
const imgExp = new ImageGenerator();

class Leveller {
	constructor(discord, self) {
		this.self = self;
		this.discord = discord;

		discord.on('message', msg => this.message_recvd(msg));
	}

	message_recvd(msg) {
		let auth = msg.author.id;

		//Ignore the bot
		if (auth == 613569990297255938) return;
		// Basic Screening
		if (msg.content.length < 6 || msg.content.split(" ").length - 1 < 1 || msg.content.substr(0, 3) == "k9 ") return;
	
		//Make sure the user is in a Server
		const guild = msg.guild;
		if (!guild) return;

		//Get the server's local DB (or create one if it's missing)
		let db = this.self.db.get('servers').find({id: guild.id});
		if (!db.value()) {
			const dbTable = {
				id: guild.id,
				users: []
			};
			this.self.db.get('servers').push(dbTable).write();
			db = this.self.db.find({id: guild.id});
		}

		let user = db.get('users').find({id: auth}).value();
		const time = Date.now();

		if (!user) {
			user = {
				id: auth,
				user: msg.author.tag, 
				lastPosted: Date.now() - 60 * 1000,
				lastInstigated: Date.now() - 60 * 1000, 
				level: 0,
				levelXP: 0,
				totalXP: 0,
				messages: 0
			};
			db.get('users').push(user).write();
		}

		user.messages++;
		let xp = Math.round((Math.random() + Math.min(msg.content.length / 50), 1.5) * 10) / 10;
		let thanked = false;

		if (msg.content.toLowerCase().substr(0, 8) == "good dog") {
			msg.channel.fetchMessages({ limit: 2 }).then(messages => {
  			let lastMsg = messages.last();
				if (lastMsg.author.id == 613569990297255938 && lastMsg.attachments.first()) {
	  			let filename = lastMsg.attachments.first().filename;
	  			let user = filename.substr(0, filename.length - 4);

	  			if (user == auth) {
	  				msg.reply("woof!");
						xp += Math.round(Math.random() * 10 + 4);
						thanked = true;
	  			}
	  		}
			});
		}

		//Ignore first message
		if (!thanked && (!user.lastInstigated || time - user.lastInstigated >= 300 * 1000)) {
			user.lastInstigated = time;
			this.self.db.write();
			return;
		}

		//Only count messages every 15 seconds
		if (thanked || (time - user.lastPosted >= 15 * 1000)) {
			user.lastPosted = time;
			user.lastInstigated = time;

			user.levelXP += xp;
			user.totalXP += xp;

			const cost = (this.self.xp_properties.level_base_cost + user.level ^ this.self.xp_properties.level_multiplier);

			if (user.levelXP >= cost) {
				user.level++;
				user.levelXP -= cost;

				imgExp.generate(msg.member.displayName, user.level, auth).then(image => {
					msg.channel.send("", {file: image}).then(() => {
						fs.unlinkSync(image);
					});
				});


				let currentRole = -1;
				let previousRole = -1;

				const roles = db.get('levelRoles').value();
				for (let role in roles) {
					let num = parseInt(role);
					if (num <= user.level && num > currentRole) {
						currentRole = num;
					}
					if (num <= user.level - 1 && num > previousRole) {
						previousRole = num;
					}
				}

				if (currentRole != previousRole) {					
					if (previousRole != -1) {
						msg.member.removeRole(msg.guild.roles.find(r => r.id == roles[previousRole]));
					}
					if (currentRole != -1) {
						msg.member.addRole(msg.guild.roles.find(r => r.id == roles[currentRole]), 'Update user level role.');
					}
				}
			}
		}

		this.self.db.write();	
	}
}

module.exports = Leveller;
