import * as Discord from 'discord.js';

import * as Calc from './Calc';
import { LevelPluginGuild, LevelPluginUser, ExperienceConfig, LevelRole } from './LevelPlugin';

const PROGRESS_SEGMENTS = 17;
const PROGRESS_FULL = "█";
const PROGRESS_EMPTY = "░";

export default class LevelCommand {
	constructor(private experience: ExperienceConfig, private roles: LevelRole[]) {}

	async trigger(msg: Discord.Message) {
		if (!msg.guild) return;
		const guild = await LevelPluginGuild.findOne({ id: msg.guild.id });
		if (!guild) return;
		const user = (await LevelPluginUser.findOne({ guild_id: guild._id, id: msg.author.id })) ?? { experience: 0, level: 0 };

		let currentLevel = Calc.xpToLevel(this.experience, user.experience);
		let inLevel = Calc.xpInLevel(this.experience, currentLevel);
		let levelXp = user.experience - Calc.levelToXp(this.experience, currentLevel);

		let progress = "║ ";
		let amt = Math.floor(levelXp / inLevel * PROGRESS_SEGMENTS);
		for (let i = 0; i < amt; i++) progress += PROGRESS_FULL;
		for (let i = amt; i < PROGRESS_SEGMENTS; i++) progress += PROGRESS_EMPTY;
		progress += " ║";

		let roleID = "";
		for (let role of this.roles) {
			if (role.totalExperience <= user.experience) roleID = role.id;
			else break;
		}
		let role = roleID ? (await msg.guild.roles.fetch(roleID))!.name : "Potato";

		let embed = new Discord.MessageEmbed()
			.setAuthor("My Level", "https://i.imgur.com/Nqyb94h.png")
			.setColor("#15B5A6")
			.setDescription(`Statistics for ${msg.member!.displayName} in ${msg.guild!.name}.`)
			.setFooter(`Requested by ${msg.member!.displayName}`, msg.author.avatarURL({ size: 16 })!)
			.setTimestamp()

			.addField(`⠀Level`, `⠀${currentLevel}`, true)
			.addField(`⠀Experience`, 		`⠀${Math.round(user.experience)}`, true)
			.addField(`⠀Rank`, 	`⠀${role}`, true)
			.addField(`⠀Level Progress⠀⠀⠀⠀⠀⠀ ${Math.round(levelXp)} / ${Math.round(inLevel)}`, `⠀${progress}`, false);

		msg.channel.send({ embed }).catch(_ => { /* Missing send permissions. */ });
	}
}
