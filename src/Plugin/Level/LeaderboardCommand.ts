import * as Discord from 'discord.js';
import { LevelPluginGuild, LevelPluginUser } from './LevelPlugin';

export default class LevelCommand {
	constructor(private roles: { name: string, experience: number, total_experience: number, role: number }[]) {}

	async trigger(msg: Discord.Message) {
		if (!msg.guild) return;
		const guild = await LevelPluginGuild.findOne({ id: msg.guild.id });
		if (!guild) return;

		const users = (await LevelPluginUser.find({ guild_id: guild._id }).sort({ level: 'desc' }).limit(12)).filter(u => u.id);

		const embed = new Discord.MessageEmbed()
			.setAuthor("Leaderboard", "https://i.imgur.com/LaPvO6n.png")
			.setColor("#FFAC38")
			.setDescription(`The most active members in ${msg.guild.name}.`)
			.setFooter(`Requested by ${msg.member!.displayName}`, msg.author.avatarURL({ size: 32 })!)
			.setTimestamp();

		for (let i = 0; i < users.length; i++) {
			try {
				let name = (await msg.guild.members.fetch(users[i].id ?? "0")).displayName;
				let currentRole = null;
				for (let role of this.roles) {
					if (role.total_experience < users[i].experience) currentRole = role;
					else break;
				}

				if (name.length >= 20) name = name.substr(0, 18) + "...";
				embed.addField(
					`⠀${i < 3 ? "**" : ""}${i + 1}) ${name}${i < 3 ? "**" : ""}`,
					`⠀Level ${currentRole?.name ?? 'Potato'} • ${Math.floor(users[i].experience ?? 0)} XP`, true);
			}
			catch (e) {}
		}
		
		msg.channel.send({ embed }).catch(_ => { /* Missing send permissions. */ });
	}
}
