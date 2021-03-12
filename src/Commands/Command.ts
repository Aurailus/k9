import * as Discord from 'discord.js';

export type CommandFn = (msg: Discord.Message, command: string, args: string[]) => void;

export interface Command {
	trigger: CommandFn;
}
