import * as Discord from 'discord.js';

import {Command} from "./Command"
import {BotStorage} from "../BotStorage";
import {BotLevelRoles, Database, DBServer, DBUser} from "../Database";

export class Level extends Command {
	constructor(client: Discord.Client, storage: BotStorage) {
		super(client, storage);
		this.prefix += "level";
	}

	exec(msg: Discord.Message) {
		if (!msg.guild) {
			super.sendErrorMessage(msg, "This command must be called from within a server.");
			return;
		}

		let server: DBServer = this.storage.db.getServer(msg.guild);
		let user: DBUser = server.getUser(msg.member);

		const cost = (this.storage.conf.xp_properties.level_base_cost + Math.pow(user.level, this.storage.conf.xp_properties.level_multiplier));

		let currentRole = -1;

		const roles = server.getLevelRolesTable();
		for (let role in roles) {
			let num = parseInt(role);
			if (num <= user.level && num > currentRole) currentRole = num;
		}

		let role = (currentRole == -1) ? "Potato" : msg.guild.roles.find(r => r.id == roles[currentRole]).name;

		const embed = new Discord.RichEmbed()
		  .setAuthor("My Level", "https://i.imgur.com/Nqyb94h.png")
		  .setColor("#15B5A6")
		  .setDescription(`Statistics for ${msg.member.displayName} in ${msg.guild.name}.`)
		  .setFooter(`Requested by ${msg.member.displayName}`, msg.author.avatarURL)
		  .setTimestamp()

		  .addField(`⠀Level`, `⠀${user.level}`, true)
		  .addField(`⠀XP`, 		`⠀${Math.floor(user.levelXP)} / ${Math.ceil(cost)}`, true)
		  .addField(`⠀Rank`, 	`⠀${role}`, true)

	  msg.channel.send({embed}).catch(e => {/*Missing send message permissions for the channel*/});
	  super.deleteTrigger(msg);
	}
}
