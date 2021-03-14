import JIMP from 'jimp';

const IMAGE_PATH = 'assets/levelup_image.png';

export default async function buildLevelImage(name: string, level: number, filename: string) {
	let image = await JIMP.read(IMAGE_PATH);

	let name_font = await JIMP.loadFont(JIMP.FONT_SANS_64_WHITE);
	await image.print(name_font, 0, 48, { text: name,
		alignmentX: JIMP.HORIZONTAL_ALIGN_CENTER, alignmentY: JIMP.VERTICAL_ALIGN_MIDDLE }, 760, 92);

	let level_font = await JIMP.loadFont(JIMP.FONT_SANS_32_WHITE);
	await image.print(level_font, 530, 106, { text: level.toString(10) + '!',
		alignmentX: JIMP.HORIZONTAL_ALIGN_LEFT, alignmentY: JIMP.VERTICAL_ALIGN_MIDDLE }, 780, 92);

	let outPath = `./${filename}.png`;
	await image.quality(100).write(outPath);
	return outPath;
}
