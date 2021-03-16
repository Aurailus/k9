# k9

[![Codacy Rating](https://img.shields.io/codacy/grade/a3bc75897a9c4553a320b2745a8f7f9f.svg?logo=codacy)](https://app.codacy.com/app/Aurailus/Zeus_cpp?utm_source=github.com&utm_medium=referral&utm_content=Aurailus/Zeus_cpp&utm_campaign=Badge_Grade_Settings)
[![Discord Badge](https://img.shields.io/discord/416379773976051712.svg?color=7289DA&label=discord&logo=discord&logoColor=white)](https://discord.gg/sT7APUG)
[![GitHub Commit](https://img.shields.io/github/commit-activity/m/aurailus/k9.svg?logo=github&label=commit%20activity)](https://github.com/Aurailus/k9/commits/master)

**Copyright 2019 Nicole Collings**

k9 is a minimalist level tracker bot for discord, used in Auri's Den. It tracks user's post frequency in a persistent database, assigning XP to posts which contributes to a total user level. The user level is used to apply custom roles to active users.

### Dependencies

* NodeJS 10+
* NPM

### Installation

1) Clone this repository: `git clone https://github.com/Aurailus/k9`
2) Install node dependencies: `npm install`
3) Copy `conf.example.toml` to `conf.toml`
4) Put valid discord token and other configuration details in `conf.toml`.
5) Run the bot: `npm start`

### Configuration

To allow the bot to start, track levels, and give role rewards fill out `conf.toml` with the missing credentials. An example and explanation of all the variables are shown below.

**Example:**
```tmol
[auth]
discord = "token" # https://discord.com/developers/applications Get token here
mongo_url = "mongodb_url" # url from mongodb

[options]
status = string # set custom status
prefix = sring # bot prefix
delete_triggers = boolean # delete command after execute 

[plugin.level]
please_and_thank_you = boolean # Bot response to "good dog" after rank up.

[plugin.level.message]
cooldown = number # cooldown time
min_length = number # minimum message length

[plugin.level.experience] # https://www.desmos.com/calculator/80hyi0deu6
a = number # First level XP offset.
b = number # Larger values makes XP / level higher.
c = number # Larger values make XP / level exponentially higher.

[[plugin.level.roles]] # rolename
level = 1 # level to acquire role
role = string # role ID
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

### License

Copyright 2019 Nicole Collings

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
