const Discord = require("discord.js");

class Commands {
	constructor(discord, self) {
		this.discord = discord;
		this.self = self;

		this.registerHelp();
		this.registerLevel();
		this.registerLeaderboard();
	}

	registerCommand(prefix, command) {
		this.discord.on('message', msg => {
			if (msg.content.substr(0, prefix.length + 3) == "k9 " + prefix) {
				if (msg.channel.constructor.name != "DMChannel") msg.delete();
				command(msg);
			}
		});
	}

	registerHelp() {
		this.registerCommand("help", msg => {
			msg.author.send(`
**Hello!**
I'm a simple score counting and moderation bot made for Auri's Den by Aurailus.
I assign levels to users based on the frequency of their contributions to the server, 
and automagically give them ranks as their level raises.
I also have a few simple commands that can be used in any server I'm in:

**Commands:**
\`k9 help\` - *Sends this message.*
\`k9 level\` - *Shows you your current level, rank, and XP.*
\`k9 leaderboard\` - *Shows the top users in Auri's Den.*`);
		});
	}

	registerLevel() {
		this.registerCommand("level", msg => {
			let auth = msg.author.id;

			//Make sure the user is in a Server
			const guild = msg.guild;
			if (!guild) return;

			//Get the server's local DB (or create one if it's missing)
			let db = this.self.db.get('servers').find({id: guild.id});
			if (!db.value()) return;
			let user = db.get('users').find({id: auth}).value();
			if (!user) return;

			msg.channel.send(`You're level **${user.level}**, <@${auth}>! <:pickaxe:606019109284610078>`);
		});
	}

	registerLeaderboard() {
		this.registerCommand("leaderboard", msg => {
			let users = this.self.db.get('servers').find({id: msg.guild.id}).get('users').sortBy('totalXP').reverse().take(9).value();

			const embed = new Discord.RichEmbed()
			  .setAuthor("Leaderboard", "https://i.imgur.com/LaPvO6n.png")
			  .setColor("#FFAC38")
			  .setDescription("The most active members on the server.")
			  .setFooter(`Requested by ${msg.member.displayName}`, msg.author.avatarURL)
			  .setTimestamp()

				.addBlankField()

		  for (let i = 0; i < users.length; i++) {
		  	const user = msg.guild.members.get(users[i].id);
		  	let name = "Removed";
		  	if (user) name = user.displayName;
		  	if (name.length >= 20) name = name.substr(0, 18) + "...";
		  	embed.addField(
		  		`⠀${i < 3 ? "**" : ""}${i + 1}) ${name}${i < 3 ? "**" : ""}`, 
		  		`⠀Level ${users[i].level} • ${users[i].totalXP} XP`, true);
		  }
			
			embed.addBlankField()
			 
		  msg.channel.send({embed});
		});
	}
}

module.exports = Commands;
