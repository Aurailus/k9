import * as Discord from 'discord.js';

import {BotStorage} from "../BotStorage";

export class Command {
	client: Discord.Client;
	storage: BotStorage;
	prefix: string;

	constructor(client: Discord.Client, storage: BotStorage) {
		this.client = client;
		this.storage = storage;
		this.prefix = storage.conf.command_prefix + " ";
	}

	exec(msg: Discord.Message) {/*Virtual Method*/}

	deleteTrigger(msg: Discord.Message) {
		if (this.storage.conf.delete_triggers) {
			msg.delete().catch((e) => this.sendErrorMessage(msg, e));
		}
	}

	sendErrorMessage(msg: Discord.Message, e: Discord.DiscordAPIError | string) {
		const embed = new Discord.RichEmbed()
		  .setAuthor("Error", "https://i.imgur.com/qSHm1lQ.png")
		  .setColor("#D60058")
		  .setFooter(`Requested by ${(msg.member) ? msg.member.displayName : msg.author.username}`, msg.author.avatarURL)
		  .setTimestamp();

		if (typeof e == "string") {
			embed.setDescription(e);
		}
		else {
		  embed.setDescription(`An unknown error occured: ${e.message}`)
			switch (e.message) {
				case "Missing Permissions": {
					embed.setDescription(`\`delete_triggers\` is set to true, but the bot does not have the \`Manage Messages\` permission.`);
				}
				case "Cannot execute action on a DM channel": {
					return;
				}
			}
		}

	  msg.channel.send({embed}).catch((e) => {/*Missing send message permissions for the channel*/});
	}
}
