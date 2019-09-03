import * as Discord from 'discord.js';

import {BotStorage} from "../BotStorage";
import {GuildData} from "../GuildData"

export class VoiceTextChannels {
	client: Discord.Client;
	storage: BotStorage;

	PREFIX = "**Temporary discussion for ";
	SUFFIX = ".** Screen share link: "

	constructor(client: Discord.Client, storage: BotStorage) {
		this.client = client;
		this.storage = storage;

		client.on("voiceStateUpdate", (om, nm) => this.voiceStateUpdate(om, nm));
	}

	voiceStateUpdate(oldMember: Discord.GuildMember, member: Discord.GuildMember): void {		
		let guild: GuildData = this.storage.getGuild(member.guild);

		if (member.voiceChannel && member.voiceChannel.parent) {
			if (member.voiceChannel.members.size == 1) {
				let link = `**https://discordapp.com/channels/${member.guild.id}/${member.voiceChannelID}**`

				member.guild.createChannel(member.voiceChannel.name.replace(/[\W_]+/g,"-") + "-chat", {
					type: `text`,
					topic: `${this.PREFIX}<#${member.voiceChannelID}>${this.SUFFIX}${link}`,
					parent: member.voiceChannel.parent
				}).then((channel: Discord.TextChannel) => {
					guild.voiceTextChannels[member.voiceChannelID] = channel;
					channel.send("https://cdn.discordapp.com/attachments/618247443158532098/618254905966329885/suru2tgf87k31.png");
				}).catch((e) => {/*Channel was deleted before the promise callback*/});
			}
		}
		if (oldMember.voiceChannel && oldMember.voiceChannel.parent) {
			if (oldMember.voiceChannel.members.size == 0) {
				let channel = guild.voiceTextChannels[oldMember.voiceChannelID];
				if (channel) channel.delete()
				.catch((e) => {/*Channel was deleted already*/})
				.finally(() => {
					delete guild.voiceTextChannels[oldMember.voiceChannelID];
				});
			}
		}
	}

	cleanup(): void {
		//TODO: Clean up open text channels

		// for (let key in this.storage.guildData) {
		// 	let guild: GuildData = this.storage.guildData[key];
		// 	for (let key in guild.voiceTextChannels) {
		// 		let channel: Discord.TextChannel = guild.voiceTextChannels[key];
		// 		channel.delete();
		// 	}
		// }
	}
}
