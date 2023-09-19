var audioCtx, volume = 0.4;
var automataSpeed = 100;
var automata = document.querySelector('#automata');
var startButton = document.querySelector('#startButton');
var stopButton = document.querySelector('#stopButton');
var oscType = ['sine', 'square', 'sawtooth', 'triangle'];
var source = {
  sound: {},
  keys: [
    { letter: 'C', isSharp: false, label: 'Z' },
    { letter: 'C#', isSharp: true, label: '1' },
    { letter: 'D', isSharp: false, label: 'X' },
    { letter: 'D#', isSharp: true, label: '2' },
    { letter: 'E', isSharp: false, label: 'C' },
    { letter: 'F', isSharp: false, label: 'V' },
    { letter: 'F#', isSharp: true, label: 'Q' },
    { letter: 'G', isSharp: false, label: 'A' },
    { letter: 'G#', isSharp: true, label: 'W' },
    { letter: 'A', isSharp: false, label: 'S' },
    { letter: 'A#', isSharp: true, label: 'E' },
    { letter: 'B', isSharp: false, label: 'D' },
    { letter: 'C', isSharp: false, label: 'F' },
    { letter: 'C#', isSharp: true, label: 'T' },
    { letter: 'D', isSharp: false, label: 'G' },
    { letter: 'D#', isSharp: true, label: 'Y' },
    { letter: 'E', isSharp: false, label: 'H' },
    { letter: 'F', isSharp: false, label: 'J' },
    { letter: 'F#', isSharp: true, label: 'I' },
    { letter: 'G', isSharp: false, label: 'K' },
    { letter: 'G#', isSharp: true, label: 'O' },
    { letter: 'A', isSharp: false, label: 'L' },
    { letter: 'A#', isSharp: true, label: 'P' },
  ],
};

source.keys.forEach((k, i) => { k.idx = i - 12; });

class Sound {
  constructor(param) {
    this.letter = param.letter;
    this.isSharp = param.isSharp;
    this.label = param.label;
    this.hz = 440 * ((2 ** (1 / 12)) ** param.idx);
    this.oscillator = audioCtx.createOscillator();
    this.gain = audioCtx.createGain();
    this.oscillator.type = 'sine';
    this.oscillator.frequency.value = this.hz;
    this.oscillator.connect(this.gain);
    this.gain.connect(audioCtx.destination);
    this.gain.gain.value = 0;
    this.oscillator.start();
  }
  keydown() {
    if (this.interval) clearInterval(this.interval);
    document.querySelector(`#key-${this.label}`).classList.add('active');
    this.gain.gain.value = volume;
  }
  keyup() {
    let t = this;
    t.gain.gain.value -= 0.01;
    document.querySelector(`#key-${t.label}`).classList.remove('active');
    this.interval = setInterval(() => {
      t.gain.gain.value -= 0.01;
      if (t.gain.gain.value <= 0) {
        clearInterval(t.interval);
        t.gain.gain.value = 0.0;
      }
    }, 10);
  }
  html() {
    return `<div class="key key-${this.isSharp ? 'black' : 'white'}" id="key-${this.label}"><span>${this.label}</span></div>`;
  }
}


function createKeyboard() {
  var keyboardRegion = document.querySelector("#keyboard-region");
  keyboardRegion.innerHTML = source.keys.map((k, i) => {
    source.sound[k.label] = new Sound(k);
    return source.sound[k.label].html();
  }).join('');
}


function createMenu() {
  // 波形タイプ
  function createOscType() {
    function _createOscType(t, checked) {
      return `<div class="form-check">
        <input class="form-check-input" type="radio" name="oscType" id="oscType-${t}" value="${t}" ${checked ? "checked" : ""}>
        <label class="form-check-label" for="oscType-${t}">${t}</label>
      </div>`;
    }
    document.querySelector("#oscType").insertAdjacentHTML(
      'beforeend',
      oscType.map((t, i) => { return _createOscType(t, i == 0); }).join('')
    );
  }
  createOscType();
  document.querySelectorAll('input[name="oscType"]').forEach((e) => {
    e.addEventListener('change', function () {
      source.keys.forEach((k) => {
        source.sound[k.label].oscillator.type = this.value;
      });
    });
  });
  // Volume
  document.querySelector("#volume-range").value = volume * 100;
  document.querySelector("#volume-range").addEventListener('change', function () {
    source.keys.forEach((k) => {
      volume = (+this.value) / 100.0;
    });
  });
}

function keydown(key) {
  audioCtx.resume();
  source.sound[key]?.keydown();
}
function keyup(key) {
  source.sound[key]?.keyup();
}

function prep() {
  createMenu();
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  createKeyboard();
  document.addEventListener('keydown', function (e) {
    if (automataInterval) clearInterval(automataInterval);
    var key = e.key.toUpperCase();
    if (source.sound[key]) keydown(key);
  });
  document.addEventListener('keyup', function (e) {
    var key = e.key.toUpperCase();
    if (source.sound[key]) keyup(key);
  });
  audioCtx.resume();
}

function start() {
  audioCtx.resume();
}

function stop() {
  audioCtx.suspend();
}

let automataInterval = null;
let automataCurrent = [];
function automataClear(clearInt) {
  if (automataInterval && clearInt) clearInterval(automataInterval);
  automataCurrent.map(c => keyup(c));
  automataCurrent = [];
}
document.querySelector("#startAutomata").addEventListener('click', function () {
  automataClear(true);
  let score = automata.value.split('\n').join(" ").toUpperCase().split(/ +/);
  automataCurrent = [];
  automataInterval = setInterval(() => {
    if (score.length === 0) {
      automataClear(true);
      return;
    }
    let s = score.shift();
    if (s !== '-') {
      automataClear(false);
      s.split('').forEach(x => {
        keydown(x);
        automataCurrent.push(x);
      });
    }
  }, automataSpeed);
});


function initNeko() {
  automata.value = `. . . . . . y t
q - ei . ei . y t
q - ei . ei . y t
q - ei . 2 . ei .
1 - dj . dj . y t
1 - dj . dj . y t
1 - dj . dj . y t
1 - dj . 2 . dj .
q - ei . ei . . .`
}
initNeko();

prep();

