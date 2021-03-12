import * as Mongoose from 'mongoose';
import * as Discord from 'discord.js';

import { BotConfig } from '../../Bot';
import { Command, CommandFn } from '../../Commands/Command';

import LevelCommand from './LevelCommand';
import LeaderboardCommand from './LeaderboardCommand';

interface LevelPluginConfig {
	please_and_thank_you: boolean;
	message: {
		cooldown: number;
		min_length: number;
	}
	levels: {
		[key: string]: {
			name: string;
			experience: number;
			role: number;
		}
	}
}
// import {GuildData} from "../GuildData";
// import {LevelImageBuilder} from "./LevelImageBuilder"
// import {BotLevelRoles, Database, DBServer, DBUser} from "../Database";

const levelPluginGuildSchema = new Mongoose.Schema({
	id: String
});

interface ILevelPluginGuild extends Mongoose.Document {
	id: string;
}

export const LevelPluginGuild = Mongoose.model<ILevelPluginGuild>('LevelPluginGuild', levelPluginGuildSchema);

const levelPluginUserSchema = new Mongoose.Schema({
	guild_id: String,
	id: String,

	level: Number,
	experience: Number,
	totalMessages: Number,
	lastInteracted: Number
});

interface ILevelPluginUser extends Mongoose.Document {
	guild_id: ILevelPluginGuild['_id'];
	id: string;

	level: number;
	experience: number;
	totalMessages: number;
	lastInteracted: number;
}

export const LevelPluginUser = Mongoose.model<ILevelPluginUser>('LevelPluginUser', levelPluginUserSchema);

export default class LevelPlugin {
	private roles: { name: string, experience: number, total_experience: number, role: number }[] = [];
	// storage: BotStorage;
	// imgBuilder: LevelImageBuilder;
	// checkVAInterval: any;

	constructor(private config: BotConfig & { plugin: { level: LevelPluginConfig } },
		private client: Discord.Client, commands: { [command: string]: Command | CommandFn }) {
		// this.storage = storage;
		// this.imgBuilder = new LevelImageBuilder();

		let total_experience = 0;
		Object.keys(this.config.plugin.level.levels).map(m => parseInt(m)).sort((a, b) => a - b).forEach(n => {
			const role = this.config.plugin.level.levels[n.toString()];
			total_experience += role.experience;
			this.roles.push({ ...role, total_experience });
		});

		client.on('message', this.onMessage);
		commands.level = new LevelCommand(this.roles);
		commands.leaderboard = new LeaderboardCommand(this.roles);

		// this.checkVAInterval = setInterval(this.checkVoiceActivity.bind(this), 5*1000*60);
	}

	private onMessage = async (msg: Discord.Message) => {
		if (msg.author.id === this.client.user!.id) return;
		if (msg.content.substr(0, this.config.options.prefix.length + 1).toLowerCase() == this.config.options.prefix + ' ') return;

		// Completely ignore messages that are less than N characters and without a space.
		if (msg.content.length < this.config.plugin.level.message.min_length || msg.content.split(' ').length - 1 < 1) return;
		
		// Ignore DM conversations.
		if (!msg.guild) return;

		const { _id: guild_id } = await LevelPluginGuild.findOneAndUpdate({ id: msg.guild.id },
			{ $setOnInsert: { id: msg.guild.id } },
			{ upsert: true, new: true });

		const user = await LevelPluginUser.findOneAndUpdate({ id: msg.author.id, guild_id }, {
			$setOnInsert: {
				guild_id: guild_id,
				id: msg.author.id,
				experience: 0,
				level: 0,
			},
			$inc: { totalMessages: 1 }
		}, { upsert: true, new: true });

		let experience = Math.round(Math.random() + Math.min(msg.content.length / 70, 3.0) * 100) / 100;
		let thanked = false;

		// Allow people to thank the dog... allow the dog to feel emotion.
		if (this.config.plugin.level.please_and_thank_you && msg.content.toLowerCase().startsWith('good')) {
			const lastMsg = (await msg.channel.messages.fetch({ limit: 2 })).last();
			if (lastMsg && lastMsg.author.id !== this.client.user!.id) {
				if (/good.(bo[i|y]|g[u|i]rl)/gi.test(msg.content.toLowerCase())) {
					msg.reply("I'm enby tho :(");
					return;
				}
  			else if (msg.content.toLowerCase().startsWith('good dog') &&
  				(lastMsg.attachments.first()?.name || '').substring(0, msg.member!.id.length) === msg.member!.id) {
  				msg.reply('Woof!');
 		 			experience += Math.random() * 6;
 		 			thanked = true;
  			}
			}
		}

		// Ignore messages that are too recent.
		if (!thanked && (Date.now() - user.lastInteracted < this.config.plugin.level.message.cooldown * 1000)) return;

		await LevelPluginUser.findOneAndUpdate({ id: msg.author.id, guild_id }, {
			$inc: { experience },
			$set: { lastInteracted: Date.now() }
		}, { new: true });

		// for (let voice in guild.chatChannels) {
		// 	if (guild.chatChannels[voice] == msg.channel.id) {
		// 		xp /= 3;
		// 	}
		// }


		// 	const cost = (this.storage.conf.xp_properties.level_base_cost + Math.pow(user.level, this.storage.conf.xp_properties.level_multiplier));

		// 	if (user.levelXP >= cost) {
		// 		user.level++;
		// 		user.levelXP -= cost;

		// 		this.imgBuilder.generate(msg.member.displayName, user.level, msg.author.id).then(image => {
		// 			msg.channel.send("", {file: image as any}).then(() => {
		// 				fs.unlinkSync(image);
		// 			});
		// 		});

		// 		let currentRole = -1;
		// 		let previousRole = -1;

		// 		const roles: BotLevelRoles = server.getLevelRolesTable();

		// 		for (let role in roles) {
		// 			let num = parseInt(role);
		// 			if (num <= user.level && num > currentRole) currentRole = num;
		// 			if (num <= user.level - 1 && num > previousRole) previousRole = num;
		// 		}

		// 		if (currentRole != previousRole) {
		// 			if (previousRole != -1) msg.member.removeRole(msg.guild.roles.find(r => r.id == roles[previousRole]));
		// 			if (currentRole != -1) msg.member.addRole(msg.guild.roles.find(r => r.id == roles[currentRole]), 'Update user level role.');
		// 		}
		// 	}
		}

	// checkVoiceActivity(): void {
	// 	for (let guildKey in this.storage.guildData) {
	// 		let guild = this.storage.guildData[guildKey];
	// 		for (let activeVoiceChannel in guild.chatChannels) {
	// 			let channel = guild.guild.channels.get(activeVoiceChannel) as Discord.VoiceChannel;
	// 			let undeafenedUsers: number = 0;
				
	// 			channel.members.forEach((member, key) => {
	// 				if (!member.selfDeaf) undeafenedUsers++;
	// 			});

	// 			if (undeafenedUsers >= 2) {
	// 				channel.members.forEach((member, key) => {
	// 					if (!member.selfDeaf && !member.selfMute) {

	// 						let chatChannel = (guild.guild.channels.get(guild.chatChannels[activeVoiceChannel]) as Discord.TextChannel);

	// 						let server: DBServer = this.storage.db.getServer(guild.guild);
	// 						let user: DBUser = server.getUser(member);

	// 						let xp = Math.round(Math.random() + 0.3);

	// 						user.levelXP += xp;
	// 						user.totalXP += xp;

	// 						const cost = (this.storage.conf.xp_properties.level_base_cost + Math.pow(user.level, this.storage.conf.xp_properties.level_multiplier));

	// 						if (user.levelXP >= cost) {
	// 							user.level++;
	// 							user.levelXP -= cost;

	// 							if (chatChannel) {
	// 								this.imgBuilder.generate(member.displayName, user.level, member.id).then(image => {
	// 									chatChannel.send("", {file: image as any}).then(() => {
	// 										fs.unlinkSync(image);
	// 									});
	// 								});
	// 							}

	// 							let currentRole = -1;
	// 							let previousRole = -1;

	// 							const roles: BotLevelRoles = server.getLevelRolesTable();

	// 							for (let role in roles) {
	// 								let num = parseInt(role);
	// 								if (num <= user.level && num > currentRole) currentRole = num;
	// 								if (num <= user.level - 1 && num > previousRole) previousRole = num;
	// 							}

	// 							if (currentRole != previousRole) {
	// 								if (previousRole != -1) member.removeRole(member.guild.roles.find(r => r.id == roles[previousRole]));
	// 								if (currentRole != -1) member.addRole(member.guild.roles.find(r => r.id == roles[currentRole]), 'Update user level role.');
	// 							}
	// 						}
						
	// 						server.pushUser(user);
	// 					}
	// 				});
	// 			}
	// 		}
	// 	}
	// }
}
