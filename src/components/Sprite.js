export default class Sprite {
  constructor(images) {
    this.counter = 0;

    images.forEach((img) => {
      this.build(img);
    });
  }

  build(op) {
    let data = {
      key: op.key,
      img: new Image(),
      w: op.width,
      h: op.height,
      frames: op.frames,
    };

    data.cols = op.cols || op.frames.length;
    data.rows = op.rows || 1;
    data.fw = op.hasOwnProperty('frames') ? op.frames[0].w : (op.width / op.cols) | 0;
    data.fh = op.hasOwnProperty('frames') ? op.frames[0].h : (op.height / op.rows) | 0;
    data.offX = op.offX || (data.fw / 2) | 0;
    data.offY = op.offY || (data.fh / 2) | 0;

    data.img.onload = () => {
      this.counter++;
    };
    data.img.src = op.url;
    window[op.key] = data;
  }
}
