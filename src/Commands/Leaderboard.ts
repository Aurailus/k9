import * as Discord from 'discord.js';

import {Command} from "./Command"
import {BotStorage} from "../BotStorage";
import {BotLevelRoles, Database, DBServer, DBUser} from "../Database";

export class Leaderboard extends Command {
	constructor(client: Discord.Client, storage: BotStorage) {
		super(client, storage);
		this.prefix += "leaderboard";
	}

	exec(msg: Discord.Message) {
		if (!msg.guild) {
			super.sendErrorMessage(msg, "This command must be called from within a server.");
			return;
		}

		let server: DBServer = this.storage.db.getServer(msg.guild);
		// let user: DBUser = server.getUser(msg.member);

	  let users: DBUser[] = this.storage.db.getServer(msg.guild).getTopUsers();

		const embed = new Discord.RichEmbed()
		  .setAuthor("Leaderboard", "https://i.imgur.com/LaPvO6n.png")
		  .setColor("#FFAC38")
		  .setDescription(`The most active members in ${msg.guild.name}.`)
		  .setFooter(`Requested by ${msg.member.displayName}`, msg.author.avatarURL)
		  .setTimestamp()

			.addBlankField();

	  for (let i = 0; i < users.length; i++) {
	  	const user = msg.guild.members.get(users[i].id);
	  	let name = "Removed";
	  	if (user) name = user.displayName;
	  	if (name.length >= 20) name = name.substr(0, 18) + "...";
	  	embed.addField(
	  		`⠀${i < 3 ? "**" : ""}${i + 1}) ${name}${i < 3 ? "**" : ""}`, 
	  		`⠀Level ${users[i].level} • ${Math.floor(users[i].totalXP)} XP`, true);
	  }
		
		embed.addBlankField();

	  msg.channel.send({embed}).catch(e => {/*Missing send message permissions for the channel*/});
	  super.deleteTrigger(msg);
	}
}
