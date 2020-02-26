import * as Discord from 'discord.js';

import {Command} from "./Command"
import {BotStorage} from "../BotStorage";

export class Help extends Command {
	constructor(client: Discord.Client, storage: BotStorage) {
		super(client, storage);
		this.prefix += "help";
	}

	exec(msg: Discord.Message) {
		const embed = new Discord.RichEmbed()
		  .setAuthor("K9 Help", "https://cdn.discordapp.com/avatars/613569990297255938/13a0f7a3818feaa9cbc173f54b30eb9c.png?size=128")
		  .setColor("#EE86ED")
		  .setDescription(
		  	`Hi, I'm k9! I'm a user level tracking bot made by Aurailus#4014. ` +
		  	`I assign users levels and automagically grants users roles once they reach certain level thresholds. ` +
		  	`I also have a few simple commands available to interact with me.`)
		  .setFooter(`Requested by ${(msg.member) ? msg.member.displayName : msg.author.username}`, msg.author.avatarURL)
		  .setTimestamp()

		  .addField("⠀`k9 help`", `⠀Sends this message.`)
		  .addField("⠀`k9 level`", `⠀Displays your level, XP, and rank.`)
		  .addField("⠀`k9 leaderboard`", `⠀Shows the top ranked users in the current server.`)
		  .addField("⠀`k9 haystack`", `⠀Runs an attached image through haystack.ai to determine various statistics.`)

	  msg.channel.send({embed}).catch((e) => {/*Missing send message permissions for the channel*/});
	  super.deleteTrigger(msg);
	}
}
