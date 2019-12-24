import * as Discord from 'discord.js';

import {BotStorage} from "../BotStorage";
import {GuildData} from "../GuildData";

export class ChatChannels {
	client: Discord.Client;
	storage: BotStorage;

	PREFIX = "**Temporary discussion for ";
	SUFFIX = ".** Screen share link: "

	constructor(client: Discord.Client, storage: BotStorage) {
		this.client = client;
		this.storage = storage;

		client.on("voiceStateUpdate", (om, nm) => this.voiceStateUpdate(om, nm));

		this.client.guilds.forEach((guild, guildKey) => {
			let guildData = this.storage.getGuild(guild);
			guild.channels.forEach((channel, channelKey) => {
				if (channel.type == "voice") {
					if ((channel as Discord.VoiceChannel).members.size >= 1) {
						this.createChatChannel(channel as Discord.VoiceChannel, guildData);
					}
				}
			});
		})
	}

	voiceStateUpdate(oldMember: Discord.GuildMember, member: Discord.GuildMember): void {		
		let guild: GuildData = this.storage.getGuild(member.guild);

		if (member.voiceChannel == oldMember.voiceChannel) return;

		if (member.voiceChannel && member.voiceChannel.parent) {
			if (member.voiceChannel.members.size == 1) {
				this.createChatChannel(member.voiceChannel, guild);
			}
		}

		if (oldMember.voiceChannel && oldMember.voiceChannel.parent) {
			if (oldMember.voiceChannel.members.size == 0) {
				let channelId = guild.chatChannels[oldMember.voiceChannelID];
				if (oldMember.client.channels.get(channelId)) oldMember.client.channels.get(channelId).delete()
				.catch((e) => {/*Channel was already deleted*/})
				.finally(() => {
					delete guild.chatChannels[oldMember.voiceChannelID];
				});
			}
		}
	}

	createChatChannel(voiceChannel: Discord.VoiceChannel, guild: GuildData) {
		let link = `https://discordapp.com/channels/${voiceChannel.guild.id}/${voiceChannel.id}`
		let channelName = voiceChannel.name.replace(/[\W_]+/g,"-") + "-chat";

		voiceChannel.guild.createChannel(channelName, {
			type: `text`,
			topic: `${this.PREFIX}<#${voiceChannel.id}>${this.SUFFIX}**${link}**`,
			parent: voiceChannel.parent
		}).then((channel: Discord.TextChannel) => {
			guild.chatChannels[voiceChannel.id] = channel.id;

			const embed = new Discord.RichEmbed()
			  .setAuthor(channelName, "https://i.imgur.com/vitVUtr.png")
			  .setColor("#EE86ED")
			  .setDescription(
			  	`This is a temporary discussion channel for ${channelName}!\n` +
			  	`This channel will be automatically deleted when everybody leaves the voice channel.\n` +
			  	`[Group-chat-style screen share link.](${link})`)
			  .setTimestamp()

		  channel.send({embed}).catch((e) => {/*Missing send message permissions for the channel*/});

		}).catch((e) => {/*Channel was deleted before the promise callback*/});
	}

	async cleanup() {
		for (let key in this.storage.guildData) {
			let guild: GuildData = this.storage.guildData[key];
			for (let key in guild.chatChannels) {
				let chat = guild.chatChannels[key];
				await guild.guild.channels.get(chat).delete().catch(e => {/*Channel was already deleted*/});
			}
		}
	}
}
