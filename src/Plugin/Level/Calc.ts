import { LevelPluginConfig } from './LevelPlugin';

// Calculations: https://www.desmos.com/calculator/idluw8zexx

/**
 * Returns the level the provided XP reaches.
 *
 * @param {LevelPluginConfig} config - The experience config to use for the calculations.
 * @param {number} experience - The experience to do the calculation for.
 */

export function xpToLevel(config: LevelPluginConfig, experience: number) {
	if (experience < config.experience.a) return 0;
	return Math.floor(Math.pow(experience - config.experience.a, 1 / config.experience.c) / config.experience.b) + 1;
}


/**
 * Returns the amount of XP required to go from level 0 to this level.
 *
 * @param {LevelPluginConfig} config - The experience config to use for the calculations.
 * @param {number} level - The level to do the calculation for.
 */

export function levelToXp(config: LevelPluginConfig, level: number) {
	if (level <= 0) return 0;
	return config.experience.a + Math.pow((level - 1) * config.experience.b, config.experience.c);
}


/**
 * Returns the amount of XP required to go from this level to the level above.
 *
 * @param {LevelPluginConfig} config - The experience config to use for the calculations.
 * @param {number} level - The level to do the calculation for.
 */

export function xpInLevel(config: LevelPluginConfig, level: number) {
	return levelToXp(config, level) - levelToXp(config, level - 1);
}


/**
 * Returns the role for the level provided.
 *
 * @param {LevelRole[]} roles - The roles to use for the calculations.
 * @param {number} level - The level to do the calculation for.
 */

export function levelToRole(config: LevelPluginConfig, level: number) {
	let roleID: string | undefined = undefined;
	for (let role of config.roles) {
		if (role.level <= level) roleID = role.role;
		else break;
	}
	return roleID;
}


/**
 * Returns the role for the XP provided.
 *
 * @param {LevelPluginConfig} config - The experience config to use for the calculations.
 * @param {LevelRole[]} roles - The roles to use for the calculations.
 * @param {number} experience - The experience to do the calculation for.
 */

export function xpToRole(config: LevelPluginConfig, experience: number) {
	return levelToRole(config, xpToLevel(config, experience));
}
