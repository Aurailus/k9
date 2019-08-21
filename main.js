"use strict";

const fs = require('fs');
const Discord = require("discord.js");

const Setup = require("./src/Setup.js");
const Commands = require("./src/Commands.js");
const Leveller = require("./src/Leveller.js");

const discord = new Discord.Client();

const raw = fs.readFileSync('./data/conf.json');
const self = JSON.parse(raw);

const setup = new Setup(discord, self);
setup.init().then(() => {
	new Commands(discord, self);
	new Leveller(discord, self);
});
