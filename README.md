<h1 align="center">K9</h1>

<p align="center">
   <img src="https://raw.githubusercontent.com/Aurailus/k9/master/assets/logo.png" width="200">
</p>

<h3 align="center">A minimalist level-tracking Discord bot. Woof!</h3>

<p align="center">
  <a href="https://app.codacy.com/gh/Aurailus/k9/dashboard"><img src="https://img.shields.io/codacy/grade/61133a91364941e8b6bb25b6fa4c2489.svg?logo=codacy&logoColor=cccccc&labelColor=2A3037" alt="Releases"/></a>
  <a href="https://github.com/Aurailus/k9/commits/master"><img src="https://img.shields.io/github/commit-activity/m/aurailus/k9.svg?logo=github&logoColor=cccccc&labelColor=2A3037&label=commit%20activity" alt="Commit Activity"/></a>
  <a href="https://aurail.us/discord"><img src="https://img.shields.io/discord/416379773976051712.svg?color=7289DA&label=discord&logo=discord&logoColor=cccccc&labelColor=2A3037" alt="Join Discord"/></a>
  <a href="https://patreon.com/Aurailus"><img src="https://img.shields.io/static/v1?label=patreon&message=support&color=FF6952&logo=patreon&logoColor=cccccc&labelColor=2A3037" alt="Support on Patreon"/></a>
</p>

<br>

K9 is a self-hosted, minimalist level tracking Discord bot. It tracks post frequency in a persistent database, assigning experience to posts which contributes to a total user level. This user level is used to apply custom roles to award active users.

An example of this functionality can be seen in [Auri's Den](https://aurail.us/discord).

### Dependencies

  * NodeJS 12+
  * NPM
  * MongoDB

### Installation

1) Clone this repository: `git clone https://github.com/Aurailus/k9`
2) Install node dependencies: `npm install`
3) Copy `conf.example.toml` to `conf.toml`
4) Put a valid discord token and other configuration details in `conf.toml`.
5) Run the bot: `npm start`

### Configuration

To allow the bot to start, track levels, and give role rewards, fill out `conf.toml` with the missing credentials. An example and explanation of all the variables are shown below.

**Example:**

```TOML
[auth]
discord = "token" # https://discord.com/developers/applications
mongo_url = "mongodb_url" # MongoDB URL

[options]
status = string # Custom status
prefix = string # Command prefix
delete_triggers = boolean # Delete commands after execution 

[plugin.level]
please_and_thank_you = boolean # Bot responds to "good dog" after ranking up.

[plugin.level.message]
cooldown = number # Cooldown time
min_length = number # Minimum message length

[plugin.level.experience] 
# https://www.desmos.com/calculator/80hyi0deu6
a = number # First level XP offset.
b = number # Larger values makes XP / level higher.
c = number # Larger values make XP / level exponentially higher.

[[plugin.level.roles]]
level = 1 # Level to acquire role
role = string # Role ID
[[plugin.level.roles]]
level = 2
role = string
[[plugin.level.roles]]
level = 5
role = string
...
```

### Contributing

If you would like to contribute, please follow the code style used in the existing source files, and indent with tabs. Once you are done submit a pull request outlining what you have changed / added and why it should be implementing into the bot.

<br>
<br>
<br>

&copy; [Auri Collings](https://twitter.com/Aurailus), 2021. Made with <3

Licensed under the [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0).
