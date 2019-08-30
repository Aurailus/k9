const Discord = require('discord.js')
const requestPost = require('request');
const requestGet = require('request').defaults({encoding: null});

class HaystackIntegration {
	constructor() {}
	
	parse(msg, url) {
		if (msg.attachments.size == 0) {
			const embed = new Discord.RichEmbed()
			  .setAuthor("Haystack", "https://i.imgur.com/qSHm1lQ.png")
			  .setColor("#D60058")
			  .setDescription(`Please attach or link an image to use Haystack.`)
			  .setFooter(`Requested by ${msg.member.displayName}`, msg.author.avatarURL)
			  .setTimestamp();

			msg.channel.send({embed});
			return;
		}

		const embed = new Discord.RichEmbed()
		  .setAuthor("Haystack", "https://i.imgur.com/qSHm1lQ.png")
		  .setColor("#7189D8")
		  .setDescription(`Preparing...`)
		  .setFooter(`Requested by ${msg.member.displayName}`, msg.author.avatarURL)
		  .setTimestamp();

		msg.channel.send({embed}).then(msg => {
			requestGet.get(url, (err, response, body) => {
				if (err) {
					console.err(err);
					const newEmbed = new Discord.RichEmbed()
					  .setAuthor("Haystack", "https://i.imgur.com/qSHm1lQ.png")
					  .setColor("#D60058")
					  .setDescription(`There was an error getting the image: ${err}`)
					  .setFooter(`Requested by ${msg.member.displayName}`, msg.author.avatarURL)
					  .setTimestamp();

					msg.edit({newEmbed});
					return;
				}

				if (response.statusCode == 200) {
					const newEmbed = new Discord.RichEmbed()
					  .setAuthor("Haystack", "https://i.imgur.com/qSHm1lQ.png")
					  .setColor("#7189D8")
					  .setDescription(`Processing Image...`)
					  .setFooter(`Requested by ${msg.member.displayName}`, msg.author.avatarURL)
					  .setTimestamp();

					msg.edit({newEmbed});

					requestPost.post({
		  			url: "https://api.haystack.ai/api/image/analyze?output=json&apikey=f8fbdbd767e7a7b65f4f2e3e03704a92", 
		  			body: new Buffer(body)
		  		}, (err, response, body) => {
						if (err) console.err(err)

						if (response.statusCode == 200) {
							console.log(JSON.parse(body))
						}
					});
				}
			});
		});
	}
}

module.exports = HaystackIntegration;
