import * as Discord from 'discord.js';

import { LevelPluginGuild, LevelPluginUser } from './LevelPlugin';

const MAX_XP = 1000000;

export default async function SetExperience(msg: Discord.Message, _: string, args: string[]) {
	let xp = Number.parseInt(args[0]);
	if (Number.isNaN(xp) || xp < 0 || xp > MAX_XP) return;

	if (!msg.guild) return;
	const guild = await LevelPluginGuild.findOne({ id: msg.guild.id });
	if (!guild) return;
	const user = (await LevelPluginUser.findOne({ guild_id: guild._id, id: msg.author.id }));
	if (!user) return;
	user.experience = xp;
	await user.save();
}
