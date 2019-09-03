import * as Discord from 'discord.js';

import {BotStorage} from "../BotStorage";
import {GuildData} from "../GuildData"
import {BotLevelRoles, Database, DBServer, DBUser} from "../Database";

export class Leveller {
	client: Discord.Client;
	storage: BotStorage;

	constructor(client: Discord.Client, storage: BotStorage) {
		this.client = client;
		this.storage = storage;

		client.on("message", (msg) => this.onMessage(msg));
	}

	onMessage(msg: Discord.Message): void {

		// Don't allow the bot itself to gain levels.
		if (msg.author.id == this.client.user.id) return;

		// Don't count bot commands.
		if (msg.content.substr(0, this.storage.conf.command_prefix.length).toLowerCase() == this.storage.conf.command_prefix) return;
		
		// Enforce minimum content requirements for XP gain
		// Don't count messages less than N characters and without a space.
		if (msg.content.length < 6 || msg.content.split(" ").length - 1 < 1) return;
		
		// Don't count DM conversations
		if (!msg.guild) return;

		const guild =	this.storage.getGuild(msg.guild);

		let server: DBServer = this.storage.db.getServer(msg.guild);
		let user: DBUser = server.getUser(msg.member);

		const time = Date.now();
		user.messages++;

		let xp = Math.round(Math.random() + Math.min(msg.content.length / 100, 1.5) * 100) / 100;
		let thankedTheDog = false;

		if (msg.content.toLowerCase().substr(0, 8) == "good dog") {
			// Thank the dog
			msg.channel.fetchMessages({ limit: 2 }).then(messages => {
  			let lastMsg = messages.last();
				if (lastMsg.author.id == this.client.user.id && lastMsg.attachments.first()) {
	  			let filename = lastMsg.attachments.first().filename;
	  			let user = filename.substr(0, filename.length - 4);

	  			if (user == msg.member.id) {
	  				msg.reply("woof!");
						xp += Math.random() * 6;
						thankedTheDog = true;
	  			}
	  		}
			});
		}

		// Ignore the first message in a while to prevent single spam messages gaining XP
		if (!thankedTheDog && (!user.lastInstigated || time - user.lastInstigated >= 300 * 1000)) {
			user.lastInstigated = time;
			server.pushUser(user);
			return;
		}

		// Only count messages every 15 seconds
		if (thankedTheDog || (time - user.lastPosted >= 15 * 1000)) {
			user.lastPosted = time;
			user.lastInstigated = time;

			user.levelXP += xp;
			user.totalXP += xp;

			const cost = (this.storage.conf.xp_properties.level_base_cost + Math.pow(user.level, this.storage.conf.xp_properties.level_multiplier));

			if (user.levelXP >= cost) {
				user.level++;
				user.levelXP -= cost;

				// imgExp.generate(msg.member.displayName, user.level, auth).then(image => {
				// 	msg.channel.send("", {file: image}).then(() => {
				// 		fs.unlinkSync(image);
				// 	});
				// });

				let currentRole = -1;
				let previousRole = -1;

				const roles: BotLevelRoles = server.getLevelRolesTable();

				for (let role in roles) {
					let num = parseInt(role);
					if (num <= user.level && num > currentRole) currentRole = num;
					if (num <= user.level - 1 && num > previousRole) previousRole = num;
				}

				if (currentRole != previousRole) {					
					if (previousRole != -1) msg.member.removeRole(msg.guild.roles.find(r => r.id == roles[previousRole]));
					if (currentRole != -1) msg.member.addRole(msg.guild.roles.find(r => r.id == roles[currentRole]), 'Update user level role.');
				}
			}
		}
	
		server.pushUser(user);
	}

	cleanup(): void {

	}
}
