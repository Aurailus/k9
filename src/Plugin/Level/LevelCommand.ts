import * as Discord from 'discord.js';

import * as Calc from './Calc';
import { LevelPluginGuild, LevelPluginUser, LevelPluginConfig } from './LevelPlugin';

const PROGRESS_SEGMENTS = 15;
const PROGRESS_FULL = '▇';
const PROGRESS_EMPTY = '▁';

export default class LevelCommand {
	constructor(private config: LevelPluginConfig) {}

	async trigger(msg: Discord.Message) {
		if (!msg.guild) return;
		const guild = await LevelPluginGuild.findOne({ id: msg.guild.id });
		if (!guild) return;
		const user = (await LevelPluginUser.findOne({ guild_id: guild._id, id: msg.author.id })) ?? { experience: 0, level: 0 };

		const currentLevel = Calc.xpToLevel(this.config, user.experience);
		const inLevel = Calc.xpInLevel(this.config, currentLevel + 1);
		const levelXp = user.experience - Calc.levelToXp(this.config, currentLevel);

		let progress = '「 ';
		let amt = Math.floor(levelXp / inLevel * PROGRESS_SEGMENTS);
		for (let i = 0; i < amt; i++) progress += PROGRESS_FULL;
		for (let i = amt; i < PROGRESS_SEGMENTS; i++) progress += PROGRESS_EMPTY;
		progress += ' 」';
		const percentage = `${Math.round(levelXp)} / ${Math.round(inLevel)}`;
		let spaces = "";
		for (let i = 0; i < 14 - percentage.length * 0.75; i++) spaces += "⠀";
		const roleID = Calc.levelToRole(this.config, currentLevel);
		const role = roleID ? (await msg.guild.roles.fetch(roleID))!.name : 'Potato';

		const embed = new Discord.MessageEmbed()
			.setAuthor(`${msg.member!.displayName}'s Level`, 'https://i.imgur.com/Nqyb94h.png')
			.setColor('#15B5A6')
			.setDescription('')
			.setFooter(`${msg.member!.displayName}`, msg.author.avatarURL({ size: 16 })!)
			.setTimestamp()

			.addField(`⠀Level Progress${spaces}${percentage}`, `${progress}`, false)
			.addField(`⠀${currentLevel}`, `⠀Level`, true)
			.addField(`⠀${Math.round(user.experience)}`, `⠀Experience`, true)
			.addField(`⠀${role}`, `⠀Role`, true);

		msg.channel.send({ embed }).catch(_ => { /* Missing send permissions. */ });
	}
}
