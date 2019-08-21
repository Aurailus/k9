const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

class Setup {
	constructor(discord, self) {
		this.self = self;
		this.discord = discord;

		const adapter = new FileSync('./data/db.json');
		self.db = low(adapter);
		self.db.defaults({ servers: [] }).write();
	}

	init(token) {
		return new Promise((resolve, regect) => {
			this.discord.login(this.self.token);
			this.discord.on('ready', () => {
				console.log(`Logged in as ${this.discord.user.tag}.`);
				this.discord.user.setActivity('you. | k9 help', {type: "LISTENING"});
				this.discord.user.setStatus('online');
				resolve();
			});
		});
	}
}

module.exports = Setup;
