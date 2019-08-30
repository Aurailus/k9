const Discord = require("discord.js");
const haystack = new (require("./HaystackIntegration.js"));

class Commands {
	constructor(discord, self) {
		this.discord = discord;
		this.self = self;

		this.registerHelp();
		this.registerLevel();
		this.registerHaystack();
		this.registerLeaderboard();
		this.registerAnnouncement();
	}

	registerCommand(prefix, command) {
		this.discord.on('message', msg => {
			if (msg.content.substr(0, prefix.length + 3) == "k9 " + prefix) {
				if (msg.channel.constructor.name != "DMChannel") msg.delete();
				command(msg);
			}
		});
	}

	registerHelp() {
		this.registerCommand("help", msg => {

			const embed = new Discord.RichEmbed()
			  .setAuthor("K9 Help", "https://cdn.discordapp.com/avatars/613569990297255938/13a0f7a3818feaa9cbc173f54b30eb9c.png?size=128")
			  .setColor("#EE86ED")
			  .setDescription(
			  	`Hi, I'm k9! I'm a user level tracking bot made by Aurailus#4014. ` +
			  	`I assign users levels and automagically grants users roles once they reach certain level thresholds. ` +
			  	`I also have a few simple commands available to interact with me.`)
			  .setFooter(`Requested by ${msg.member.displayName}`, msg.author.avatarURL)
			  .setTimestamp()

			  .addField("⠀`k9 help`", `⠀Sends this message.`)
			  .addField("⠀`k9 level`", `⠀Displays your level, XP, and rank.`)
			  .addField("⠀`k9 leaderboard`", `⠀Shows the top ranked users in the current server.`)

		  msg.channel.send({embed});
		});
	}

	registerHaystack() {
		this.registerCommand("haystack", msg => {
			haystack.parse(msg);
		});
	}

	registerLevel() {
		this.registerCommand("level", msg => {
			let auth = msg.author.id;

			//Make sure the user is in a Server
			const guild = msg.guild;
			if (!guild) return;

			//Get the server's local DB (or create one if it's missing)
			let db = this.self.db.get('servers').find({id: guild.id});
			if (!db.value()) return;
			let user = db.get('users').find({id: auth}).value();
			if (!user) return;

			const cost = (this.self.xp_properties.level_base_cost + user.level * (1 + this.self.xp_properties.level_multiplier));

			let currentRole = -1;

			const roles = db.get('levelRoles').value();
			for (let role in roles) {
				let num = parseInt(role);
				if (num <= user.level && num > currentRole) currentRole = num;
			}

			let role = (currentRole == -1) ? "Potato" : msg.guild.roles.find(r => r.id == roles[currentRole]).name;

			const embed = new Discord.RichEmbed()
			  .setAuthor("My Level", "https://i.imgur.com/Nqyb94h.png")
			  .setColor("#15B5A6")
			  .setDescription(`Statistics for ${msg.member.displayName} in ${msg.guild.name}.`)
			  .setFooter(`Requested by ${msg.member.displayName}`, msg.author.avatarURL)
			  .setTimestamp()

			  .addField(`⠀Level`, `⠀${user.level}`, true)
			  .addField(`⠀XP`, 		`⠀${Math.floor(user.levelXP)} / ${Math.ceil(cost)}`, true)
			  .addField(`⠀Rank`, 	`⠀${role}`, true)

		  msg.channel.send({embed});
		});
	}

	registerLeaderboard() {
		this.registerCommand("leaderboard", msg => {
			let users = this.self.db.get('servers').find({id: msg.guild.id}).get('users').sortBy('totalXP').reverse().take(9).value();

			const embed = new Discord.RichEmbed()
			  .setAuthor("Leaderboard", "https://i.imgur.com/LaPvO6n.png")
			  .setColor("#FFAC38")
			  .setDescription(`The most active members in ${msg.guild.name}.`)
			  .setFooter(`Requested by ${msg.member.displayName}`, msg.author.avatarURL)
			  .setTimestamp()

				.addBlankField()

		  for (let i = 0; i < users.length; i++) {
		  	const user = msg.guild.members.get(users[i].id);
		  	let name = "Removed";
		  	if (user) name = user.displayName;
		  	if (name.length >= 20) name = name.substr(0, 18) + "...";
		  	embed.addField(
		  		`⠀${i < 3 ? "**" : ""}${i + 1}) ${name}${i < 3 ? "**" : ""}`, 
		  		`⠀Level ${users[i].level} • ${Math.floor(users[i].totalXP)} XP`, true);
		  }
			
			embed.addBlankField()
			 
		  msg.channel.send({embed});
		});
	}

	registerAnnouncement() {
		this.registerCommand("announce", msg => {

			const embed = new Discord.RichEmbed()
			  .setAuthor("Auri's Den", "https://cdn.discordapp.com/avatars/613569990297255938/13a0f7a3818feaa9cbc173f54b30eb9c.png?size=128")
			  .setColor("#EE86ED")
			  .setDescription(msg.content)
			  .setFooter(`Posted by ${msg.member.displayName}`, msg.author.avatarURL)
			  .setTimestamp()

		  msg.channel.send({embed});
		});
	}
}

module.exports = Commands;
