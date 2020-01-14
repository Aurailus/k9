const c = require('ansi-colors');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

import * as Discord from 'discord.js';

import {getFatalCallback} from './Main';
import {BotConf} from "./BotConf";
import {BotStorage} from "./BotStorage";
import {Database} from "./Database";

import {Command} from "./Commands/Command";
import {ChatChannels} from "./Modules/ChatChannels";
import {Leveller} from "./Modules/Leveller";

import {Help} from "./Commands/Help";
import {Level} from "./Commands/Level";
import {Haystack} from "./Commands/Haystack";
import {Leaderboard} from "./Commands/Leaderboard";

export class Bot {
	config: BotConf;
	client: Discord.Client;
	storage: BotStorage;

	chatChannels: ChatChannels;
	leveller: Leveller;

	commands: Command[] = [];

	constructor(config: BotConf) {
		this.config = config;
		this.client = new Discord.Client();
		this.storage = new BotStorage(config);

		const adapter = new FileSync('./data/db.json');
		this.storage.db = new Database(low(adapter));
	}

	connect(): Promise<Bot> {
		return new Promise((resolve, reject) => {
			this.client.login(this.config.token);

			this.client.on('ready', () => {
				console.log(`Successfully connected as ${c.cyan(this.client.user.tag)}.`);
				console.log(`Version 1.0.1`);
				this.client.user.setActivity(this.config.playing_tag.message, {type: this.config.playing_tag.type});
				this.client.user.setStatus('online');
				resolve(this);
			});

			this.client.on('error', (error: Error) => {
				reject(error);
			});

			this.client.on('message', (msg) => {
				for (let command of this.commands) {
					if (msg.content.substr(0, command.prefix.length).toLowerCase() == command.prefix.toLowerCase()) {
						command.exec(msg);
						return;
					}
				}
			})
		});
	}

	bindFunctions(): Promise<Bot> {
		return new Promise((resolve, reject) => {
			try {
				this.chatChannels = new ChatChannels(this.client, this.storage);
				this.leveller = new Leveller(this.client, this.storage);

				this.commands.push(new Help(this.client, this.storage));
				this.commands.push(new Level(this.client, this.storage));
				this.commands.push(new Haystack(this.client, this.storage));
				this.commands.push(new Leaderboard(this.client, this.storage));

				resolve(this);
			}
			catch (e) { reject(e); }
		});
	}

	async shutDown() {
		try {
			await this.chatChannels.cleanup();
			await this.leveller.cleanup();

			console.log(`Shut down gracefully.`);
		}
		catch (e) {
			getFatalCallback("Shutdown")(e);
		}
	}
}
