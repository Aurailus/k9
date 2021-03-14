import { promises as fs } from 'fs';

import log4js from 'log4js';
import { parse } from 'toml';
import Bot, { BotConfig } from './Bot';

const logger = log4js.getLogger();
logger.level = 'debug';

(async () => {
	try {
		const conf = parse((await fs.readFile('./conf.toml')).toString()) as BotConfig;
		await new Bot(conf).init();
	}
	catch (e) {
		logger.fatal('Error initializing k9:\n%s', e);
	}
})();
