import * as Discord from 'discord.js';

export class GuildData {
	guild: Discord.Guild;
	voiceTextChannels: {[key: string]: Discord.TextChannel} = {};

	constructor(guild: Discord.Guild) {
		this.guild = guild;
	}
}
