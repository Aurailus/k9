import * as Discord from 'discord.js';

export class Database {
	db: any; //LowDB

	constructor(db: any) {
		this.db = db;
		this.db.defaults({ servers: [] }).write();
	}

	getServer(guild: Discord.Guild): DBServer {
		let server: any = this.db.get('servers').find({id: guild.id});
		if (!server.value()) {
			const serverTable = {
				id: guild.id,
				levelRoles: {},
				users: []
			}
			this.db.get('servers').push(serverTable).write();
			return new DBServer(this.db, this.db.get('servers').find({id: guild.id}));
		}
		return new DBServer(this.db, server);
	}
}

export class DBServer {
	id: string;
	server: any;
	db: any;

	constructor(db: any, server: any /*LowDB result*/) {
		this.id = server.value().id;
		this.db = db;
		this.server = server;
	}

	getLevelRolesTable() : BotLevelRoles {
		return this.server.get('levelRoles').value();
	}

	getUser(member: Discord.GuildMember) : DBUser {
		let user: any = this.server.get('users').find({id: member.id});
		if (!user.value()) {
			const userTable: DBUser = {
				id: member.id,
				lastInstigated: Date.now() - 60 * 1000, 
				lastPosted: Date.now() - 60 * 1000,

				level: 0,
				levelXP: 0,
				totalXP: 0,

				messages: 0
			}
			this.server.get('users').push(userTable).write();
			return this.server.get('users').find({id: member.id});
		}
		return user.value();
	}

	getTopUsers() : DBUser[] {
		return this.server.get('users').sortBy('totalXP').reverse().take(9).value();
	}

	pushUser(user: DBUser) {
		this.server.get('users').find({id: user.id}).assign(user).write();
	}
}

export interface BotLevelRoles {[key: string]: string}

export interface DBUser {
	id: string,
	lastInstigated: number,
	lastPosted: number,

	level: number,
	levelXP: number,
	totalXP: number,

	messages: number
}
