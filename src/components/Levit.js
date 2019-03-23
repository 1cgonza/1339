export default class Levit {
  constructor(coords, sprite, stage) {
    this.x = coords.x;
    this.y = coords.y;
    this.frame = 0;
    this.finished = false;
    this.pushY = 50;
    this.stage = stage;
    this.totalFrames = sprite.frames.length;
    this.sprite = sprite;
  }

  draw() {
    let ctx = this.stage.ctx;
    let centerX = this.stage.center.x;
    let centerY = this.stage.center.y;

    if (this.frame < this.totalFrames) {
      let x = this.sprite.frames[this.frame].x;
      let y = this.sprite.frames[this.frame].y;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.drawImage(
        this.sprite.img,
        x,
        y,
        this.sprite.fw,
        this.sprite.fh,
        this.x - this.sprite.offX,
        this.y - this.sprite.offY - this.pushY,
        this.sprite.fw,
        this.sprite.fh
      );
      ctx.restore();

      this.frame++;
      this.pushY += 5;
    } else {
      this.del();
    }
  }

  del() {
    this.finished = true;
  }
}
