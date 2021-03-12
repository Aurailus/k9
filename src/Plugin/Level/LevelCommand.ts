import * as Discord from 'discord.js';

import { LevelPluginGuild, LevelPluginUser } from './LevelPlugin';

export default class LevelCommand {
	constructor(private roles: { name: string, experience: number, total_experience: number, role: number }[]) {}

	async trigger(msg: Discord.Message) {
		if (!msg.guild) return;
		const guild = await LevelPluginGuild.findOne({ id: msg.guild.id });
		if (!guild) return;
		const user = (await LevelPluginUser.findOne({ guild_id: guild._id, id: msg.author.id })) ??
			{ experience: 0, level: 0 };

		let currentRole = null;
		for (let role of this.roles) {
			if (role.total_experience < user.experience) currentRole = role;
			else break;
		}
		const nextRole = currentRole ? this.roles[this.roles.indexOf(currentRole) + 1] : this.roles[0];

		msg.channel.send({
			embed: new Discord.MessageEmbed()
				.setAuthor("My Level", "https://i.imgur.com/Nqyb94h.png")
			  .setColor("#15B5A6")
			  .setDescription(`Statistics for ${msg.member!.displayName} in ${msg.guild!.name}.`)
			  .setFooter(`Requested by ${msg.member!.displayName}`, msg.author.avatarURL({ size: 16 })!)
			  .setTimestamp()

			  .addField(`⠀Level`, `⠀${user.level}`, true)
			  .addField(`⠀Experience`, 		`⠀${Math.floor(user.experience - (currentRole?.total_experience ?? 0))} ` +
			  	(nextRole ? '/ ' + nextRole.experience : ''), true)
			  .addField(`⠀Rank`, 	`⠀${currentRole ? currentRole.name : 'Potato'}`, true)
		}).catch(_ => { /* Missing send permissions. */ });
	}
}
