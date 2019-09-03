const requestPost = require('request');
const requestGet = require('request').defaults({encoding: null});

import * as Discord from 'discord.js';

import {Command} from "./Command"
import {BotStorage} from "../BotStorage";

export class Haystack extends Command {
	constructor(client: Discord.Client, storage: BotStorage) {
		super(client, storage);
		this.prefix += "haystack";
	}

	exec(msg: Discord.Message) {

		if (msg.attachments.size == 0) {
			const embed = new Discord.RichEmbed()
			  .setAuthor("Haystack", "https://i.imgur.com/qSHm1lQ.png")
			  .setColor("#D60058")
			  .setDescription(`Please Attach an image to use Haystack.`)
			  .setFooter(`Requested by ${(msg.member) ? msg.member.displayName : msg.author.username}`, msg.author.avatarURL)
			  .setTimestamp();

			msg.channel.send(embed).catch((e) => {/*Missing permissions to send to channel*/});
			super.deleteTrigger(msg);
			return;
		}

		const embed = new Discord.RichEmbed()
		  .setAuthor("Haystack", "https://i.imgur.com/pPObkMW.png")
		  .setColor("#7189D8")
		  .setDescription(`Preparing...`)
		  .setFooter(`Requested by ${msg.member.displayName}`, msg.author.avatarURL)
		  .setTimestamp();

		msg.channel.send(embed).then(newMsg => {
			const errEmbed = new Discord.RichEmbed()
			  .setAuthor("Haystack", "https://i.imgur.com/qSHm1lQ.png")
			  .setColor("#D60058")
			  .setFooter(`Requested by ${(msg.member) ? msg.member.displayName : msg.author.username}`, msg.author.avatarURL)
			  .setTimestamp();

			if (Array.isArray(newMsg)) {
			  errEmbed.setDescription(`Internal error: [Array.isArray]`);

			  (newMsg as any as Discord.Message).edit(errEmbed);
			  return;
			}

			const imageUrl = msg.attachments.first().url;

			requestGet.get(imageUrl, (err, response, body) => {
				if (err) {
				  errEmbed.setDescription(`There was an error getting the image: ${err}`);

				  (newMsg as any as Discord.Message).edit(errEmbed);
					super.deleteTrigger(msg);
				  return;
				}

				if (response.statusCode == 200) {
					const newEmbed = new Discord.RichEmbed()
					  .setAuthor("Haystack", "https://i.imgur.com/pPObkMW.png")
					  .setColor("#7189D8")
					  .setDescription(`Processing Image...`)
					  .setFooter(`Requested by ${msg.member.displayName}`, msg.author.avatarURL)
					  .setTimestamp();

				  (newMsg as any as Discord.Message).edit(newEmbed);

					requestPost.post({
		  			url: "https://api.haystack.ai/api/image/analyze?output=json&apikey=bf31f70811df1dada7ae5135a431a537&model=age&model=gender&model=attractiveness", 
		  			body: new Buffer(body)
		  		}, (err, response, body) => {
						if (err) {
							errEmbed.setDescription(`There was an error processing the image: ${err}`);
						  (newMsg as any as Discord.Message).edit(errEmbed);
							super.deleteTrigger(msg);
						  return;
						}

						if (response.statusCode == 200) {
							let json: any = JSON.parse(body);

							if (json.people.length == 0) {
								errEmbed.setDescription(`Haystack can't find any people in the image.`);
							  (newMsg as any as Discord.Message).edit(errEmbed);
							  return;
							}
							if (json.people.length > 1) {
								errEmbed.setDescription(`Haystack found multiple people in the image.\nThe \`k9 haystack\` command only supports one.`);
							  (newMsg as any as Discord.Message).edit(errEmbed);
							  return;
							}
					  	
					  	let person: any = json.people[0];
					  	let gender = (person.gender.gender == "female") ? "Female" : "Male";

					  	newEmbed.setDescription(`Powered by [Haystack.ai](https://haystack.ai)`);
					  	newEmbed.addField("Age", person.age);
					  	newEmbed.addField("Gender", `${gender} (${Math.round(person.gender.confidence * 100)}%)`);
					  	newEmbed.addField("Attractiveness", `${Math.round(person.attractiveness * 100) / 100} / 10`);
					  	newEmbed.setImage(imageUrl);

						  (newMsg as any as Discord.Message).edit(newEmbed).then(() => super.deleteTrigger(msg));

						  console.log(json);
						}
						else {
							errEmbed.setDescription(`[${response.statusCode}] ${body}`);
						  (newMsg as any as Discord.Message).edit(errEmbed);
							super.deleteTrigger(msg);
						  return;
						}
					});
				}
			});
		});
	}
}
