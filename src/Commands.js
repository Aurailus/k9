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
			msg.author.send(`**Leaderboard not implemented _yet_.**`);
		});
	}
}

module.exports = Commands;
