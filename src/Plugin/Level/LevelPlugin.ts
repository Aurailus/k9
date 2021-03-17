import log4js from 'log4js';
import { promises as fs } from 'fs';
import * as Mongoose from 'mongoose';
import * as Discord from 'discord.js';

import * as Calc from './Calc';
import { BotConfig } from '../../Bot';
import { Command, CommandFn } from '../../Commands/Command';

import LevelCommand from './LevelCommand';
import buildLevelImage from './BuildLevelImage';
import LeaderboardCommand from './LeaderboardCommand';

const logger = log4js.getLogger();

export interface ExperienceConfig {
	a: number,
	b: number,
	c: number
}

export interface Role {
	role: string;
	level: number;
}

export interface LevelPluginConfig {
	please_and_thank_you: boolean;
	experience: ExperienceConfig;
	roles: Role[];
	message: {
		cooldown: number;
		min_length: number;
	}
}

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

	experience: Number,
	totalMessages: Number,
	lastInteracted: Number
});

interface ILevelPluginUser extends Mongoose.Document {
	guild_id: ILevelPluginGuild['_id'];
	id: string;

	experience: number;
	totalMessages: number;
	lastInteracted: number;
}

export const LevelPluginUser = Mongoose.model<ILevelPluginUser>('LevelPluginUser', levelPluginUserSchema);

export default class LevelPlugin {
	constructor(private config: BotConfig & { plugin: { level: LevelPluginConfig } },
		private client: Discord.Client, commands: { [command: string]: Command | CommandFn }) {

		client.on('message', this.onMessage);
		commands.level = new LevelCommand(config.plugin.level);
		commands.leaderboard = new LeaderboardCommand(config.plugin.level);

		// Loads all users from the classic LowDB.
		// (async () => {
		// 	await LevelPluginUser.deleteMany({});
		// 	let f = JSON.parse((await fs.readFile('./data/db.json')).toString());
		// 	await Promise.all(f.servers[0].users.map(async ({ id, totalXP, messages }: any) => {
		// 		const { _id: guild_id } = (await LevelPluginGuild.findOneAndUpdate({}))!;
		// 		await LevelPluginUser.create({
		// 			experience: totalXP,
		// 			totalMessages: messages,
		// 			guild_id: guild_id,
		// 			id: id,
		// 		});
		// 	}));
		// })();

		// Refreshes all user roles.
		// (async () => {
		// 	this.client.guilds.cache.forEach(async guild => {
		// 		let members = await guild.members.fetch();
		// 		members.forEach(member => this.updateMember(member));
		// 	});
		// })()
	}

	private onMessage = async (msg: Discord.Message) => {
		if (msg.author.bot) return;
		if (msg.content.substr(0, this.config.options.prefix.length + 1).toLowerCase() === this.config.options.prefix + ' ') return;
		
		// Ignore DM conversations.
		if (!msg.guild) return;

		const { _id: guild_id } = await LevelPluginGuild.findOneAndUpdate({ id: msg.guild.id },
			{ $setOnInsert: { id: msg.guild.id } }, { upsert: true, new: true });

		const user = await LevelPluginUser.findOneAndUpdate({ id: msg.author.id, guild_id }, {
			$setOnInsert: { guild_id, id: msg.author.id, experience: 0 },
			$inc: { totalMessages: 1 }
		}, { upsert: true, new: true });

		let experience = Math.round(Math.random() + Math.min(msg.content.length / 70, 3.0) * 100) / 100;
		let thanked = false;

		// Allow people to thank the dog... allow the dog to feel emotion.
		if (this.config.plugin.level.please_and_thank_you && msg.content.toLowerCase().startsWith('good')) {
			const lastMsg = (await msg.channel.messages.fetch({ limit: 2 })).last();
			if (lastMsg && lastMsg.author.id === this.client.user!.id) {
				if (/good.(bo[i|y]|g[u|i]rl)/gi.test(msg.content.toLowerCase())) {
					msg.reply('I\'m enby tho :(');
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

		// Completely ignore messages that are less than N characters and without a space.
		if (!thanked && (msg.content.length < this.config.plugin.level.message.min_length || msg.content.split(' ').length - 1 < 1)) return;

		// Ignore messages that are too recent.
		if (!thanked && (Date.now() - user.lastInteracted < this.config.plugin.level.message.cooldown * 1000)) return;

		const newUser = (await LevelPluginUser.findOneAndUpdate({ id: msg.author.id, guild_id }, {
			$inc: { experience },
			$set: { lastInteracted: Date.now() }
		}, { new: true }))!;

		// Award user if they cross a level boundary.
		if (Calc.xpToLevel(this.config.plugin.level, user.experience) !==
			Calc.xpToLevel(this.config.plugin.level, newUser.experience)) {
			try {
				await this.updateMember(msg.member!);
				let image = await buildLevelImage(msg.member!.displayName,
					Calc.xpToLevel(this.config.plugin.level, newUser.experience), msg.author.id);
				await msg.channel.send('', { files: [ image ] });
				await fs.unlink(image);
			}
			catch (e) { logger.error(e); }
		}
	}

	public async updateMember(member: Discord.GuildMember) {
		const user = (await LevelPluginUser.findOne({ id: member.id })) ?? { experience: 0 };
		let desiredRole = Calc.xpToRole(this.config.plugin.level, user.experience);
		this.config.plugin.level.roles.map(r => r.role).forEach(role => {
			if (member.roles.cache.has(role)) {
				if (role !== desiredRole) member.roles.remove(role);
			}
			else {
				if (role === desiredRole) member.roles.add(role);
			}
		});
	}
}
