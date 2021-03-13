import * as Discord from 'discord.js';

import { BotConfig } from '../../Bot';

interface VoiceChatPluginConfig {
	description: {
		prefix?: string,
		suffix?: string
	}
	channel: {
		prefix?: string,
		suffix?: string
	}
}

export default class VoiceChatPlugin {
	private channels: { [guild: string]: { [voice_id: string]: string } } = {};

	private description_prefix = "**Temporary discussion for ";
	private description_suffix = ".**"
	private channel_prefix = "";
	private channel_suffix = "-chat"

	constructor(config: BotConfig & { plugin: { voice_chat: VoiceChatPluginConfig } }, private client: Discord.Client) {
		client.on("voiceStateUpdate", this.onVoiceStateUpdate);

		if (config.plugin?.voice_chat?.description?.prefix) this.description_prefix = config.plugin.voice_chat.description.prefix;
		if (config.plugin?.voice_chat?.description?.suffix) this.description_suffix = config.plugin.voice_chat.description.suffix;
		if (config.plugin?.voice_chat?.channel?.prefix) this.channel_prefix = config.plugin.voice_chat.channel.prefix;
		if (config.plugin?.voice_chat?.channel?.suffix) this.channel_suffix = config.plugin.voice_chat.channel.suffix;

		this.client.guilds.cache.forEach(guild => {
			guild.channels.cache.forEach(channel => {
				if (channel.type != "voice") return;
				if ((channel as Discord.VoiceChannel).members.size >= 1)
					this.createChatChannel(channel as Discord.VoiceChannel,
						(channel as Discord.VoiceChannel).members.entries().next().value[1]);
			});
		})
	}

	onVoiceStateUpdate = (oldState: Discord.VoiceState, newState: Discord.VoiceState) => {
		if (oldState.channelID == newState.channelID) return;
		if (oldState.channelID != null) {
			let channel = oldState.guild.channels.resolve(oldState.channelID);
			if (!channel) return;
			if (channel.members.size == 0 && this.channels[channel.guild.id]) {
				oldState.guild.channels.resolve(this.channels[channel.guild.id][channel.id])?.delete();
				delete this.channels[channel.guild.id][channel.id];
			}
		}

		if (newState.channelID != null) {
			let channel = newState.guild.channels.resolve(newState.channelID);
			if (!channel) return;
			if (!this.channels[channel.guild.id]?.[channel.id] && channel.members.size == 1 && channel.parent)
				this.createChatChannel(channel as any, newState.member!);
		}
	}

	createChatChannel(voice: Discord.VoiceChannel, member?: Discord.GuildMember) {
		let channelName = this.channel_prefix + voice.name.replace(/[\W_]+/g,"-").replace(/-+/g, "-") + this.channel_suffix;
		voice.guild.channels.create(channelName, {
			type: `text`,
			parent: voice.parent ?? undefined,
			topic: `${this.description_prefix}<#${voice.id}>${this.description_suffix}`
		}).then(channel => {
			if (!this.channels[channel.guild.id]) this.channels[channel.guild.id] = {};
			this.channels[channel.guild.id][voice.id] = channel.id;
			channel.send({
				embed: new Discord.MessageEmbed()
				.setAuthor(channelName, "https://i.imgur.com/vitVUtr.png")
				.setColor("#EE86ED")
				.setDescription(
					`This is a temporary discussion channel for #${voice.name}!\n` +
					`This channel will be automatically deleted when everybody leaves the voice channel.\n`)
				.setFooter(member ? `Requested by ${member.displayName}` : '', member?.user.avatarURL({ size: 16 })!)
				.setTimestamp()
			}).catch(_ => { /* Missing send permissions. */ });
		}).catch(_ => { /* Channel was removed. */ });
	}

	async cleanup() {
		await Promise.all(Object.entries(this.channels).map(async ([g, channels]) => {
			let guild = await this.client.guilds.fetch(g);
			return await Promise.all(Object.values(channels).map(async channel =>
				(await guild.channels.resolve(channel))?.delete()));
		}));
	}
}
