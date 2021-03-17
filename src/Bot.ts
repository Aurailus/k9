import Mongoose from 'mongoose';
import * as Discord from 'discord.js';

import LevelPlugin from './Plugin/Level/LevelPlugin';
import VoiceChatPlugin from './Plugin/VoiceChat/VoiceChatPlugin';

import { Command, CommandFn } from './Commands/Command';
import Help from './Commands/Help';

import log4js from 'log4js';

const logger = log4js.getLogger();

export interface BotConfig {
	auth: {
		discord: string;
		mongo_url: string;
	};

	options: {
		status: string
		prefix: string;
		delete_triggers: boolean;
	}

	plugin: {
		level?: {
			please_and_thank_you: boolean;
			message: {
				cooldown: number;
				min_length: number;
			},
			levels: {
				[num: string]: {
					name: string;
					experience: number;
					role: number;
				}
			}
		}
	}
}

export default class Bot {
	private config: BotConfig;
	private client: Discord.Client;

	private plugins: any[] = [];
	private commands: { [command: string]: Command | CommandFn } = {};

	constructor(config: BotConfig) {
		this.config = config;
		const intents = new Discord.Intents(Discord.Intents.NON_PRIVILEGED);
		intents.add('GUILD_MEMBERS');
		this.client = new Discord.Client({ ws: { intents }});
	}


	/**
	 * Initializes the connection to discord, and binds a shutdown handler.
	 *
	 * @returns the bot, once initialization is complete.
	 */

	async init(): Promise<this> {
		await this.connect();
		await this.bind();

		process.on('SIGINT', () => this.onInterrupt().then(() => process.exit()));
		
		return this;
	}


	/**
	 * Attempts to connect the client to discord, and sets its status to online.
	 *
	 * @returns a promise indicating the success state of the connection.
	 */

	private async connect() {
		await new Promise((resolve, reject) => {
			Mongoose.connect(this.config.auth.mongo_url, { useNewUrlParser: true, useUnifiedTopology: true });
			Mongoose.set('useFindAndModify', false);
			Mongoose.connection.on('error', reject);
			Mongoose.connection.once('open', resolve);
		});

		await new Promise((resolve, reject) => {
			this.client.login(this.config.auth.discord);
			this.client.on('error', reject);
			this.client.once('ready', () => {
				const user = this.client.user as Discord.ClientUser;
				user.setPresence({
					status: 'online',
					activity: { name: this.config.options.status, type: 'CUSTOM_STATUS' }
				});
				logger.info('Successfully connected as %s.', user.tag);
				resolve(this);
			});
		});
	}


	/**
	 * Binds plugins to the bot.
	 */

	private bind() {
		this.plugins.push(new LevelPlugin(this.config as any, this.client, this.commands));
		this.plugins.push(new VoiceChatPlugin(this.config as any, this.client));

		this.commands.help = Help;

		this.client.on('message', (msg) => {
			if (!msg.content.startsWith(this.config.options.prefix + ' ')) return;
			const full = msg.content.substr(this.config.options.prefix.length + 1).trim();
			const command = full.substr(0, full.indexOf(' ') === -1 ? full.length : full.indexOf(' ')).toLowerCase().trimLeft();
			const args = full.substr(command.length).trimLeft().split(' ');
			const cmd = this.commands[command];

			if (cmd !== undefined) {
				if (this.config.options.delete_triggers) msg.delete();
				if (typeof cmd === 'function') cmd(msg, command, args);
				else if (typeof cmd === 'object') cmd.trigger(msg, command, args);
			}
		});
	}


	/**
	 * Performs cleanup activities. Bound to SIGINT after the bot has been set up.
	 */

	private async onInterrupt() {
		try {
			await Promise.all(this.plugins.map(async p => p.cleanup?.()));
			logger.info('Shut down successfully.');
		}
		catch (e) {
			logger.fatal('Error shutting down k9:\n%s', e);
		}
	}
}
