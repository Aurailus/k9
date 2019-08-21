# k9

[![Codacy Rating](https://img.shields.io/codacy/grade/a3bc75897a9c4553a320b2745a8f7f9f.svg?logo=codacy)](https://app.codacy.com/app/Aurailus/Zeus_cpp?utm_source=github.com&utm_medium=referral&utm_content=Aurailus/Zeus_cpp&utm_campaign=Badge_Grade_Settings)
[![Discord Badge](https://img.shields.io/discord/416379773976051712.svg?color=7289DA&label=discord&logo=discord&logoColor=white)](https://discord.gg/sT7APUG)
[![GitHub Commit](https://img.shields.io/github/commit-activity/m/aurailus/k9.svg?logo=github&label=commit%20activity)](https://github.com/Aurailus/k9/commits/master)

k9 is a minimalist level tracker bot for discord, used in Auri's Den. It tracks user's post frequency in a persistent database, assigning XP to posts which contributes to a total user level. The user level is used to apply custom roles to active users.

**Copyright 2019 Nicole Collings**

[Official Discord Server](https://discord.gg/sT7APUG)

## Dependencies
* NodeJS 6+
* NPM

## Installation
1) Clone this repository: `git clone https://github.com/Aurailus/k9`
2) Install node dependencies: `npm install`
3) Create `data/conf.json` and `data/db.json` files.
4) Put valid discord token and other configuration details in `data/conf.json`.
5) Run the bot: `npm start`

## Configuration
To allow the bot to start and track levels, it needs some configuration information, which goes in `data/conf.json`. An example of the parameters required is below.

**Example:**
```json
{
  "token": "VALID_DISCORD_TOKEN",
  "xp_properties": {
    "level_base_cost": 15,
    "level_multiplier": 0.4
  }
}
```

In the future, role rewards will be configured within the bot. As of now to set role rewards, go in to the database file (`data/db.json`) and make sure you have `levelRoles` section inside your `server` section.

**Example:**
```json
{
  "servers": [
    {
      "id": "your_server_id",
      "levelRoles": {
        "1": "role_id_for_level_1",
        "5": "role_id_for_level_5",
        "10": "role_id_for_level_10",
        ...
      },
      ...
```

The key is the level which the role applies to, the value is the **role id** (found by right clicking the role in the Server Settings and pressing `Copy ID` with developer mode enabled.)

## Contributing
If you would like to contribute, please follow the code style used in the existing source files, and indent with tabs. Once you are done submit a pull request outlining what you have changed / added and why it should be implementing into the bot.
