import log4js from 'log4js';
import * as Discord from 'discord.js';

import * as Calc from './Calc';
import { LevelPluginGuild, LevelPluginUser, LevelPluginConfig } from './LevelPlugin';

const logger = log4js.getLogger();

export default class LevelCommand {
	constructor(private config: LevelPluginConfig) {}

	async trigger(msg: Discord.Message) {
		if (!msg.guild) return;
		const guild = await LevelPluginGuild.findOne({ id: msg.guild.id });
		if (!guild) return;

		const users = (await LevelPluginUser.find({ guild_id: guild._id }).sort({ experience: 'desc' }).limit(15)).filter(u => u.id);

		const embed = new Discord.MessageEmbed()
			.setAuthor('Leaderboard', 'https://i.imgur.com/LaPvO6n.png')
			.setColor('#FFAC38')
			.setDescription(`The most active members in ${msg.guild.name}.`)
			.setFooter(`${msg.member!.displayName}`, msg.author.avatarURL({ size: 32 })!)
			.setTimestamp();

		for (let i = 0; i < users.length; i++) {
			try {
				let name = (await msg.guild.members.fetch(users[i].id)).displayName;
				if (name.length >= 20) name = name.substr(0, 18) + '...';
				const level = Calc.xpToLevel(this.config, users[i].experience);

				embed.addField(`⠀${i + 1}) ${name}${i < 3 ? ' :sparkles:' : ''}`,
					`⠀Level ${level} • ${Math.floor(users[i].experience)} XP`, true);
			}
			catch (e) { logger.error(e); }
		}
		
		msg.channel.send({ embed }).catch(_ => { /* Missing send permissions. */ });
	}
}
