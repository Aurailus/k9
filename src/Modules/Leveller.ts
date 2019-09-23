const fs = require('fs');

import * as Discord from 'discord.js';

import {BotStorage} from "../BotStorage";
import {GuildData} from "../GuildData";
import {LevelImageBuilder} from "./LevelImageBuilder"
import {BotLevelRoles, Database, DBServer, DBUser} from "../Database";

export class Leveller {
	client: Discord.Client;
	storage: BotStorage;
	imgBuilder: LevelImageBuilder;

	constructor(client: Discord.Client, storage: BotStorage) {
		this.client = client;
		this.storage = storage;
		this.imgBuilder = new LevelImageBuilder();

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

		for (let voice in guild.voiceTextChannels) {
			if (guild.voiceTextChannels[voice].id == msg.channel.id) {
				return;
			}
		}

		let server: DBServer = this.storage.db.getServer(msg.guild);
		let user: DBUser = server.getUser(msg.member);

		const time = Date.now();
		user.messages++;

		let xp = Math.round(Math.random() + Math.min(msg.content.length / 70, 3.0) * 100) / 100;
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
			//Don't score the message if it is less than 30 chars long (a "useless" message)
			if (msg.content.length < 30) {
				server.pushUser(user);
				return;
			}
		}

		// Only count messages every 30 seconds
		if (thankedTheDog || (time - user.lastPosted >= 30 * 1000)) {
			user.lastPosted = time;
			user.lastInstigated = time;

			user.levelXP += xp;
			user.totalXP += xp;

			const cost = (this.storage.conf.xp_properties.level_base_cost + Math.pow(user.level, this.storage.conf.xp_properties.level_multiplier));

			if (user.levelXP >= cost) {
				user.level++;
				user.levelXP -= cost;

				this.imgBuilder.generate(msg.member.displayName, user.level, msg.author.id).then(image => {
					msg.channel.send("", {file: image as any}).then(() => {
						fs.unlinkSync(image);
					});
				});

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