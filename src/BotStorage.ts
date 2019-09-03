import * as Discord from 'discord.js';

import {BotConf} from "./BotConf";
import {GuildData} from "./GuildData";
import {Database} from "./Database";

export class BotStorage {
	db: Database;
	conf: BotConf;
	guildData: {[key: string]: GuildData} = {};

	constructor(conf: BotConf) {
		this.conf = conf;
	}

	getGuild(guild: Discord.Guild): GuildData {
		if (!this.guildData[guild.id]) {
			this.guildData[guild.id] = new GuildData(guild);
		}
		return this.guildData[guild.id];
	}
}
