import { ExperienceConfig } from './LevelPlugin';


/**
 * Returns the level the provided XP reaches.
 *
 * @param {ExperienceConfig} config - The experience config to use for the calculations.
 * @param {number} experience - The experience to do the calculation for.
 */

export function xpToLevel(config: ExperienceConfig, experience: number) {
	if (experience < config.offset) return 0;
	let level = 1;
	experience -= config.offset;
	while ((experience -= config.base * Math.sqrt(config.multiplier * level)) >= 0) level++;
	return level;
}


/**
 * Returns the amount of XP required to go from level 0 to this level.
 *
 * @param {ExperienceConfig} config - The experience config to use for the calculations.
 * @param {number} level - The level to do the calculation for.
 */

export function levelToXp(config: ExperienceConfig, level: number) {
	if (level == 0) return 0;
	let experience = config.offset;
	level--;
	while (level > 0) {
		experience += config.base * Math.sqrt(config.multiplier * level--);
	}
	return experience;
}


/**
 * Returns the amount of XP required to go from this level to the level above.
 *
 * @param {ExperienceConfig} config - The experience config to use for the calculations.
 * @param {number} level - The level to do the calculation for.
 */

export function xpInLevel(config: ExperienceConfig, level: number) {
	if (level < 0) return 0;
	if (level == 0) return config.offset;
	return config.base * Math.sqrt(config.multiplier * level);
}
