let scales, scale, areas, ratios;
let mult = 1;
const TOTAL_OCTAVES = 5;
const BASE = 110;
const RANGE_RATE = 0.001; // Rate of range change
let numOctaves = 3;
let xshift = 0;
let xshift_mult = 0;
let ow = 100;
const MOD_RATE = 0.00001; // Rate of modulation
const NMULT = 0.1; // Modifier on note volume

let keyboard = [];
let balls = [];

let speed = 0;
let diag = 0;

// Recording data?
const RECORD = false;
// Replaying recorded data?
const REPLAY = false;

let record;
let rpdata;
let rp = 0;
let recordJSON = {
  setup: {
    w: undefined,
    h: undefined,
    fr: undefined
  },
  data: [],
};

let bgsound;
let whine;

// Volumes of sound
const BGBEG = 0.5;
const BGMID = 5;
const BGEND = 0.1;
const WHINEVOL = 0.005;

const FR = 60;
const IPCAM_FPS = 25;
const MSPF = 1000 / IPCAM_FPS;
const PLAYTIME = 3 * 60 * 1000; // 4 minutes
const PLAYTIME_IN_SECONDS = PLAYTIME / 1000;
const WHINETIME = 4 * 60 * 1000; // 5 minutes

// Where to start?
let CUES = {
  "WAIT": 0,
  "ENTER": 1,
  "STARTBG": 2,
  "STOPBG": 3,
  "STOPWHINE": 4,
  "STARTDARK": 5,
  "STOPDARK": 6,
  "RETURN": 7
}

let cue = CUES.WAIT;
let start = false;

// Keeping track of time elapsed
let timer;
let ACTS = {
  "WAIT": 0,
  "ENTER": 1,
  "LIGHT": 2,
  "DARK": 3,
  "END": 4,
  "RETURN": 5
}
let act = ACTS.ENTER;
let lastCue = 0;
let timers = [];
for (let a in ACTS) {
  timers.push(0);
}

// Get data from camera
let cnv;
let ipcam;
const CAM = 2; //1; // Camera number
const CW = 1280; //720; //1280;
const CH = 480; //720; //360;
const IPCAM_ADDRESS = 'http://192.168.1.10/axis-cgi/mjpg/video.cgi?resolution=' + CW + 'x' + CH + '&camera=' + CAM;

let old = [];
let movement = 0;
let ramp = 0;

// Whether or not we're setting camera area
let select = true;
let cx = 0; //280;
let cy = 0;
let cw = CW - (cx * 2);
let ch = CH;

let m_th_mult = 0.001;
let m_th = 1 * m_th_mult;

// Sensitivity of camera
const CAM_SCALE = 1; //40;
const CAM_TH = 8; //50;
const MAX_NOTE_LENGTH = 10;
const CAM_TO_MOUSE_RATIO = 0.25;
