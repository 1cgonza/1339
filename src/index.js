import './scss/main.scss';
import { canvas } from 'dddrawings';
import Map from './components/Map';
import SpriteManager from './components/Sprite';
import { imgs } from './components/images';
import Levit from './components/Levit';
import { types } from './utils/types';

const TWOPI = Math.PI * 2;
/*----------  STAGE  ----------*/
let container = document.getElementById('stage');
let map = new Map(container);
const lienzo = document.createElement('canvas');
const lienzoCtx = lienzo.getContext('2d');
const off = document.createElement('canvas');
const offCtx = off.getContext('2d', { willReadFrequently: true });
const log = document.createElement('canvas');
const logCtx = log.getContext('2d');
// let log = canvas(container);
const dims = { w: 0, h: 0 };
const centro = { x: 0, y: 0 };
// log.canvas.id = 'log';
lienzo.id = 'lienzo';
log.id = 'log';
container.appendChild(lienzo);
container.appendChild(log);
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
  dims.w = log.width = lienzo.width = off.width = w;
  dims.h = log.height = lienzo.height = off.height = h;

  centro.x = (w / 2) | 0;
  centro.y = (h / 2) | 0;
  map.reload(w, h);

  d.forEach((event) => {
    event.coords = map.manager.convertCoordinates(event.place.lon, event.place.lat);
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
  dStep = (dims.h - 32) / days;
  rStep = TWOPI / days;

  offCtx.globalCompositeOperation = 'lighten';
  logCtx.font = '12px News Cycle';

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
    d.forEach((event) => {
      if (event.hasOwnProperty('type')) {
        let spriteKey = types[event.type] || 'bomba';

        event.sprite = window[spriteKey];
        event.time = new Date(event.Fecha.human).getTime();
      }

      event.coords = map.manager.convertCoordinates(event.place.lon, event.place.lat);
    });
    reloadStage();
    init();
  } else {
    requestAnimationFrame(checkAssetsLoaded);
  }
}

function animate() {
  if (play) {
    if (dataI < d.length - 1) {
      if (tick === hold) {
        const ctx = logCtx;
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

        ctx.clearRect(0, 0, log.width, log.height);
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
            year: 'numeric',
          }).format(currentDate),
          90,
          300
        );

        let imgData = offCtx.getImageData(0, 0, dims.w, dims.h);
        let data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
          data[i] = 255 - data[i]; // red
          data[i + 1] = 255 - data[i + 1]; // green
          data[i + 2] = 255 - data[i + 2]; // blue
        }
        lienzoCtx.putImageData(imgData, 0, 0);
      }
      tick++;
    } else {
      bodies = bodies.filter((body) => !body.finished);
      dataI = 0;
      currentDate = dateInit;
    }
  }

  animReq = requestAnimationFrame(animate);
}

function draw(i, add) {
  let e = d[i];
  let ctx = offCtx;

  if (add) {
    map.addHole(e.coords);
    bodies.push(new Levit(e.coords, e.sprite, off, offCtx));
  }

  map.draw();

  if (bodies.length > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0, 0, 0, .7)';
    ctx.fillRect(0, 0, dims.w, dims.h);
    ctx.restore();
    ctx.drawImage(map.stage.canvas, 0, 0);

    bodies.forEach((body) => {
      if (!body.finished) {
        body.draw(centro);
      }
    });
  }
}

fetchData();

let resizeTimer;

window.addEventListener(
  'resize',
  () => {
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
