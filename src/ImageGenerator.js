const Jimp = require('jimp');
const imgRaw = 'assets/levelup.png';

class ImageGenerator {
  constructor() {

  }

  generate(name, level, filename) {
    return new Promise((resolve, regect) => {
      let imgExported = `out/${filename}.png`;

      let nameData = {
        text: name,
        maxWidth: 766,
        maxHeight: 72+20,
        placementX: 10,
        placementY: 200-(115+20)-10
      };

      let levelData = {
        text: level.toString(),
        maxWidth: 780,
        maxHeight: 72+20,
        placementX: 540,
        placementY: 200-(54+20)-10
      };

      Jimp.read(imgRaw)
      .then(tpl => (Jimp.loadFont(Jimp.FONT_SANS_64_WHITE).then(font => ([tpl, font]))))
      .then(data => {
        let tpl = data[0];
        let font = data[1];
        return tpl.print(font, nameData.placementX, nameData.placementY, {
          text: nameData.text,
          alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
          alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
        }, nameData.maxWidth, nameData.maxHeight);
      })
      .then(tpl => (Jimp.loadFont(Jimp.FONT_SANS_32_WHITE).then(font => ([tpl, font]))))
      .then(data => {
        let tpl = data[0];
        let font = data[1];
        return tpl.print(font, levelData.placementX, levelData.placementY, {
          text: levelData.text + "!",
          alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
          alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
        }, levelData.maxWidth, levelData.maxHeight);
      })
      .then(tpl => (tpl.quality(100).write(imgExported)))
      .then(() => {
        resolve(imgExported);
      })
      .catch(err => {
        console.error(err);
      });
    });
  }
}

module.exports = ImageGenerator;
