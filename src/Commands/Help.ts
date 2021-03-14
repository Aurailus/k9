import * as Discord from 'discord.js';

export default function Help(msg: Discord.Message) {
	msg.channel.send({
		embed: new Discord.MessageEmbed()
			.setAuthor('K9 Help', 'https://cdn.discordapp.com/avatars/613569990297255938/5c6883f8b8f324fe38cf5d1a8361339a.webp?size=64')
			.setColor('#EE86ED')
			.setDescription(
				'Hi, I\'m k9! I\'m a user level tracking bot made by Auri#1311. ' +
				'I assign users levels and automagically grants users roles once they reach certain level thresholds. ' +
				'I also have a few simple commands available to interact with me.')
			.setFooter(`${(msg.member) ? msg.member.displayName : msg.author.username}`, msg.author.avatarURL({ size: 32 })!)
			.setTimestamp()

			.addField('`k9 help`', '⠀Sends this message.')
			.addField('`k9 level`', '⠀Displays your level, XP, and rank.')
			.addField('`k9 leaderboard`', '⠀Shows the top ranked users in the current server.')
	}).catch(_ => { /* Missing send permissions. */ });
}
