
const keys = Array.from(document.querySelectorAll('#keys button'));
const mapping = ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM',
                 'Digit2', 'Digit3', 'Digit5', 'Digit6', 'Digit7', 'KeyS', 'KeyD', 'KeyG', 'KeyH', 'KeyJ', 'Comma'];
const freqs = [130.8128, 146.8324, 164.8138, 174.6141, 195.9977, 220.0000, 246.9417, 261.6256, 293.6648, 329.6276, 349.2282, 391.9954, 440.0000, 493.8833,
  138.5913, 155.5635, 184.9972, 207.6523, 233.0819, 277.1826, 311.1270, 369.9944, 415.3047, 466.1638, 523.2511];
const harmScreens = Array.from(document.querySelectorAll('.harmScreens div'));
const harms = Array.from(document.querySelectorAll('.harm'));
const helpBtn = document.querySelector('#help');

const log = console.log;

let ctx;
let comp;

class Note {
  constructor (key, i, evtType) {
    this.key = key;
    this.i = i;
    this.evtType = evtType;
  };
  down () {
    this.osc = ctx.createOscillator();
    this.attack = ctx.createGain();
    this.release = ctx.createGain();
    this.osc.connect(this.attack);
    this.attack.connect(this.release);
    this.release.connect(comp);

    this.osc.type = 'sine';
    this.osc.frequency.value = freqs[this.i];
    this.attack.gain.setValueAtTime(0, ctx.currentTime);
    this.attack.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.04);
    this.osc.start();

    this.harms = [];
    harms.forEach((harm, i) => {
      this.harms.push({});
      this.harms[i].osc = ctx.createOscillator();
      this.harms[i].attack = ctx.createGain();
      this.harms[i].release = ctx.createGain();
      this.harms[i].osc.connect(this.harms[i].attack);
      this.harms[i].attack.connect(this.harms[i].release);
      this.harms[i].release.connect(comp);

      this.harms[i].osc.type = 'sine';
      this.harms[i].osc.frequency.value = freqs[this.i] * (i + 2);
      this.harms[i].attack.gain.setValueAtTime(0, ctx.currentTime);
      this.harms[i].attack.gain.linearRampToValueAtTime(0.05 * ((harm.clientHeight / harmScreens[i].clientHeight)), ctx.currentTime + 0.04);
      this.harms[i].osc.start();
      
    });

    if (this.evtType === 'key') document.onkeyup = this.up.bind(this);
  };
  up (e) {
    if (this.evtType === 'key') {
      mapping.forEach(code => {
        if (e.code === code) {
          keysPressed[e.code].release.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 1.2);
          keysPressed[e.code].key.style.borderStyle = 'outset';
          keysPressed[e.code].key.style.boxShadow = (keysPressed[e.code].i < 14 || keysPressed[e.code].i === keys.length - 1) ? '0 0 0.5rem gray' : '0 0 0.5rem rgb(41, 41, 41)';
          harms.forEach((harm, i) => {
            keysPressed[e.code].harms[i].release.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 1.2);
            keysPressed[e.code].harms[i].osc.stop(ctx.currentTime + 1.2);
          });
          keysPressed[e.code].osc.stop(ctx.currentTime + 1.2);
          delete keysPressed[e.code];
        }
      });

    } else if (this.evtType === 'mouse') {
      this.release.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 1.2);
      this.key.style.borderStyle = 'outset';
      this.key.style.boxShadow = (this.i < 14 || this.i === keys.length - 1) ? '0 0 0.5rem gray' : '0 0 0.5rem rgb(41, 41, 41)';
      harms.forEach((harm, i) => {
        this.harms[i].release.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 1.2);
        setTimeout(function () { this.harms[i].osc.stop(ctx.currentTime + 1.2) }.bind(this), 1000);
      });
      setTimeout(function () {
        this.osc.stop(ctx.currentTime + 1.2);
      }.bind(this), 1000);
    }
  }
}


const keysPressed = {};
document.onkeydown = function (e) {
  if (!e.repeat) {
    mapping.forEach((code, i) => {
      if (e.code === code) {
        keys[i].style.borderStyle = 'inset';
        keys[i].style.boxShadow = (i < 14 || i === keys.length - 1) ? '0 0 0.5rem gray inset' : '0 0 0.5rem rgb(41, 41, 41) inset';
        if (!ctx) {
          ctx = new AudioContext();
          comp = ctx.createDynamicsCompressor();
          // comp.threshold.value = -100;
          // comp.attack.value = 0;
          // comp.release.value = 0;
          // comp.ratio.value = 12;
          comp.connect(ctx.destination);
        } 
        keysPressed[code] = new Note(keys[i], i, 'key');
        keysPressed[code].down();
      }
    });
  }
};





keys.forEach((key, i) => {
  key.onmousedown = function () {
    key.style.borderStyle = 'inset';
    key.style.boxShadow = (i < 14 || i === keys.length - 1) ? '0 0 0.5rem gray inset' : '0 0 0.5rem rgb(41, 41, 41) inset';
    if (!ctx) {
      ctx = new AudioContext();
      comp = ctx.createDynamicsCompressor();
      comp.connect(ctx.destination);
    };
    let note = new Note(key, i, 'mouse');
    note.down();
    document.onmouseup = function () {
      key.style.borderStyle = 'outset';
      key.style.boxShadow = (i < 14 || i === keys.length - 1) ? '0 0 0.5rem gray' : '0 0 0.5rem rgb(41, 41, 41)';
      note.up();
    };
  };
  
});



function harmFunc (e, i) {
  let rect = e.target.getBoundingClientRect();
  harms[i].style.height = `${(harmScreens[i].offsetHeight - (e.clientY - rect.top)) / Number.parseFloat(getComputedStyle(document.documentElement).fontSize)}rem`;
  harms[i].style.marginTop = `${(e.clientY - rect.top) / Number.parseFloat(getComputedStyle(document.documentElement).fontSize)}rem`;
}
let isPressed;
harmScreens.forEach((screen, i) => {
  screen.onmousedown = function (e) {
    harmFunc(e, i);
    isPressed = true;
  };
  screen.onmousemove = function (e) {
    if (isPressed) harmFunc(e, i);
  };
  screen.onmouseup = function (e) {
    if (isPressed) {
      harmFunc(e, i);
      isPressed = false;
    }
  }
});


let helpBool = false;
const mapWrapper = document.querySelector('#map-wrapper');
const map = document.querySelector('#map');
helpBtn.onmousedown = function (e) {
  helpBool = !helpBool;
  if (helpBool) {
    e.target.style.borderStyle = 'inset';
    e.target.style.boxShadow = '0 0 0.5rem gray inset';
    mapWrapper.style.height = `${map.offsetHeight / Number.parseFloat(getComputedStyle(document.documentElement).fontSize)}rem`;
    mapWrapper.style.marginBottom = '2rem';
  } else {
    e.target.removeAttribute('style');
    mapWrapper.style.height = '0';
    mapWrapper.style.marginBottom = '0';
  }
};
