import req from '../utils/req';

export default class Map {
  constructor(container) {
    this.data = [];
    this.holes = [];
    this.base = DDD.canvas(container);
    this.stage = DDD.canvas(container);
    this.managerOptions = {
      zoom: 5,
      width: this.stage.w,
      height: this.stage.h,
      center: {
        lon: -101.508911,
        lat: 25.995522
      }
    };
    this.manager = new DDD.Map(this.managerOptions);
  }

  init() {
    this.stage.ctx.fillRect(0, 0, this.stage.w, this.stage.h);
    this.base.ctx.globalCompositeOperation = 'lighten';
    this.base.ctx.fillStyle = '#0d0d0d';
  }

  reload(w, h) {
    this.stage.w = this.base.w = this.stage.canvas.width = this.base.canvas.width = w;
    this.stage.h = this.base.h = this.stage.canvas.height = this.base.canvas.height = h;
    this.stage.center.x = this.base.center.x = (w / 2) | 0;
    this.stage.center.y = this.base.center.y = (h / 2) | 0;
    this.manager.updateSize(
      this.stage.w,
      this.stage.h,
      this.managerOptions.zoom
    );
  }

  drawBase() {
    let ctx = this.base.ctx;
    let centerX = this.base.center.x;
    let centerY = this.base.center.y;

    ctx.globalAlpha = 0.5;

    this.data.forEach(poly => {
      ctx.beginPath();

      poly.forEach(layer => {
        layer.forEach((node, i) => {
          let coords = this.manager.convertCoordinates(node[0], node[1]);

          if (Math.random() > 0.6) {
            ctx.save();
            ctx.globalCompositeOperation = 'lighten';
            ctx.translate(centerX, centerY);
            ctx.drawImage(
              lines.img,
              DDD.random(0, lines.cols) * lines.fw,
              0,
              lines.fw,
              lines.fh,
              coords.x - lines.offX,
              coords.y - lines.offY,
              lines.fw,
              lines.fh
            );

            if (i === 0) {
              ctx.moveTo(coords.x, coords.y);
            } else {
              ctx.lineTo(coords.x, coords.y);
            }

            ctx.restore();
          }
        });
      });

      ctx.closePath();
      ctx.globalCompositeOperation = 'source-over';
      ctx.fill();
    });
  }

  draw() {
    let ctx = this.stage.ctx;
    ctx.globalAlpha = 0.2;
    ctx.drawImage(this.base.canvas, 0, 0);
    ctx.globalAlpha = 1;
    ctx.save();
    ctx.translate(this.stage.center.x, this.stage.center.y);

    ctx.globalCompositeOperation = 'lighten';

    this.holes.forEach((grieta, i) => {
      grieta.x++;

      if (grieta.x < grieta.data.cols) {
        ctx.drawImage(
          grieta.data.img,
          grieta.x * grieta.data.fw,
          0,
          grieta.data.fw,
          grieta.data.fh,
          grieta.coords.x - grieta.data.offX,
          grieta.coords.y - grieta.data.offY,
          grieta.data.fw,
          grieta.data.fh
        );
      }
    });

    ctx.restore();
  }

  addHole(coords) {
    this.holes.push(new Hole(coords, grieta1));
  }
}

class Hole {
  constructor(coords, data) {
    this.coords = coords;
    this.data = data;
    this.x = 0;
  }
}
