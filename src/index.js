import './scss/main.scss';
import './js/ddd.min.js';
import Map from './components/Map';
import SpriteManager from './components/Sprite';
import { imgs } from './components/images';
import Levit from './components/Levit';
import { types } from './utils/types';

const TWOPI = Math.PI * 2;
/*----------  STAGE  ----------*/
let container = document.getElementById('stage');
let map = new Map(container);
let stage = DDD.canvas(container);
let log = DDD.canvas(container);
let off = DDD.canvas();
log.canvas.id = 'log';

/*----------  DATA  ----------*/
let bodies = [];
let d = [];
let dateInit = 0;
let dateEnd = 0;
let dStep = 0;
let currentDate = 0;
let rStep = 0;

/*----------  ANIMATION  ----------*/
let play = false;
let animReq;
let dataI = 0;
let hold = 4;
let tick = 0;
let add = true;
let yTick = 0;

/*----------  SPRITES  ----------*/
let sprites = new SpriteManager(imgs);

function reloadStage(w, h) {
  w = w | window.innerWidth;
  h = h | window.innerHeight;
  window.cancelAnimationFrame(animReq);
  stage.w = log.canvas.width = stage.canvas.width = off.canvas.width = w;
  stage.h = log.canvas.height = stage.canvas.height = off.canvas.height = h;
  off.center.x = (w / 2) | 0;
  off.center.y = (h / 2) | 0;
  map.reload(w, h);

  d.forEach(event => {
    event.coords = map.manager.convertCoordinates(
      event.place.lon,
      event.place.lat
    );
  });

  dataI = 0;
  tick = 0;
  yTick = 0;
  currentDate = dateInit;
  bodies = [];
  map.holes = [];

  init();
  if (!about.classList.contains('active')) {
    play = true;
  }
}

function fetchData() {
  d = require('./data/articulo19_2012-2016.json');
  d = d.sort((a, b) => a.Fecha.unix - b.Fecha.unix);
  currentDate = new Date(d[0].Fecha.human);
  dateInit = new Date(d[0].Fecha.human);
  dateEnd = new Date(d[d.length - 1].Fecha.human).getTime();

  map.data = require('./data/mex-50m.json').coordinates;

  checkAssetsLoaded();
}

function init() {
  let days = Math.round((dateEnd - dateInit) / (1000 * 60 * 60 * 24));
  dStep = (off.h - 32) / days;
  rStep = TWOPI / days;

  off.ctx.globalCompositeOperation = 'lighten';
  log.ctx.font = '12px News Cycle';

  map.init();
  map.drawBase();
  play = true;
  tick = hold;
  animate();
  play = false;
  tick = 0;
}

function checkAssetsLoaded() {
  if (sprites.counter === imgs.length) {
    d.forEach(event => {
      if (event.hasOwnProperty('type')) {
        let spriteKey = types[event.type] || 'bomba';

        event.sprite = window[spriteKey];
        event.time = new Date(event.Fecha.human).getTime();
      }

      event.coords = map.manager.convertCoordinates(
        event.place.lon,
        event.place.lat
      );
    });

    init();
  } else {
    requestAnimationFrame(checkAssetsLoaded);
  }
}

function animate() {
  if (play) {
    if (dataI < d.length - 1) {
      if (tick === hold) {
        let ctx = log.ctx;
        draw(dataI, add);
        tick = 0;

        if (currentDate.getTime() >= d[dataI].time) {
          dataI++;
          add = true;
        } else {
          currentDate.setDate(currentDate.getDate() + 1);
          yTick++;
          add = false;
        }

        ctx.clearRect(0, 0, log.canvas.width, log.canvas.height);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        for (let i = 0; i < yTick; i++) {
          let r = 3 - i / 800;
          if (r > 0) {
            ctx.save();
            ctx.translate(120, 300);
            ctx.rotate(((yTick - i) * rStep) % TWOPI);
            ctx.beginPath();
            ctx.arc(0, -50 - r * 20, r, 0, TWOPI);
            ctx.fill();
            ctx.restore();
          }
        }

        ctx.fillStyle = '#000';
        ctx.fillText(
          new Intl.DateTimeFormat('es-MX', {
            timezone: 'America/Mexico_City',
            day: 'numeric',
            month: 'numeric',
            year: 'numeric'
          }).format(currentDate),
          90,
          300
        );

        let imgData = off.ctx.getImageData(0, 0, stage.w, stage.h);
        let data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
          data[i] = 255 - data[i]; // red
          data[i + 1] = 255 - data[i + 1]; // green
          data[i + 2] = 255 - data[i + 2]; // blue
        }
        stage.ctx.putImageData(imgData, 0, 0);
      }
      tick++;
    } else {
      bodies = bodies.filter(body => !body.finished);
      dataI = 0;
      currentDate = dateInit;
    }
  }

  animReq = requestAnimationFrame(animate);
}

function draw(i, add) {
  let e = d[i];
  let ctx = off.ctx;

  if (add) {
    map.addHole(e.coords);
    bodies.push(new Levit(e.coords, e.sprite, off));
  }

  map.draw();

  if (bodies.length > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0, 0, 0, .7)';
    ctx.fillRect(0, 0, off.w, off.h);
    ctx.restore();
    ctx.drawImage(map.stage.canvas, 0, 0);

    bodies.forEach(body => {
      if (!body.finished) {
        body.draw();
      }
    });
  }
}

fetchData();

let resizeTimer;

window.addEventListener(
  'resize',
  e => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      reloadStage(window.innerWidth, window.innerHeight);
    }, 500);
  },
  false
);

let about = document.getElementById('about');
let credits = document.getElementById('credits');
let playBtn = document.getElementById('play');

playBtn.onclick = () => {
  credits.classList.add('hidden');
  about.classList.remove('active');
  play = true;
};

about.onclick = () => {
  about.classList.toggle('active');

  if (about.classList.contains('active')) {
    credits.classList.remove('hidden');
    play = false;
  } else {
    credits.classList.add('hidden');
    play = true;
  }
};
