import * as Discord from 'discord.js';

export class BotConf {
	token: string;
	playing_tag: {
		type: Discord.ActivityType,
		message: string
	};
	command_prefix: string;
	delete_triggers: boolean;
	xp_properties: {
		level_base_cost: number, 
		level_multiplier: number
	};
}
