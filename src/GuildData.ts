import * as Discord from 'discord.js';

export class GuildData {
	guild: Discord.Guild;
	chatChannels: {[key: string]: Discord.Snowflake} = {};

	constructor(guild: Discord.Guild) {
		this.guild = guild;
	}
}
