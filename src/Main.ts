const fs = require('fs').promises;
const c = require('ansi-colors');

import * as Discord from 'discord.js';

import {BotConf} from "./BotConf";
import {Bot} from "./Bot";

export function getFatalCallback(prefix: string, exit: boolean = true) {
	return function(err: Error) {
		console.error(c.bgRed.bold.white(`[${prefix}] A fatal error has occured:\n${err.toString()}.\n`));
		if (exit) process.exit(0);
	}
}

function start() {
	fs.access("./data").then(() => {
		return fs.access("./data/conf.json");
	}).then(() => {
		return fs.readFile("./data/conf.json");
	}).then((resp: Buffer) => {
		try {
			const conf: BotConf = JSON.parse(resp.toString());
			let bot = new Bot(conf);
			return bot.connect();
		}
		catch(e) { getFatalCallback("Conf Parsing")(e); }
	}).then((bot: Bot) => {
		return bot.bindFunctions();
	}).then((bot: Bot) => {
		process.on('SIGINT', async () => {
			await bot.shutDown();
			process.exit();
		});
	}).catch(getFatalCallback("Main.ts"));
}

start();
