const SVG_URL = new URL('./assets/生日蛋糕.svg', window.location.href).toString();
const HOST = document.getElementById('svgHost');
const STAGE = document.getElementById('stage');

let svg = null;
let flame = null;
let flamePaths = [];
let cakeLayers = [];
let cakeZero = null;
let rabbitLayer = null;
let arrowLayer = null;
let arrowPath = null;
let starPaths = [];
let anchor = { x: 0, y: 0 };
let flameTarget = { x: 0, y: 0 };
let flameGlow = null;
let flameGlowStops = [];
let glowGradient = null;
let glowBase = { rx: 0, ry: 0 };
let dayTextLayers = [];
let dayTextSevenOne = null;
let dayTextSevenOneTimer = 0;
let nightTextLayers = [];
let nightGlyphs = [];
let nightCursor = null;
let nightTypingStart = 0;
let nightTypingActive = false;
let nightTypingDone = false;
let geometryItems = [];
let geometryAnimationActive = false;
let geometryAnimationStart = 0;
let geometryCursorPoint = null;
let activeDayTextIndex = -1;
let dayTextAutoTimer = 0;
let blowHoldTimer = 0;
let blowHoldActive = false;
let pressStartTime = 0;
let sceneMode = 'day';
let blowStageArmed = false;
let micStream = null;
let micContext = null;
let micAnalyser = null;
let micSource = null;
let micData = null;
let micReady = false;
let micRequesting = false;
let micContextPrimed = false;
let micAboveStart = 0;
let blowTextVisible = false;
let micVolumeLevel = 0;
let volumeDisplayVisible = false;
let volumeToggleButton = null;
let volumeMeterFill = null;
let volumeValueLabel = null;
let volumeRow = null;
let starSpinMultiplier = 45;
const BG_AUDIO_BASE = './assets/audio/';
const glowSettings = {
  intensity: 0.55,
  size: 0.72,
  opacity: 1,
};
const birthdayParticleSettings = {
  size: 0.6,
  maxCount: 8,
};
const BLOW_VOLUME_THRESHOLD = 0.15;
const BLOW_VOLUME_SCALE = 6.25;
const BLOW_HOLD_DELAY = 320;
const BLOW_EXTINGUISH_MS = 1000;
let rafId = 0;
let startTime = 0;
let wind = 0;
let blow = 0;
let targetBlow = 0;
let extinguished = false;
let smoke = [];
let confetti = [];
let confettiLayer = null;
let birthdayTextStarted = false;
let birthdayTextPending = false;
let birthdayTextTriggerAt = 0;
let birthdayLayer = null;
let birthdayPieces = [];
let birthdayAnimationStart = 0;
let birthdayAnimationActive = false;
let birthdayParticleLayer = null;
let birthdayParticles = [];
let birthdayTextWasSetup = false;
let birthdaySpecials = {
  heart: null,
  exclaim1: null,
  exclaim2: null,
};
let audioAssets = null;
let audioPendingKeys = new Set();
let ambientMode = 'burn';
let burnAudioStarted = false;
let dayTextStartWaitingForAudio = false;
const BIRTHDAY_APPEAR_MS = 150;
const BIRTHDAY_PULL_MS = 250;
const BIRTHDAY_EXPAND_MS = 350;
const BIRTHDAY_MORPH_MS = BIRTHDAY_PULL_MS + BIRTHDAY_EXPAND_MS;
const BIRTHDAY_IMPACT_POINT = BIRTHDAY_PULL_MS / BIRTHDAY_MORPH_MS;
const BIRTHDAY_IMPACT_SCALE = 0.7;
const BIRTHDAY_STAGGER_MIN = 60;
const BIRTHDAY_STAGGER_MAX = 180;
const BIRTHDAY_SETTLE_MS = 860;
const BIRTHDAY_SETTLE_MAX_DELAY_MS = 520;
const BIRTHDAY_TEXT_AFTER_CONFETTI_APEX_MS = -120;
const BIRTHDAY_EXCLAIM_APPEAR_MS = 620;
const BIRTHDAY_EXCLAIM_SHAKE_MS = 620;
const BIRTHDAY_EXCLAIM_MS = BIRTHDAY_EXCLAIM_APPEAR_MS + BIRTHDAY_EXCLAIM_SHAKE_MS;
const BIRTHDAY_HEART_MS = 1500;
const BIRTHDAY_PARTICLE_COLORS = ['#639cd4', '#d34995'];
const BIRTHDAY_STAR_TEMPLATES = [
  {
    viewBox: '0 0 27.92 27.69',
    path: 'M11.03,16.45C9.77,15.19-.11,14.51,0,13.68c.13-.95,8.73-1.21,10.27-3.73C12.25,6.69,13.81-.11,14.65,0c.78.1,1.33,8.42,2.7,10.2,1.83,2.39,10.63,3.6,10.57,4.65-.08,1.3-7.75.05-9.61,1.89-1.32,1.3-3.57,11.07-4.78,10.95-.82-.09-1.39-10.14-2.49-11.23Z',
  },
  {
    viewBox: '0 0 27.27 27.21',
    path: 'M16.51,19.33c-1.55.88-4.16,7.97-5.32,7.87s-1.92-8.23-2.98-9.66C7.35,16.39-.35,14.98.01,13.88s7.9-2.59,9.13-3.61S9.65.21,10.8,0s3.44,5.76,5.72,6.8c2.74,1.25,8.47-3.02,9.44-2.15,1.53,1.37-5.27,5.68-5.2,8.3.05,1.85,7.2,7.97,6.45,8.94s-9.28-3.37-10.7-2.56Z',
  },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function clamp01(value) {
  return clamp(value, 0, 1);
}

function hexToRgb(hex) {
  const normalized = hex.replace('#', '').trim();
  const full = normalized.length === 3
    ? normalized.split('').map((char) => char + char).join('')
    : normalized;
  const value = Number.parseInt(full, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b]
    .map((value) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0'))
    .join('')}`;
}

function mixHexColor(from, to, t) {
  const start = hexToRgb(from);
  const end = hexToRgb(to);
  const ratio = clamp01(t);
  return rgbToHex(
    start.r + ((end.r - start.r) * ratio),
    start.g + ((end.g - start.g) * ratio),
    start.b + ((end.b - start.b) * ratio),
  );
}

function easeOutCubic(t) {
  const x = clamp01(t);
  return 1 - Math.pow(1 - x, 3);
}

function easeInQuad(t) {
  const x = clamp01(t);
  return x * x;
}

function easeOutQuint(t) {
  const x = clamp01(t);
  return 1 - Math.pow(1 - x, 5);
}

function easeOutBack(t) {
  const x = clamp01(t) - 1;
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + (c3 * x * x * x) + (c1 * x * x);
}

function getSvgViewBox() {
  if (!svg) return { x: 0, y: 0, width: 0, height: 0 };
  const base = svg.viewBox && svg.viewBox.baseVal;
  if (base && Number.isFinite(base.width) && Number.isFinite(base.height)) {
    return {
      x: base.x,
      y: base.y,
      width: base.width,
      height: base.height,
    };
  }
  const viewBox = svg.getAttribute('viewBox');
  if (!viewBox) return { x: 0, y: 0, width: 0, height: 0 };
  const parts = viewBox.trim().split(/[\s,]+/).map(Number);
  if (parts.length < 4) return { x: 0, y: 0, width: 0, height: 0 };
  return {
    x: parts[0],
    y: parts[1],
    width: parts[2],
    height: parts[3],
  };
}

function setTransform(el, center, values) {
  const dx = values.dx || 0;
  const dy = values.dy || 0;
  const rotate = values.rotate || 0;
  const sx = values.sx == null ? 1 : values.sx;
  const sy = values.sy == null ? 1 : values.sy;
  el.setAttribute(
    'transform',
    `translate(${(center.x + dx).toFixed(3)} ${(center.y + dy).toFixed(3)}) rotate(${rotate.toFixed(3)}) scale(${sx.toFixed(4)} ${sy.toFixed(4)}) translate(${-center.x.toFixed(3)} ${-center.y.toFixed(3)})`,
  );
}

function makeSvgElement(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
  return el;
}

function buildAudioUrl(name) {
  return new URL(`${BG_AUDIO_BASE}${name}`, window.location.href).toString();
}

function createAudioAsset(url, loop = false) {
  const audio = new Audio(url);
  audio.preload = 'auto';
  audio.loop = loop;
  audio.volume = 1;
  return audio;
}

function setupAudioElement(audio, loop = false) {
  audio.preload = 'auto';
  audio.loop = loop;
  audio.volume = 1;
  return audio;
}

function ensureAudioAssets() {
  if (audioAssets) return audioAssets;
  const burnElement = document.getElementById('burnAudio');
  audioAssets = {
    burn: burnElement ? setupAudioElement(burnElement, true) : createAudioAsset(buildAudioUrl('燃烧.mp3'), true),
    strawberry: createAudioAsset(buildAudioUrl('strawberry.mp3'), true),
    footstep: createAudioAsset(buildAudioUrl('0-脚步声.m4a')),
    dayOneCue: createAudioAsset(buildAudioUrl('1-ei疑问.m4a')),
  };
  return audioAssets;
}

function attemptPlayAudio(audio, pendingKey) {
  if (!audio) return false;
  try {
    if (!audio.loop || audio.paused) {
      audio.currentTime = 0;
    }
  } catch (error) {
    // ignore
  }
  const promise = audio.play();
  if (promise && typeof promise.catch === 'function') {
    promise.then(() => {
      if (pendingKey === 'burn') burnAudioStarted = true;
    }).catch(() => {
      if (pendingKey) audioPendingKeys.add(pendingKey);
    });
  } else if (pendingKey === 'burn') {
    burnAudioStarted = true;
  }
  return true;
}

function stopAudio(audio) {
  if (!audio) return;
  audio.pause();
  try {
    audio.currentTime = 0;
  } catch (error) {
    // ignore
  }
}

function startAmbientBurnAudio() {
  const assets = ensureAudioAssets();
  ambientMode = 'burn';
  audioPendingKeys.delete('strawberry');
  stopAudio(assets.strawberry);
  attemptPlayAudio(assets.burn, 'burn');
}

function startFirstDayTextAfterBurnAudio() {
  if (activeDayTextIndex >= 0 || dayTextStartWaitingForAudio) return;
  dayTextStartWaitingForAudio = true;
  const tryStart = () => {
    const assets = ensureAudioAssets();
    startAmbientBurnAudio();
    if (assets.burn && !assets.burn.paused) {
      burnAudioStarted = true;
    }
    if (burnAudioStarted || (assets.burn && !assets.burn.paused)) {
      dayTextStartWaitingForAudio = false;
      revealNextDayText(performance.now());
      return;
    }
    dayTextAutoTimer = window.setTimeout(tryStart, 250);
  };
  tryStart();
}

function startAmbientStrawberryAudio() {
  const assets = ensureAudioAssets();
  ambientMode = 'strawberry';
  audioPendingKeys.delete('burn');
  burnAudioStarted = false;
  stopAudio(assets.burn);
  attemptPlayAudio(assets.strawberry, 'strawberry');
}

function playFootstepAudio() {
  const assets = ensureAudioAssets();
  attemptPlayAudio(assets.footstep, 'footstep');
}

function playDayOneCueAudio() {
  const assets = ensureAudioAssets();
  attemptPlayAudio(assets.dayOneCue, 'day-one-cue');
}

function flushPendingAudio() {
  if (!audioPendingKeys.size) return;
  const assets = ensureAudioAssets();
  const pending = Array.from(audioPendingKeys);
  audioPendingKeys = new Set();
  pending.forEach((key) => {
    if (key === 'burn') {
      attemptPlayAudio(assets.burn, 'burn');
      return;
    }
    if (key === 'strawberry') {
      attemptPlayAudio(assets.strawberry, 'strawberry');
      return;
    }
    if (key === 'footstep') {
      attemptPlayAudio(assets.footstep, 'footstep');
      return;
    }
    if (key === 'day-one-cue') {
      attemptPlayAudio(assets.dayOneCue, 'day-one-cue');
      return;
    }
  });
}

function directChildGroups(group) {
  return Array.from(group.children).filter((child) => child.tagName && child.tagName.toLowerCase() === 'g');
}

function pointsFromAttribute(points) {
  const values = (points || '').trim().split(/[\s,]+/).map(Number).filter(Number.isFinite);
  const result = [];
  for (let index = 0; index + 1 < values.length; index += 2) {
    result.push({ x: values[index], y: values[index + 1] });
  }
  return result;
}

function pathAnchorPoints(pathData) {
  const values = (pathData || '').match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi);
  if (!values) return [];
  const numbers = values.map(Number).filter(Number.isFinite);
  const result = [];
  for (let index = 0; index + 1 < numbers.length; index += 2) {
    result.push({ x: numbers[index], y: numbers[index + 1] });
  }
  return result;
}

function lowestAnchorPoint(group) {
  const points = [];
  Array.from(group.querySelectorAll('polygon, path')).forEach((shape) => {
    const tag = shape.tagName.toLowerCase();
    if (tag === 'polygon') {
      points.push(...pointsFromAttribute(shape.getAttribute('points')));
    } else if (tag === 'path') {
      points.push(...pathAnchorPoints(shape.getAttribute('d')));
    }
  });
  if (points.length) {
    const bottomY = Math.max(...points.map((point) => point.y));
    const bottomPoints = points.filter((point) => Math.abs(point.y - bottomY) < 0.75);
    const x = bottomPoints.reduce((sum, point) => sum + point.x, 0) / bottomPoints.length;
    return { x, y: bottomY };
  }
  const box = group.getBBox();
  return { x: box.x + box.width / 2, y: box.y + box.height };
}

function shapeElements(group) {
  return Array.from(group.querySelectorAll('polygon,path'));
}

function interpolateNumbers(from, to, progress) {
  if (from.length !== to.length) return progress < 1 ? from : to;
  return from.map((value, index) => value + (to[index] - value) * progress);
}

function parsePoints(points) {
  const values = points.trim().split(/[\s,]+/).map(Number);
  const pairs = [];
  for (let i = 0; i < values.length; i += 2) pairs.push({ x: values[i], y: values[i + 1] });
  return pairs;
}

function formatPoints(points) {
  return points.map((point) => `${point.x.toFixed(3)},${point.y.toFixed(3)}`).join(' ');
}

const PATH_TOKEN_RE = /[AaCcHhLlMmQqSsTtVvZz]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi;
const PATH_ARITY = {
  A: 7,
  C: 6,
  H: 1,
  L: 2,
  M: 2,
  Q: 4,
  S: 4,
  T: 2,
  V: 1,
  Z: 0,
};

function isPathCommand(token) {
  return /^[AaCcHhLlMmQqSsTtVvZz]$/.test(token);
}

function parsePathSegments(value) {
  const tokens = value.match(PATH_TOKEN_RE) || [];
  const segments = [];
  let index = 0;
  let command = null;
  let x = 0;
  let y = 0;
  let startX = 0;
  let startY = 0;

  while (index < tokens.length) {
    if (isPathCommand(tokens[index])) {
      command = tokens[index];
      index += 1;
    }
    if (!command) break;

    let upper = command.toUpperCase();
    if (upper === 'Z') {
      segments.push({ type: 'Z', values: [] });
      x = startX;
      y = startY;
      command = null;
      continue;
    }

    const relative = command !== upper;
    let firstMove = upper === 'M';
    let arity = PATH_ARITY[upper];
    while (index < tokens.length && !isPathCommand(tokens[index])) {
      const chunk = tokens.slice(index, index + arity);
      if (chunk.length < arity || chunk.some(isPathCommand)) break;
      const values = chunk.map(Number);
      index += arity;

      if (upper === 'M') {
        x = relative ? x + values[0] : values[0];
        y = relative ? y + values[1] : values[1];
        if (firstMove) {
          startX = x;
          startY = y;
          segments.push({ type: 'M', values: [x, y] });
          firstMove = false;
        } else {
          segments.push({ type: 'L', values: [x, y] });
        }
        command = relative ? 'l' : 'L';
        upper = 'L';
        arity = PATH_ARITY.L;
      } else if (upper === 'H') {
        x = relative ? x + values[0] : values[0];
        segments.push({ type: 'L', values: [x, y] });
      } else if (upper === 'V') {
        y = relative ? y + values[0] : values[0];
        segments.push({ type: 'L', values: [x, y] });
      } else if (upper === 'L') {
        x = relative ? x + values[0] : values[0];
        y = relative ? y + values[1] : values[1];
        segments.push({ type: 'L', values: [x, y] });
      } else if (upper === 'C') {
        const normalized = relative
          ? [x + values[0], y + values[1], x + values[2], y + values[3], x + values[4], y + values[5]]
          : values;
        x = normalized[4];
        y = normalized[5];
        segments.push({ type: 'C', values: normalized });
      } else if (upper === 'S') {
        const normalized = relative
          ? [x + values[0], y + values[1], x + values[2], y + values[3]]
          : values;
        x = normalized[2];
        y = normalized[3];
        segments.push({ type: 'S', values: normalized });
      } else {
        return null;
      }
    }
  }

  return segments;
}

function compatiblePathSegments(from, to) {
  if (!from || !to || from.length !== to.length) return false;
  return from.every((segment, index) => (
    segment.type === to[index].type
    && segment.values.length === to[index].values.length
  ));
}

function formatPathSegments(segments) {
  return segments.map((segment) => {
    if (segment.type === 'Z') return 'Z';
    return `${segment.type}${segment.values.map((value) => Number(value).toFixed(3)).join(',')}`;
  }).join('');
}

function interpolatePathSegments(from, to, progress) {
  return to.map((segment, index) => ({
    type: segment.type,
    values: interpolateNumbers(from[index].values, segment.values, progress),
  }));
}

function interpolatePoints(from, to, progress) {
  if (from.length !== to.length) return progress < 1 ? from : to;
  return from.map((point, index) => ({
    x: point.x + (to[index].x - point.x) * progress,
    y: point.y + (to[index].y - point.y) * progress,
  }));
}

function svgSpacePointFromElementPoint(element, point) {
  if (!svg || !element || !point) return point;
  const screenCTM = element.getScreenCTM();
  const rootCTM = svg.getScreenCTM ? svg.getScreenCTM() : null;
  if (!screenCTM || !rootCTM) return point;

  const localPoint = svg.createSVGPoint();
  localPoint.x = point.x;
  localPoint.y = point.y;

  const viewportPoint = localPoint.matrixTransform(screenCTM);
  const viewportSvgPoint = svg.createSVGPoint();
  viewportSvgPoint.x = viewportPoint.x;
  viewportSvgPoint.y = viewportPoint.y;
  return viewportSvgPoint.matrixTransform(rootCTM.inverse());
}

function pathHighestPoint(path) {
  if (!path || typeof path.getTotalLength !== 'function') return null;
  const total = path.getTotalLength();
  if (!Number.isFinite(total) || total <= 0) return null;
  const samples = Math.max(48, Math.ceil(total / 8));
  let best = null;
  for (let i = 0; i <= samples; i += 1) {
    const point = path.getPointAtLength((total * i) / samples);
    if (!best || point.y < best.y || (Math.abs(point.y - best.y) < 0.001 && point.x < best.x)) {
      best = { x: point.x, y: point.y };
    }
  }
  return svgSpacePointFromElementPoint(path, best);
}

function setupFlameGroup() {
  ['夜晚背景', '夜晚阴影', '夜晚-文字1', '夜晚-文字2', '几何'].forEach((layerName) => {
    const layer = svg.querySelector(`[data-name="${layerName}"]`);
    if (layer) layer.style.display = 'none';
  });

  flame = svg.querySelector('[data-name="蛋糕-火苗"]');
  if (!flame) throw new Error('没有找到“蛋糕-火苗”图层。');

  flame.classList.add('flame-layer');
  flamePaths = Array.from(flame.querySelectorAll('path'));
  flamePaths.forEach((path, index) => {
    path.classList.add(['flame-outer', 'flame-middle', 'flame-core'][index] || 'flame-core');
  });

  const box = flame.getBBox();
  anchor = {
    x: box.x + (box.width * 0.52),
    y: box.y + (box.height * 0.92),
  };

  const defs = svg.querySelector('defs') || svg.insertBefore(makeSvgElement('defs'), svg.firstChild);
  if (!svg.querySelector('#flameGlowGradient')) {
    glowGradient = makeSvgElement('radialGradient', {
      id: 'flameGlowGradient',
      cx: '50%',
      cy: '46%',
      r: '62%',
    });
    glowGradient.appendChild(makeSvgElement('stop', {
      offset: '0%',
      'stop-color': '#ffeeb4',
      'stop-opacity': '0.55',
    }));
    glowGradient.appendChild(makeSvgElement('stop', {
      offset: '55%',
      'stop-color': '#ffb95c',
      'stop-opacity': '0.24',
    }));
    glowGradient.appendChild(makeSvgElement('stop', {
      offset: '100%',
      'stop-color': '#ff9130',
      'stop-opacity': '0',
    }));
    defs.appendChild(glowGradient);
  } else {
    glowGradient = svg.querySelector('#flameGlowGradient');
  }
  flameGlowStops = glowGradient ? Array.from(glowGradient.querySelectorAll('stop')) : [];

  flameGlow = makeSvgElement('ellipse', {
    class: 'flame-glow',
    cx: (box.x + box.width / 2).toFixed(3),
    cy: (box.y + box.height / 2).toFixed(3),
    rx: (box.width * 0.72).toFixed(3),
    ry: (box.height * 0.64).toFixed(3),
    fill: 'url(#flameGlowGradient)',
  });
  glowBase = {
    rx: box.width * 0.72,
    ry: box.height * 0.64,
  };
  flame.insertBefore(flameGlow, flame.firstChild);
  applyGlowSettings();
  flameTarget = { x: anchor.x, y: anchor.y };
}

function hideDayTexts() {
  window.clearTimeout(dayTextSevenOneTimer);
  dayTextSevenOneTimer = 0;
  if (dayTextSevenOne) {
    dayTextSevenOne.readyAt = 0;
  }
  dayTextLayers.forEach((entry) => {
    if (!entry || !entry.el) return;
    entry.el.style.opacity = '0';
    entry.el.style.filter = 'blur(18px)';
    setTransform(entry.el, entry.center, {
      dx: entry.startPoint.x - entry.center.x,
      dy: entry.startPoint.y - entry.center.y,
      sx: 0.5,
      sy: 0.5,
    });
  });
  if (dayTextSevenOne && dayTextSevenOne.el) {
    dayTextSevenOne.el.style.opacity = '0';
    dayTextSevenOne.el.style.filter = 'blur(18px)';
    dayTextSevenOne.el.style.display = 'none';
    setTransform(dayTextSevenOne.el, dayTextSevenOne.center, {
      dx: dayTextSevenOne.startPoint.x - dayTextSevenOne.center.x,
      dy: dayTextSevenOne.startPoint.y - dayTextSevenOne.center.y,
      sx: 0.5,
      sy: 0.5,
    });
  }
}

function setSceneMode(mode) {
  sceneMode = mode;
  const dayBg = svg.querySelector('[data-name="白天背景"]');
  const nightBg = svg.querySelector('[data-name="夜晚背景"]');
  const nightShadow = svg.querySelector('[data-name="夜晚阴影"]');
  const nightText1 = svg.querySelector('[data-name="夜晚-文字1"]');
  const nightText2 = svg.querySelector('[data-name="夜晚-文字2"]');
  const geometry = svg.querySelector('[data-name="几何"]');
  const birthdayText = svg.querySelector('[data-name="生日文字"]');

  const isDay = mode === 'day';
  const visible = (el, show) => {
    if (!el) return;
    el.style.display = show ? '' : 'none';
  };

  visible(dayBg, isDay);
  visible(nightBg, !isDay);
  visible(nightShadow, !isDay);
  visible(nightText1, !isDay);
  visible(nightText2, !isDay);
  visible(geometry, false);
  if (birthdayText && !birthdayTextStarted) {
    visible(birthdayText, false);
  }
  if (isDay) {
    resetNightTextLayers();
    resetGeometryAnimation();
    resetBirthdayTextAnimation();
  }

  const bgColor = isDay ? '#fffdf3' : '#31375d';
  STAGE.style.background = bgColor;
  document.body.style.background = bgColor;
  document.body.classList.toggle('scene-night', !isDay);
}

function setupCakeLayers() {
  cakeLayers = ['蛋糕-1', '蛋糕-2'].map((layerName, index) => {
    const layer = svg.querySelector(`[data-name="${layerName}"]`);
    if (!layer) return null;
    layer.classList.add('cake-layer');
    const box = layer.getBBox();
    return {
      el: layer,
      center: { x: box.x + box.width / 2, y: box.y + box.height / 2 },
      phase: rand(0, Math.PI * 2),
      phase2: rand(0, Math.PI * 2),
      phase3: rand(0, Math.PI * 2),
      wobbleX: index === 0 ? 1.6 : 1.1,
      wobbleY: index === 0 ? 2.6 : 1.9,
      sway: index === 0 ? 1.9 : 1.3,
      stretchX: index === 0 ? 0.028 : 0.022,
      stretchY: index === 0 ? 0.036 : 0.028,
      rot: index === 0 ? 1.8 : 1.35,
    };
  }).filter(Boolean);
}

function setupCakeExtras() {
  cakeZero = svg.querySelector('[data-name="蛋糕-0"]');
  if (cakeZero) {
    cakeZero.classList.add('cake-layer');
    const box = cakeZero.getBBox();
    cakeZero.__motion = {
      center: { x: box.x + box.width / 2, y: box.y + box.height / 2 },
      phase: rand(0, Math.PI * 2),
      phase2: rand(0, Math.PI * 2),
      wobbleX: 0.75,
      wobbleY: 1.1,
      stretchX: 0.012,
      stretchY: 0.015,
      rot: 0.82,
    };
  }

  rabbitLayer = svg.querySelector('[data-name="蛋糕-兔子"]');
  if (rabbitLayer) {
    rabbitLayer.classList.add('cake-layer');
    const box = rabbitLayer.getBBox();
    rabbitLayer.__motion = {
      center: { x: box.x + box.width / 2, y: box.y + box.height },
      phase: rand(0, Math.PI * 2),
      phase2: rand(0, Math.PI * 2),
      wobbleX: 5.8,
      wobbleY: 1.35,
      stretchX: 0.018,
      stretchY: 0.023,
      rot: 7.6,
    };
  }

  arrowLayer = svg.querySelector('[data-name="蛋糕-箭头"]');
  if (arrowLayer) {
    arrowLayer.classList.add('cake-layer');
    const box = arrowLayer.getBBox();
    arrowPath = arrowLayer.querySelector('[data-name="箭头"], #_箭头, path');
    arrowLayer.__motion = {
      center: { x: box.x + box.width / 2, y: box.y + box.height },
      phase: rand(0, Math.PI * 2),
      phase2: rand(0, Math.PI * 2),
      wobbleX: 2.2,
      wobbleY: 0.52,
      stretchX: 0.008,
      stretchY: 0.01,
      rot: 2.2,
    };
  }

  const starGroup = svg.querySelector('[data-name="蛋糕-小星星"]');
  if (starGroup) {
    starGroup.classList.add('cake-layer');
    const orderedStars = Array.from(starGroup.querySelectorAll('path'))
      .map((path) => {
        const box = path.getBBox();
        const baseSpinSpeed = rand(0.00055, 0.0011);
        return {
          el: path,
          center: { x: box.x + box.width / 2, y: box.y + box.height / 2 },
          phase: rand(0, Math.PI * 2),
          baseSpinSpeed,
          spinSpeed: baseSpinSpeed * starSpinMultiplier,
          wobble: 0.5,
        };
      })
      .sort((a, b) => a.center.x - b.center.x);
    starPaths = orderedStars.map((star, index, stars) => {
      const dir = index === 1 ? 1 : -1;
      const variance = stars.length >= 3
        ? [0.94, 1, 1.06][index] || 1
        : 1;
      return {
        ...star,
        spinDir: dir,
        spinSpeed: star.baseSpinSpeed * starSpinMultiplier * variance,
        wobble: [0.8, 0.55, 0.42][index] || 0.5,
      };
    });
  }
}

function makeDayTextEntry(el) {
  if (!el) return null;
  el.classList.add('day-text-layer');
  const bounds = el.getBBox();
  const center = {
    x: bounds.x + (bounds.width / 2),
    y: bounds.y + (bounds.height / 2),
  };
  const startPoint = {
    x: center.x + 24,
    y: center.y - 18,
  };
  const entry = {
    el,
    center,
    startPoint,
    startAt: 0,
    duration: 2000,
    started: false,
    readyAt: 0,
  };
  el.style.opacity = '0';
  el.style.filter = 'blur(18px)';
  el.style.pointerEvents = 'none';
  setTransform(el, center, {
    dx: startPoint.x - center.x,
    dy: startPoint.y - center.y,
    sx: 0.5,
    sy: 0.5,
  });
  return entry;
}

function setupDayTextLayers() {
  dayTextLayers = Array.from({ length: 8 }, (_, index) => {
    const el = svg.querySelector(`[data-name="白天-文字${index + 1}"]`);
    const entry = makeDayTextEntry(el);
    if (!entry) return null;
    entry.dayIndex = index;
    entry.leadSoundPlayed = false;
    entry.cueSoundPlayed = false;
    return entry;
  }).filter(Boolean);
  dayTextSevenOne = makeDayTextEntry(svg.querySelector('[data-name="白天-文字7-1"]'));
  if (dayTextSevenOne && dayTextSevenOne.el) {
    dayTextSevenOne.el.style.display = 'none';
    dayTextSevenOne.started = false;
  }
}

function setupNightTextLayers() {
  nightTextLayers = ['夜晚-文字1', '夜晚-文字2'].map((layerName, layerIndex) => {
    const el = svg.querySelector(`[data-name="${layerName}"]`);
    if (!el) return null;
    const previousDisplay = el.style.display;
    el.style.display = '';
    el.classList.add('night-text-layer');
    const glyphs = Array.from(el.children)
      .filter((child) => child.tagName && child.tagName.toLowerCase() !== 'defs')
      .map((child) => {
        const box = child.getBBox();
        const center = {
          x: box.x + box.width / 2,
          y: box.y + box.height / 2,
        };
        child.classList.add('night-glyph');
        child.style.opacity = '0';
        child.removeAttribute('transform');
        return { el: child, box, center, layerIndex, startAt: 0 };
      })
      .sort((a, b) => (a.box.x - b.box.x) || (a.box.y - b.box.y));
    el.style.display = previousDisplay;
    return { el, glyphs };
  }).filter(Boolean);

  nightGlyphs = nightTextLayers.flatMap((layer) => layer.glyphs);
  if (nightCursor) nightCursor.remove();
  nightCursor = makeSvgElement('rect', {
    class: 'night-cursor',
    x: '0',
    y: '0',
    width: '1.4',
    height: '11',
    rx: '0.7',
  });
  nightCursor.style.opacity = '0';
  const textParent = (nightTextLayers[0] && nightTextLayers[0].el && nightTextLayers[0].el.parentNode) || svg;
  textParent.appendChild(nightCursor);
}

function resetNightTextLayers() {
  nightTypingActive = false;
  nightTypingDone = false;
  nightTypingStart = 0;
  nightGlyphs.forEach((glyph) => {
    glyph.startAt = 0;
    glyph.el.style.opacity = '0';
    glyph.el.removeAttribute('transform');
  });
  if (nightCursor) {
    nightCursor.style.opacity = '0';
  }
}

function startNightTextTyping(time = performance.now()) {
  resetNightTextLayers();
  resetGeometryAnimation();
  nightTypingStart = time + 180;
  nightTypingActive = true;
  nightTypingDone = false;
  if (nightCursor) {
    const firstBox = nightGlyphs[0] && nightGlyphs[0].box;
    if (firstBox) {
      nightCursor.setAttribute('x', (firstBox.x - 4).toFixed(3));
      nightCursor.setAttribute('y', (firstBox.y - 0.6).toFixed(3));
      nightCursor.setAttribute('height', (firstBox.height + 1.2).toFixed(3));
    }
    nightCursor.style.opacity = '1';
  }
}

function setupGeometryAnimation() {
  const geometry = svg.querySelector('[data-name="几何"]');
  if (!geometry) return;
  const previousDisplay = geometry.style.display;
  geometry.style.display = '';
  geometryItems = [1, 2, 3, 4].map((index) => {
    const el = svg.querySelector(`[data-name="几何${index}"]`);
    if (!el) return null;
    const box = el.getBBox();
    const center = {
      x: box.x + box.width / 2,
      y: box.y + box.height / 2,
    };
    return {
      el,
      box,
      center,
      baseTransform: el.getAttribute('transform') || '',
    };
  }).filter(Boolean);
  geometry.style.display = previousDisplay;
  resetGeometryAnimation();
}

function resetGeometryAnimation() {
  geometryAnimationActive = false;
  geometryAnimationStart = 0;
  geometryCursorPoint = null;
  const geometry = svg && svg.querySelector('[data-name="几何"]');
  if (geometry) geometry.style.display = 'none';
  geometryItems.forEach((item) => {
    item.el.style.opacity = '0';
    item.el.style.display = 'none';
    if (item.baseTransform) {
      item.el.setAttribute('transform', item.baseTransform);
    } else {
      item.el.removeAttribute('transform');
    }
  });
}

function startGeometryAnimation(time = performance.now(), cursorBox = null) {
  if (!geometryItems.length) return;
  const geometry = svg.querySelector('[data-name="几何"]');
  if (geometry) geometry.style.display = '';
  geometryCursorPoint = cursorBox
    ? { x: cursorBox.x + cursorBox.width + 4, y: cursorBox.y + cursorBox.height / 2 }
    : { x: geometryItems[0].center.x - 18, y: geometryItems[0].center.y };
  geometryItems.forEach((item) => {
    item.el.style.opacity = '0';
    item.el.style.display = 'none';
  });
  geometryAnimationStart = time;
  geometryAnimationActive = true;
}

function pairBirthdayShapes(initialGroup, finalGroup) {
  const initialShapes = shapeElements(initialGroup);
  const finalShapes = shapeElements(finalGroup);
  const count = Math.min(initialShapes.length, finalShapes.length);
  const pairs = [];
  for (let index = 0; index < count; index += 1) {
    const initial = initialShapes[index];
    const final = finalShapes[index];
    const tag = final.tagName.toLowerCase();
    if (tag !== initial.tagName.toLowerCase()) continue;
    if (tag === 'polygon') {
      pairs.push({
        el: final,
        type: 'points',
        from: parsePoints(initial.getAttribute('points')),
        to: parsePoints(final.getAttribute('points')),
      });
    } else if (tag === 'path') {
      const from = parsePathSegments(initial.getAttribute('d'));
      const to = parsePathSegments(final.getAttribute('d'));
      pairs.push(compatiblePathSegments(from, to)
        ? { el: final, type: 'path', from, to }
        : { el: final, type: 'path-swap', from: initial.getAttribute('d'), to: final.getAttribute('d') });
    }
  }
  return pairs;
}

function setBirthdayPieceProgress(piece, progress) {
  piece.shapes.forEach((shape) => {
    if (shape.type === 'points') {
      shape.el.setAttribute('points', formatPoints(interpolatePoints(shape.from, shape.to, progress)));
    } else if (shape.type === 'path') {
      shape.el.setAttribute('d', formatPathSegments(interpolatePathSegments(shape.from, shape.to, progress)));
    } else {
      shape.el.setAttribute('d', progress < 0.8 ? shape.from : shape.to);
    }
  });
}

function setBirthdayPieceTransform(piece, values) {
  const scale = values.scale == null ? 1 : values.scale;
  const center = values.center || piece.finalCenter;
  const rotate = values.rotate || 0;
  const dx = values.dx || 0;
  const dy = values.dy || 0;
  if (
    Math.abs(scale - 1) < 0.0001
    && Math.abs(rotate) < 0.0001
    && Math.abs(dx) < 0.0001
    && Math.abs(dy) < 0.0001
  ) {
    if (piece.baseTransform) {
      piece.el.setAttribute('transform', piece.baseTransform);
    } else {
      piece.el.removeAttribute('transform');
    }
    return;
  }
  const tx = (center.x + dx).toFixed(3);
  const ty = (center.y + dy).toFixed(3);
  const transform = `translate(${tx} ${ty}) rotate(${rotate.toFixed(3)}) scale(${scale.toFixed(4)}) translate(${-center.x.toFixed(3)} ${-center.y.toFixed(3)})`;
  piece.el.setAttribute('transform', piece.baseTransform ? `${piece.baseTransform} ${transform}` : transform);
}

function setBirthdaySpecialTransform(item, values) {
  if (!item || !item.el) return;
  const sx = values.sx == null ? 1 : values.sx;
  const sy = values.sy == null ? 1 : values.sy;
  const rotate = values.rotate || 0;
  const dx = values.dx || 0;
  const dy = values.dy || 0;
  if (
    Math.abs(sx - 1) < 0.0001
    && Math.abs(sy - 1) < 0.0001
    && Math.abs(rotate) < 0.0001
    && Math.abs(dx) < 0.0001
    && Math.abs(dy) < 0.0001
  ) {
    if (item.baseTransform) {
      item.el.setAttribute('transform', item.baseTransform);
    } else {
      item.el.removeAttribute('transform');
    }
    return;
  }
  const center = item.pivot;
  const transform = `translate(${(center.x + dx).toFixed(3)} ${(center.y + dy).toFixed(3)}) rotate(${rotate.toFixed(3)}) scale(${sx.toFixed(4)} ${sy.toFixed(4)}) translate(${-center.x.toFixed(3)} ${-center.y.toFixed(3)})`;
  item.el.setAttribute('transform', item.baseTransform ? `${item.baseTransform} ${transform}` : transform);
}

function birthdayImpactProgress(morph) {
  if (morph < BIRTHDAY_IMPACT_POINT) {
    const t = morph / BIRTHDAY_IMPACT_POINT;
    return BIRTHDAY_IMPACT_POINT * ((0.16 * t) + (0.84 * easeInQuad(t)));
  }
  return BIRTHDAY_IMPACT_POINT
    + (easeOutCubic((morph - BIRTHDAY_IMPACT_POINT) / (1 - BIRTHDAY_IMPACT_POINT)) * (1 - BIRTHDAY_IMPACT_POINT));
}

function birthdayShapeProgress(progress) {
  return progress < BIRTHDAY_IMPACT_POINT ? progress / BIRTHDAY_IMPACT_POINT : 1;
}

function birthdayImpactScale(progress) {
  if (progress < BIRTHDAY_IMPACT_POINT) {
    return 1 - (easeOutCubic(progress / BIRTHDAY_IMPACT_POINT) * (1 - BIRTHDAY_IMPACT_SCALE));
  }
  const t = (progress - BIRTHDAY_IMPACT_POINT) / (1 - BIRTHDAY_IMPACT_POINT);
  return BIRTHDAY_IMPACT_SCALE + (easeOutCubic(t) * (1 - BIRTHDAY_IMPACT_SCALE));
}

function buildBirthdaySchedule(items) {
  let start = 0;
  return items.map((item, index) => {
    if (index > 0) start += rand(BIRTHDAY_STAGGER_MIN, BIRTHDAY_STAGGER_MAX);
    return Object.assign({}, item, { start });
  });
}

function makeBirthdaySpecial(group) {
  if (!group) return null;
  group.classList.add('birthday-special');
  return {
    el: group,
    pivot: lowestAnchorPoint(group),
    baseTransform: group.getAttribute('transform') || '',
    start: 0,
    duration: BIRTHDAY_HEART_MS,
  };
}

function setupBirthdaySpecialLayers() {
  const groups = directChildGroups(birthdayLayer);
  const byName = {};
  groups.forEach((group) => {
    const name = group.dataset.name || '';
    if (!byName[name]) byName[name] = [];
    byName[name].push(group);
  });

  ['爱心', '感叹号-1', '感叹号-2'].forEach((name) => {
    (byName[name] || []).slice(1).forEach((group) => {
      group.style.display = 'none';
    });
  });

  birthdaySpecials = {
    heart: makeBirthdaySpecial((byName['爱心'] || [])[0]),
    exclaim1: makeBirthdaySpecial((byName['感叹号-1'] || [])[0]),
    exclaim2: makeBirthdaySpecial((byName['感叹号-2'] || [])[0]),
  };
  if (birthdaySpecials.exclaim1) birthdaySpecials.exclaim1.duration = BIRTHDAY_EXCLAIM_MS;
  if (birthdaySpecials.exclaim2) birthdaySpecials.exclaim2.duration = BIRTHDAY_EXCLAIM_MS;
}

function setupBirthdayTextLayer() {
  birthdayLayer = svg.querySelector('[data-name="生日文字"]');
  if (!birthdayLayer) return;
  const previousDisplay = birthdayLayer.style.display;
  birthdayLayer.style.display = '';
  birthdayLayer.classList.add('birthday-text-layer');
  setupBirthdaySpecialLayers();
  const candidates = [];
  directChildGroups(birthdayLayer)
    .map((group) => ({ group, order: Number(group.dataset.name) }))
    .filter((item) => Number.isFinite(item.order))
    .sort((a, b) => a.order - b.order)
    .forEach(({ group, order }) => {
      const children = directChildGroups(group);
      if (children.length < 2) return;
      const finalGroup = children[0];
      const initialGroup = children[1];
      const shapes = pairBirthdayShapes(initialGroup, finalGroup);
      if (!shapes.length) return;
      const initialBox = initialGroup.getBBox();
      const finalBox = finalGroup.getBBox();
      initialGroup.remove();
      finalGroup.classList.add('birthday-piece');
      candidates.push({
        order,
        el: finalGroup,
        shapes,
        baseTransform: finalGroup.getAttribute('transform') || '',
        initialCenter: { x: initialBox.x + initialBox.width / 2, y: initialBox.y + initialBox.height / 2 },
        finalCenter: { x: finalBox.x + finalBox.width / 2, y: finalBox.y + finalBox.height / 2 },
        emitted: false,
        motion: {
          noiseX: rand(2.2, 5.2),
          noiseY: rand(2.2, 5.2),
          rotation: rand(-5.5, 5.5),
          swingAmplitude: rand(2.4, 4.8),
          swingPeriod: rand(654, 897),
          settleDelay: rand(0, BIRTHDAY_SETTLE_MAX_DELAY_MS),
          phaseA: rand(0, Math.PI * 2),
          phaseB: rand(0, Math.PI * 2),
        },
      });
    });
  birthdayPieces = buildBirthdaySchedule(candidates);
  birthdayParticleLayer = makeSvgElement('g', { class: 'birthday-particle-layer' });
  birthdayLayer.parentNode.insertBefore(birthdayParticleLayer, birthdayLayer.nextSibling);
  birthdayTextWasSetup = true;
  resetBirthdayTextAnimation();
  birthdayLayer.style.display = previousDisplay || 'none';
}

function resetBirthdayTextAnimation() {
  birthdayAnimationActive = false;
  birthdayAnimationStart = 0;
  birthdayTextStarted = false;
  birthdayParticles.forEach((particle) => particle.el.remove());
  birthdayParticles = [];
  if (birthdayParticleLayer) birthdayParticleLayer.replaceChildren();
  if (birthdayLayer) birthdayLayer.style.display = 'none';
  Object.values(birthdaySpecials).forEach((item) => {
    if (!item || !item.el) return;
    item.el.style.opacity = '0';
    setBirthdaySpecialTransform(item, { sx: 0, sy: 0 });
  });
  birthdayPieces.forEach((piece) => {
    piece.emitted = false;
    piece.el.style.opacity = '0';
    setBirthdayPieceProgress(piece, 0);
    setBirthdayPieceTransform(piece, { scale: 0, center: piece.initialCenter });
  });
}

function emitBirthdayParticles(piece) {
  if (!birthdayParticleLayer || !piece.shapes.length) return;
  const shape = piece.shapes[Math.floor(rand(0, piece.shapes.length))];
  if (!shape.el || typeof shape.el.getBBox !== 'function') return;
  const box = shape.el.getBBox();
  const emitter = {
    x: box.x + rand(box.width * 0.2, box.width * 0.8),
    y: box.y + rand(box.height * 0.2, box.height * 0.8),
  };
  const count = Math.max(1, Math.round(rand(1, birthdayParticleSettings.maxCount)));
  for (let index = 0; index < count; index += 1) {
    const template = BIRTHDAY_STAR_TEMPLATES[Math.floor(rand(0, BIRTHDAY_STAR_TEMPLATES.length))];
    const color = BIRTHDAY_PARTICLE_COLORS[Math.floor(rand(0, BIRTHDAY_PARTICLE_COLORS.length))];
    const star = makeSvgElement('path', {
      class: 'birthday-star-particle',
      d: template.path,
      fill: color,
    });
    const angle = index * ((Math.PI * 2) / Math.max(1, count)) + rand(-0.18, 0.18);
    const distance = rand(34, 78);
    const size = birthdayParticleSettings.size;
    birthdayParticleLayer.appendChild(star);
    birthdayParticles.push({
      el: star,
      born: performance.now(),
      duration: rand(620, 1050),
      x: emitter.x,
      y: emitter.y,
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance,
      rotate: rand(-180, 180),
      spin: rand(-170, 170),
      size,
      viewBox: template.viewBox.split(/\s+/).map(Number),
    });
  }
}

function updateBirthdayParticles(time) {
  birthdayParticles = birthdayParticles.filter((particle) => {
    const life = clamp((time - particle.born) / particle.duration, 0, 1);
    const ease = easeOutCubic(life);
    const [vx, vy, vw, vh] = particle.viewBox;
    const x = particle.x + particle.dx * ease;
    const y = particle.y + particle.dy * ease;
    const scale = particle.size * (1 - life * 0.88);
    const rotate = particle.rotate + particle.spin * ease;
    particle.el.style.opacity = Math.pow(1 - life, 1.4).toFixed(3);
    particle.el.setAttribute(
      'transform',
      `translate(${x.toFixed(3)} ${y.toFixed(3)}) rotate(${rotate.toFixed(3)}) scale(${scale.toFixed(4)}) translate(${(-(vx + vw / 2)).toFixed(3)} ${(-(vy + vh / 2)).toFixed(3)})`,
    );
    if (life >= 1) {
      particle.el.remove();
      return false;
    }
    return true;
  });
}

function birthdayAppearMotion(piece, progress) {
  const fade = 1 - easeOutCubic(progress);
  const waveA = Math.sin((progress * Math.PI * 5.8) + piece.motion.phaseA);
  const waveB = Math.sin((progress * Math.PI * 7.2) + piece.motion.phaseB);
  return {
    dx: waveA * piece.motion.noiseX * fade,
    dy: waveB * piece.motion.noiseY * fade,
    rotate: (piece.motion.rotation * fade) + (Math.sin((progress * Math.PI * 4.4) + piece.motion.phaseB) * 1.1 * fade),
  };
}

function birthdaySwingRotation(piece, swingTime) {
  return Math.sin((swingTime / piece.motion.swingPeriod) * Math.PI * 2) * piece.motion.swingAmplitude;
}

function updateExclaimSpecial(item, elapsed, start, index) {
  if (!item || !item.el) return start + BIRTHDAY_EXCLAIM_MS;
  const t = elapsed - start;
  if (t < 0) {
    item.el.style.opacity = '0';
    setBirthdaySpecialTransform(item, { sx: 0, sy: 0 });
    return start + BIRTHDAY_EXCLAIM_MS;
  }
  item.el.style.opacity = '1';
  if (t < BIRTHDAY_EXCLAIM_APPEAR_MS) {
    const progress = clamp01(t / BIRTHDAY_EXCLAIM_APPEAR_MS);
    const appear = easeOutBack(progress);
    const sway = Math.sin(progress * Math.PI * 4.2) * (1 - easeOutCubic(progress)) * (index === 0 ? -13 : 12);
    const squash = Math.sin(progress * Math.PI * 2.6) * (1 - progress) * 0.18;
    setBirthdaySpecialTransform(item, {
      sx: Math.max(0, appear * (1 + squash)),
      sy: Math.max(0, appear * (1 - squash * 0.7)),
      rotate: sway,
    });
  } else {
    const shakeProgress = clamp01((t - BIRTHDAY_EXCLAIM_APPEAR_MS) / BIRTHDAY_EXCLAIM_SHAKE_MS);
    const decay = 1 - easeOutCubic(shakeProgress);
    const dir = index === 0 ? -1 : 1;
    const fastShake = Math.sin(shakeProgress * Math.PI * 7.5) * decay * 10.5 * dir;
    const squeeze = Math.sin(shakeProgress * Math.PI * 7.5 + Math.PI * 0.35) * decay * 0.075;
    setBirthdaySpecialTransform(item, {
      sx: 1 + squeeze,
      sy: 1 - squeeze * 0.62,
      rotate: fastShake,
    });
  }
  return start + BIRTHDAY_EXCLAIM_MS;
}

function updateHeartSpecial(item, elapsed, start) {
  if (!item || !item.el) return start;
  const t = elapsed - start;
  if (t < 0) {
    item.el.style.opacity = '0';
    setBirthdaySpecialTransform(item, { sx: 0, sy: 0 });
    return start + BIRTHDAY_HEART_MS;
  }
  const progress = clamp01(t / BIRTHDAY_HEART_MS);
  const appear = easeOutBack(Math.min(1, progress * 1.45));
  const bounce = Math.sin(progress * Math.PI * 7.5) * Math.pow(1 - progress, 1.15);
  item.el.style.opacity = '1';
  setBirthdaySpecialTransform(item, {
    sx: Math.max(0, appear * (1 + bounce * 0.13)),
    sy: Math.max(0, appear * (1 - bounce * 0.22)),
    dy: -Math.abs(bounce) * 2.4,
  });
  return start + BIRTHDAY_HEART_MS;
}

function startBirthdayTextAnimation() {
  if (birthdayTextStarted || !birthdayTextWasSetup || !birthdayLayer) return;
  birthdayTextStarted = true;
  birthdayAnimationActive = true;
  birthdayAnimationStart = performance.now();
  birthdayLayer.style.display = '';
  Object.values(birthdaySpecials).forEach((item) => {
    if (!item || !item.el) return;
    item.el.style.opacity = '0';
    setBirthdaySpecialTransform(item, { sx: 0, sy: 0 });
  });
  birthdayPieces.forEach((piece) => {
    piece.emitted = false;
    piece.el.style.opacity = '0';
    setBirthdayPieceProgress(piece, 0);
    setBirthdayPieceTransform(piece, { scale: 0, center: piece.initialCenter });
  });
}

function updateBirthdayTextAnimation(time) {
  if (!birthdayAnimationActive || !birthdayPieces.length) {
    updateBirthdayParticles(time);
    return;
  }
  const elapsed = time - birthdayAnimationStart;
  const totalPieceMs = BIRTHDAY_APPEAR_MS + BIRTHDAY_MORPH_MS;
  const globalCompleteAt = Math.max(...birthdayPieces.map((piece) => piece.start + totalPieceMs));
  const wishPieces = birthdayPieces.filter((piece) => piece.order === 27 || piece.order === 28);
  const wishCompleteAt = wishPieces.length
    ? Math.max(...wishPieces.map((piece) => piece.start + totalPieceMs))
    : globalCompleteAt;
  const exclaim1Start = wishCompleteAt;
  const exclaim2Start = exclaim1Start + 180;
  const heartStart = globalCompleteAt + 120;

  birthdayPieces.forEach((piece) => {
    const t = elapsed - piece.start;
    if (t < 0) return;
    if (t < BIRTHDAY_APPEAR_MS) {
      const appear = clamp01(t / BIRTHDAY_APPEAR_MS);
      const motion = birthdayAppearMotion(piece, appear);
      piece.el.style.opacity = '1';
      setBirthdayPieceProgress(piece, 0);
      setBirthdayPieceTransform(piece, {
        scale: easeOutCubic(appear),
        center: piece.initialCenter,
        rotate: motion.rotate,
        dx: motion.dx,
        dy: motion.dy,
      });
      return;
    }

    piece.el.style.opacity = '1';
    if (t < totalPieceMs) {
      const morph = clamp01((t - BIRTHDAY_APPEAR_MS) / BIRTHDAY_MORPH_MS);
      const transition = birthdayImpactProgress(morph);
      setBirthdayPieceTransform(piece, {
        scale: birthdayImpactScale(transition),
        center: piece.finalCenter,
      });
      setBirthdayPieceProgress(piece, birthdayShapeProgress(transition));
      if (!piece.emitted && transition >= BIRTHDAY_IMPACT_POINT) {
        piece.emitted = true;
        emitBirthdayParticles(piece);
      }
    } else {
      setBirthdayPieceProgress(piece, 1);
      const swingTime = t - totalPieceMs;
      setBirthdayPieceTransform(piece, {
        scale: 1,
        center: piece.finalCenter,
        rotate: birthdaySwingRotation(piece, swingTime),
      });
    }
  });

  const exclaim1End = updateExclaimSpecial(birthdaySpecials.exclaim1, elapsed, exclaim1Start, 0);
  const exclaim2End = updateExclaimSpecial(birthdaySpecials.exclaim2, elapsed, exclaim2Start, 1);
  const heartEnd = updateHeartSpecial(birthdaySpecials.heart, elapsed, heartStart);
  const specialEndAt = Math.max(exclaim1End, exclaim2End, heartEnd);

  if (elapsed >= specialEndAt) {
    Object.values(birthdaySpecials).forEach((item) => {
      if (!item || !item.el) return;
      item.el.style.opacity = '1';
      setBirthdaySpecialTransform(item, { sx: 1, sy: 1 });
    });
  }
  updateBirthdayParticles(time);
}

function applyGlowSettings() {
  if (!flameGlow) return;
  const sizeScale = clamp(glowSettings.size, 0.35, 1.45);
  const intensity = clamp01(glowSettings.intensity);
  const opacity = clamp01(glowSettings.opacity);
  flameGlow.setAttribute('rx', (glowBase.rx * sizeScale).toFixed(3));
  flameGlow.setAttribute('ry', (glowBase.ry * sizeScale).toFixed(3));
  flameGlow.style.opacity = opacity.toFixed(3);

  if (glowGradient) {
    const gradientRadius = clamp(62 + ((sizeScale - 0.72) * 18), 44, 86);
    glowGradient.setAttribute('r', `${gradientRadius.toFixed(1)}%`);
    const innerColor = mixHexColor('#fff5c7', '#ffdd73', intensity);
    const midColor = mixHexColor('#ffbe66', '#ff9236', intensity);
    const outerColor = mixHexColor('#ff9c4d', '#ff5c24', intensity);
    const innerOpacity = clamp01(0.72 + (intensity * 0.08));
    const midOpacity = clamp01(0.3 + (intensity * 0.08));
    const outerOpacity = clamp01(0.08 + (intensity * 0.02));
    if (flameGlowStops[0]) {
      flameGlowStops[0].setAttribute('stop-color', innerColor);
      flameGlowStops[0].setAttribute('stop-opacity', innerOpacity.toFixed(3));
    }
    if (flameGlowStops[1]) {
      flameGlowStops[1].setAttribute('stop-color', midColor);
      flameGlowStops[1].setAttribute('stop-opacity', midOpacity.toFixed(3));
    }
    if (flameGlowStops[2]) {
      flameGlowStops[2].setAttribute('stop-color', outerColor);
      flameGlowStops[2].setAttribute('stop-opacity', outerOpacity.toFixed(3));
    }
  }
}

function bindGlowPanel() {
  const intensityInput = document.getElementById('glowIntensity');
  const sizeInput = document.getElementById('glowSize');
  const opacityInput = document.getElementById('glowOpacity');
  const inputs = [intensityInput, sizeInput, opacityInput];
  if (inputs.some((input) => !input)) return;

  const sync = () => {
    glowSettings.intensity = clamp01(Number(intensityInput.value) / 100);
    glowSettings.size = clamp(Number(sizeInput.value) / 100, 0.35, 1.45);
    glowSettings.opacity = clamp01(Number(opacityInput.value) / 100);
    applyGlowSettings();
  };

  inputs.forEach((input) => input.addEventListener('input', sync));
  sync();
}

function bindBirthdayParticlePanel() {
  const sizeInput = document.getElementById('birthdayParticleSize');
  const countInput = document.getElementById('birthdayParticleCount');
  const starSpinInput = document.getElementById('starSpinMultiplier');
  if (!sizeInput) return;

  const sync = () => {
    birthdayParticleSettings.size = clamp(Number(sizeInput.value) / 100, 0.1, 1);
    if (countInput) {
      birthdayParticleSettings.maxCount = Math.round(clamp(Number(countInput.value), 1, 8));
    }
    if (starSpinInput) {
      starSpinMultiplier = clamp(Number(starSpinInput.value) / 100, 1, 240);
      if (starPaths.length) {
        starPaths.forEach((star) => {
          if (star.baseSpinSpeed == null) star.baseSpinSpeed = star.spinSpeed / starSpinMultiplier;
          star.spinSpeed = star.baseSpinSpeed * starSpinMultiplier;
        });
      }
    }
  };

  sizeInput.addEventListener('input', sync);
  if (countInput) countInput.addEventListener('input', sync);
  if (starSpinInput) starSpinInput.addEventListener('input', sync);
  sync();
}

function bindVolumePanel() {
  volumeToggleButton = document.getElementById('volumeToggle');
  volumeMeterFill = document.getElementById('volumeMeterFill');
  volumeValueLabel = document.getElementById('volumeValue');
  volumeRow = document.getElementById('volumeRow');
  if (!volumeToggleButton || !volumeMeterFill || !volumeValueLabel || !volumeRow) return;

  volumeDisplayVisible = false;
  volumeRow.hidden = true;
  volumeToggleButton.addEventListener('click', () => {
    volumeDisplayVisible = !volumeDisplayVisible;
    volumeRow.hidden = !volumeDisplayVisible;
    updateVolumeDisplay();
  });
  updateVolumeDisplay();
}

function bindControlPanelVisibility() {
  const panel = document.getElementById('controlPanel');
  const toggle = document.getElementById('panelToggle');
  if (!panel || !toggle) return;

  const setVisible = (visible) => {
    panel.hidden = !visible;
    toggle.setAttribute('aria-expanded', visible ? 'true' : 'false');
  };

  setVisible(false);
  toggle.addEventListener('click', () => setVisible(panel.hidden));
}

function revealNextDayText(time = performance.now()) {
  if (activeDayTextIndex >= 6) return false;
  if (activeDayTextIndex >= 0) {
    const current = dayTextLayers[activeDayTextIndex];
    if (current && current.started && (time - current.startAt) < current.duration) {
      return false;
    }
  }
  const nextIndex = activeDayTextIndex + 1;
  const next = dayTextLayers[nextIndex];
  if (!next) return false;
  if (activeDayTextIndex >= 0) {
    const current = dayTextLayers[activeDayTextIndex];
    if (current) {
      current.el.style.opacity = '0';
      current.el.style.filter = 'blur(18px)';
      current.el.style.display = 'none';
      setTransform(current.el, current.center, {
        dx: current.startPoint.x - current.center.x,
        dy: current.startPoint.y - current.center.y,
        sx: 0.5,
        sy: 0.5,
      });
    }
  }
  activeDayTextIndex = nextIndex;
  next.startAt = time;
  next.started = true;
  window.clearTimeout(dayTextSevenOneTimer);
  dayTextSevenOneTimer = 0;
  if (nextIndex === 6 && dayTextSevenOne && dayTextSevenOne.el) {
    dayTextSevenOne.readyAt = next.startAt + 1000;
    dayTextSevenOneTimer = window.setTimeout(() => {
      if (extinguished || !blowStageArmed) return;
      if (!dayTextLayers[6] || !dayTextLayers[6].started) return;
      if (!dayTextSevenOne || dayTextSevenOne.started) return;
      revealDayTextEntry(dayTextSevenOne, dayTextSevenOne.readyAt || (dayTextLayers[6].startAt + 1000));
    }, 1000);
  }
  if (next.dayIndex === 0 && !next.leadSoundPlayed) {
    next.leadSoundPlayed = true;
    playFootstepAudio();
  }
  return true;
}

function hideDayTextEntry(entry) {
  if (!entry || !entry.el) return;
  entry.el.style.opacity = '0';
  entry.el.style.filter = 'blur(18px)';
  entry.el.style.display = 'none';
  entry.started = false;
  entry.readyAt = 0;
  setTransform(entry.el, entry.center, {
    dx: entry.startPoint.x - entry.center.x,
    dy: entry.startPoint.y - entry.center.y,
    sx: 0.5,
    sy: 0.5,
  });
}

function revealDayTextEntry(entry, time = performance.now()) {
  if (!entry || !entry.el) return false;
  entry.el.style.display = '';
  entry.startAt = time;
  entry.started = true;
  entry.readyAt = 0;
  return true;
}

function revealBlowText(time = performance.now()) {
  const next = dayTextLayers[7];
  if (!next) return false;
  hideDayTextEntry(dayTextLayers[6]);
  hideDayTextEntry(dayTextSevenOne);
  revealDayTextEntry(next, time);
  activeDayTextIndex = 7;
  blowTextVisible = true;
  return true;
}

function hideBlowText() {
  const text = dayTextLayers[7];
  if (!text || !text.el) return;
  hideDayTextEntry(text);
  blowTextVisible = false;
  micAboveStart = 0;
  if (!extinguished && blowStageArmed) {
    activeDayTextIndex = 6;
    const seven = dayTextLayers[6];
    if (seven && seven.el) {
      seven.el.style.display = '';
      seven.el.style.opacity = '1';
      seven.el.style.filter = 'blur(0px)';
      setTransform(seven.el, seven.center, { sx: 1, sy: 1 });
      seven.started = true;
    }
    if (dayTextSevenOne && dayTextSevenOne.started) {
      dayTextSevenOne.el.style.display = '';
    }
  }
}

function updateDayTextEntry(entry, time) {
  if (!entry || !entry.el || !entry.started) return 0;
  const elapsed = time - entry.startAt;
  const progress = easeOutQuint(elapsed / entry.duration);
  if (entry.dayIndex === 0 && !entry.cueSoundPlayed && time >= entry.startAt + entry.duration - 500) {
    entry.cueSoundPlayed = true;
    playDayOneCueAudio();
  }
  const scale = 0.5 + (0.5 * progress);
  const blur = 18 * (1 - progress);
  const opacity = progress;
  const currentPoint = {
    x: entry.startPoint.x + ((entry.center.x - entry.startPoint.x) * progress),
    y: entry.startPoint.y + ((entry.center.y - entry.startPoint.y) * progress),
  };
  setTransform(entry.el, entry.center, {
    dx: currentPoint.x - entry.center.x,
    dy: currentPoint.y - entry.center.y,
    sx: scale,
    sy: scale,
  });
  entry.el.style.opacity = opacity.toFixed(3);
  entry.el.style.filter = `blur(${blur.toFixed(2)}px)`;
  return progress;
}

function updateDayTextLayers(time) {
  if (!dayTextLayers.length) return;
  dayTextLayers.forEach((entry) => {
    if (!entry || !entry.el) return;
    if (dayTextLayers.indexOf(entry) !== activeDayTextIndex) {
      return;
    }
    const progress = updateDayTextEntry(entry, time);
    if (progress >= 1 && dayTextLayers.indexOf(entry) === 6 && !blowStageArmed) {
      blowStageArmed = true;
      ensureMicMonitoring();
    }
  });
  if (dayTextSevenOne && !dayTextSevenOne.started && dayTextSevenOne.readyAt && time >= dayTextSevenOne.readyAt) {
    revealDayTextEntry(dayTextSevenOne, dayTextSevenOne.readyAt);
  }
  if (dayTextSevenOne && dayTextSevenOne.started) {
    updateDayTextEntry(dayTextSevenOne, time);
  }
}

async function ensureMicMonitoring() {
  if (micReady || micRequesting) return;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
  micRequesting = true;
  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) return;
    if (!micContext) {
      micContext = new AudioContextCtor();
    }
    if (micContext.state === 'suspended') {
      try {
        await micContext.resume();
      } catch (error) {
        // ignore; the primed context may already be enough on some browsers
      }
    }
    micSource = micContext.createMediaStreamSource(micStream);
    micAnalyser = micContext.createAnalyser();
    micAnalyser.fftSize = 4096;
    micAnalyser.smoothingTimeConstant = 0.62;
    micData = new Uint8Array(micAnalyser.fftSize);
    micSource.connect(micAnalyser);
    micReady = true;
  } catch (error) {
    micReady = false;
  } finally {
    micRequesting = false;
  }
}

function primeMicContext() {
  if (micContextPrimed) return;
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextCtor) return;
  try {
    micContext = micContext || new AudioContextCtor();
    micContextPrimed = true;
    if (micContext.state === 'suspended') {
      micContext.resume().catch(() => {});
    }
  } catch (error) {
    micContextPrimed = false;
  }
}

function getMicLevel() {
  if (!micReady || !micAnalyser || !micData) return 0;
  micAnalyser.getByteTimeDomainData(micData);
  let sum = 0;
  let peak = 0;
  for (let i = 0; i < micData.length; i += 1) {
    const value = (micData[i] - 128) / 128;
    sum += value * value;
    peak = Math.max(peak, Math.abs(value));
  }
  return Math.max(Math.sqrt(sum / micData.length), peak * 0.72);
}

function getMicVolume() {
  return clamp01(getMicLevel() * BLOW_VOLUME_SCALE);
}

function updateVolumeDisplay() {
  if (!volumeValueLabel || !volumeMeterFill) return;
  const percent = Math.round(micVolumeLevel * 100);
  volumeValueLabel.textContent = `${percent}%`;
  volumeMeterFill.style.width = `${percent}%`;
  volumeMeterFill.style.opacity = volumeDisplayVisible ? '1' : '0.8';
  if (volumeRow) {
    volumeRow.hidden = !volumeDisplayVisible;
  }
  if (volumeToggleButton) {
    volumeToggleButton.setAttribute('aria-pressed', String(volumeDisplayVisible));
    volumeToggleButton.textContent = volumeDisplayVisible ? '隐藏音量' : '音量显示';
  }
}

function updateMicBlow(time) {
  if (extinguished || !blowStageArmed || !blowHoldActive) return;
  if (!micReady) {
    primeMicContext();
    ensureMicMonitoring();
    return;
  }
  const above = micVolumeLevel > BLOW_VOLUME_THRESHOLD;
  if (above) {
    if (!blowTextVisible) {
      revealBlowText(time);
    }
    if (!micAboveStart) micAboveStart = time;
    if (time - micAboveStart >= BLOW_EXTINGUISH_MS) {
      extinguishCandle();
    }
  } else {
    micAboveStart = 0;
  }
}

function updateFlame(time) {
  const elapsed = time - startTime;
  flameTarget = arrowPath ? pathHighestPoint(arrowPath) : { x: anchor.x, y: anchor.y };
  if (!flameTarget) flameTarget = { x: anchor.x, y: anchor.y };
  blow += (targetBlow - blow) * 0.08;
  const pulse = Math.sin(elapsed * 0.0052);
  const quick = Math.sin(elapsed * 0.011);
  const flutter = Math.sin(elapsed * 0.0075 + 1.7);
  const micPressure = blowHoldActive ? clamp01((micVolumeLevel - 0.04) / 0.82) : 0;
  const blowVisual = extinguished ? blow : clamp((blow * 0.12) + (micPressure * 0.48), 0, 0.58);
  const lean = (wind * 7.5) + (pulse * 1.5) + (quick * 0.42) - (blowVisual * 24);
  const shrink = extinguished ? 0 : 1 - (blowVisual * 0.56);
  const opacity = extinguished ? 0 : clamp(1 - (blowVisual * 0.5), 0.58, 1);

  setTransform(flame, anchor, {
    rotate: lean,
    sx: clamp(1 + (flutter * 0.022) - (blowVisual * 0.22), 0.64, 1.08),
    sy: clamp((1 + (pulse * 0.038) + (quick * 0.014)) * shrink, 0.58, 1.14),
    dx: (wind * 2.4) - (blowVisual * 5.4) + (flameTarget.x - anchor.x),
    dy: blowVisual * 2.8 + (flameTarget.y - anchor.y),
  });
  flame.style.opacity = opacity.toFixed(3);

  flamePaths.forEach((path, index) => {
    const localPhase = elapsed * (0.012 + index * 0.004) + index * 1.2;
    const local = Math.sin(localPhase);
    const pathBox = path.getBBox();
    const center = {
      x: pathBox.x + pathBox.width / 2,
      y: pathBox.y + pathBox.height * 0.9,
    };
    setTransform(path, center, {
      rotate: local * (index === 0 ? 2.1 : 1.35),
      sx: 1 + (local * 0.016),
      sy: 1 - (local * 0.021),
      dx: local * (index === 0 ? 0.78 : 0.48),
    });
    path.style.opacity = clamp(0.84 + (Math.sin(localPhase * 1.7) * 0.16) - (blowVisual * 0.32), 0.45, 1).toFixed(3);
  });
}

function updateCakeLayers(time) {
  const elapsed = time - startTime;
  const cakeSpeed = extinguished ? 2.25 : 1;
  if (cakeZero && cakeZero.__motion) {
    const motion = cakeZero.__motion;
    const slow = Math.sin(elapsed * 0.0023 * cakeSpeed + motion.phase);
    const slow2 = Math.sin(elapsed * 0.0037 * cakeSpeed + motion.phase2);
    setTransform(cakeZero, motion.center, {
      rotate: (slow * motion.rot) + (slow2 * 0.25),
      sx: 1 + (slow * motion.stretchX),
      sy: 1 - (slow2 * motion.stretchY),
      dx: slow * motion.wobbleX,
      dy: slow2 * motion.wobbleY,
    });
  }
  cakeLayers.forEach((layer, index) => {
    const slow = Math.sin(elapsed * (0.0026 + index * 0.00045) * cakeSpeed + layer.phase);
    const slow2 = Math.sin(elapsed * (0.0041 + index * 0.0006) * cakeSpeed + layer.phase2);
    const bounce = Math.sin(elapsed * (0.0057 + index * 0.00045) * cakeSpeed + layer.phase3);
    setTransform(layer.el, layer.center, {
      rotate: (slow * layer.rot) + (slow2 * 0.45),
      sx: 1 + (slow * layer.stretchX) + (bounce * 0.009),
      sy: 1 - (slow2 * layer.stretchY) + (bounce * 0.007),
      dx: slow * layer.wobbleX,
      dy: bounce * layer.wobbleY,
    });
  });
}

function updateRabbitLayer(time) {
  if (!rabbitLayer || !rabbitLayer.__motion) return;
  const elapsed = time - startTime;
  const motion = rabbitLayer.__motion;
  const sway = Math.sin(elapsed * 0.0022 + motion.phase);
  const sway2 = Math.sin(elapsed * 0.0031 + motion.phase2);
  setTransform(rabbitLayer, motion.center, {
    rotate: sway * motion.rot,
    sx: 1 + (sway * motion.stretchX),
    sy: 1 + (sway2 * motion.stretchY),
    dx: sway * motion.wobbleX,
    dy: sway2 * motion.wobbleY,
  });
}

function updateArrowLayer(time) {
  if (!arrowLayer || !arrowLayer.__motion) return;
  const elapsed = time - startTime;
  const motion = arrowLayer.__motion;
  const sway = Math.sin(elapsed * 0.0022 + motion.phase);
  const sway2 = Math.sin(elapsed * 0.0031 + motion.phase2);
  setTransform(arrowLayer, motion.center, {
    rotate: sway * motion.rot,
    sx: 1 + (sway * motion.stretchX),
    sy: 1 + (sway2 * motion.stretchY),
    dx: sway * motion.wobbleX,
    dy: sway2 * motion.wobbleY,
  });
}

function updateStarLayer(time) {
  const elapsed = time - startTime;
  const spinBoost = extinguished ? 3 : 1;
  starPaths.forEach((star, index) => {
    const spin = elapsed * star.spinSpeed * star.spinDir * spinBoost;
    const sway = Math.sin(elapsed * 0.0015 + star.phase);
    setTransform(star.el, star.center, {
      rotate: spin + (sway * (index === 0 ? 0.18 : 0.12)),
      sx: 1 + (sway * star.wobble * 0.008),
      sy: 1 - (sway * star.wobble * 0.006),
      dx: sway * 0.12,
      dy: sway * 0.1,
    });
  });
}

function spawnSmoke() {
  const smokeLayer = flame.parentNode;
  for (let i = 0; i < 7; i += 1) {
    const puff = makeSvgElement('circle', {
      class: 'smoke-puff',
      cx: anchor.x.toFixed(3),
      cy: (anchor.y - 18).toFixed(3),
      r: rand(3.2, 6.8).toFixed(3),
    });
    smokeLayer.appendChild(puff);
    smoke.push({
      el: puff,
      born: performance.now(),
      duration: rand(1350, 2300),
      startR: Number(puff.getAttribute('r')),
      dx: rand(-10, 10),
      dy: rand(-58, -36),
      sway: rand(-5, 5),
    });
  }
}

function updateSmoke(time) {
  smoke = smoke.filter((puff) => {
    const life = clamp((time - puff.born) / puff.duration, 0, 1);
    const eased = easeOutCubic(life);
    puff.el.setAttribute('cx', (anchor.x + puff.dx * eased + Math.sin(life * Math.PI * 2.2) * puff.sway).toFixed(3));
    puff.el.setAttribute('cy', (anchor.y - 18 + puff.dy * eased).toFixed(3));
    puff.el.setAttribute('r', (puff.startR * (1 + life * 1.25)).toFixed(3));
    puff.el.style.opacity = Math.pow(1 - life, 1.8).toFixed(3);
    puff.el.removeAttribute('transform');
    if (life >= 1) {
      puff.el.remove();
      return false;
    }
    return true;
  });
}

function getCakeBurstOrigin() {
  const candidates = ['蛋糕-0', '蛋糕-1', '蛋糕-2']
    .map((name) => svg.querySelector(`[data-name="${name}"]`))
    .filter(Boolean);
  if (!candidates.length) {
    return { x: anchor.x, y: anchor.y + 40, width: 120 };
  }
  const boxes = candidates.map((el) => el.getBBox());
  const left = Math.min(...boxes.map((box) => box.x));
  const right = Math.max(...boxes.map((box) => box.x + box.width));
  const top = Math.min(...boxes.map((box) => box.y));
  return {
    x: (left + right) / 2,
    y: top + 8,
    width: right - left,
  };
}

function spawnConfetti() {
  if (!svg) return;
  birthdayTextStarted = false;
  birthdayTextPending = true;
  birthdayTextTriggerAt = 0;
  resetBirthdayTextAnimation();
  if (!confettiLayer) {
    confettiLayer = makeSvgElement('g', { class: 'confetti-layer' });
    svg.appendChild(confettiLayer);
  }
  const origin = getCakeBurstOrigin();
  const colors = ['#ff5ab7', '#ffd75c', '#66d7ff', '#8cff9b', '#b78cff', '#ff8f48'];
  for (let i = 0; i < 52; i += 1) {
    const x = origin.x + rand(-origin.width * 0.42, origin.width * 0.42);
    const y = origin.y + rand(-18, 12);
    const w = rand(2.8, 7.6);
    const h = rand(6.2, 15.5);
    const particle = makeSvgElement(Math.random() < 0.76 ? 'rect' : 'ellipse', {
      class: 'confetti-particle',
      fill: colors[Math.floor(Math.random() * colors.length)],
    });
    if (particle.tagName.toLowerCase() === 'rect') {
      particle.setAttribute('x', (-w / 2).toFixed(3));
      particle.setAttribute('y', (-h / 2).toFixed(3));
      particle.setAttribute('width', w.toFixed(3));
      particle.setAttribute('height', h.toFixed(3));
      particle.setAttribute('rx', rand(0.2, 1.2).toFixed(3));
    } else {
      particle.setAttribute('cx', '0');
      particle.setAttribute('cy', '0');
      particle.setAttribute('rx', (w * 0.5).toFixed(3));
      particle.setAttribute('ry', (h * 0.34).toFixed(3));
    }
    confettiLayer.appendChild(particle);
    const angle = rand(-Math.PI * 0.88, -Math.PI * 0.12);
    const speed = rand(2.6, 7.2);
    const initialVy = Math.sin(angle) * speed - rand(1.3, 4.8);
    const gravity = rand(0.09, 0.16);
    const apexDelay = clamp((-initialVy / gravity) * (1000 / 60), 280, 980);
    const apexAt = performance.now() + apexDelay;
    if (!birthdayTextTriggerAt || apexAt < birthdayTextTriggerAt) {
      birthdayTextTriggerAt = apexAt + BIRTHDAY_TEXT_AFTER_CONFETTI_APEX_MS;
    }
    confetti.push({
      el: particle,
      born: performance.now(),
      duration: rand(1350, 2300),
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: initialVy,
      gravity,
      drag: rand(0.982, 0.992),
      rotate: rand(0, 360),
      spin: rand(-10, 10),
      flutter: rand(0.012, 0.027),
    });
  }
}

function updateConfetti(time) {
  if (birthdayTextPending && birthdayTextTriggerAt && time >= birthdayTextTriggerAt) {
    birthdayTextPending = false;
    startBirthdayTextAnimation();
  }
  confetti = confetti.filter((particle) => {
    const life = clamp((time - particle.born) / particle.duration, 0, 1);
    particle.vx *= particle.drag;
    particle.vy = (particle.vy * particle.drag) + particle.gravity;
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.rotate += particle.spin;
    const scaleY = 0.45 + (Math.abs(Math.sin((time - particle.born) * particle.flutter)) * 0.72);
    particle.el.style.opacity = (1 - easeOutCubic(life)).toFixed(3);
    particle.el.setAttribute(
      'transform',
      `translate(${particle.x.toFixed(3)} ${particle.y.toFixed(3)}) rotate(${particle.rotate.toFixed(3)}) scale(1 ${scaleY.toFixed(3)})`,
    );
    if (life >= 1) {
      particle.el.remove();
      return false;
    }
    return true;
  });
}

function updateNightTextTyping(time) {
  if (!nightTypingActive || !nightGlyphs.length) return;
  const glyphDelay = 144;
  let cursorBox = null;
  let completeCount = 0;

  nightGlyphs.forEach((glyph, index) => {
    const startAt = nightTypingStart + (index * glyphDelay);
    glyph.startAt = startAt;
    if (time < startAt) return;
    glyph.el.style.opacity = '1';
    glyph.el.removeAttribute('transform');
    cursorBox = glyph.box;
    completeCount += 1;
  });

  if (nightCursor && cursorBox) {
    const blink = Math.sin(time * 0.012) > -0.2 ? 1 : 0.16;
    nightCursor.setAttribute('x', (cursorBox.x + cursorBox.width + 3).toFixed(3));
    nightCursor.setAttribute('y', (cursorBox.y - 0.6).toFixed(3));
    nightCursor.setAttribute('height', (cursorBox.height + 1.2).toFixed(3));
    nightCursor.style.opacity = blink.toFixed(3);
  }

  if (completeCount >= nightGlyphs.length) {
    nightTypingActive = false;
    nightTypingDone = true;
    if (nightCursor) nightCursor.style.opacity = '0';
    startGeometryAnimation(time, cursorBox);
  }
}

function updateGeometryAnimation(time) {
  if (!geometryAnimationActive || geometryItems.length < 4) return;
  const segmentMs = 520;
  const holdMs = 35;
  const finalRotateMs = 315;
  const items = geometryItems;
  const starts = [
    geometryCursorPoint || { x: items[0].center.x - 18, y: items[0].center.y },
    items[0].center,
    items[1].center,
    items[2].center,
  ];

  items.forEach((item, index) => {
    const local = (time - geometryAnimationStart - (index * (segmentMs + holdMs))) / segmentMs;
    if (local < 0) {
      item.el.style.opacity = '0';
      item.el.style.display = 'none';
      return;
    }
    const progress = easeOutCubic(local);
    const p = clamp01(progress);
    const from = starts[index];
    const to = item.center;
    const x = from.x + ((to.x - from.x) * p);
    const y = from.y + ((to.y - from.y) * p);
    const dx = x - to.x;
    const dy = y - to.y;
    const scale = 0.72 + (0.28 * p);
    const rotate = 0;
    item.el.style.display = '';
    item.el.style.opacity = clamp01(local * 2).toFixed(3);
    setTransform(item.el, item.center, {
      dx,
      dy,
      rotate,
      sx: scale,
      sy: scale,
    });
    if (local >= 1) {
      item.el.style.opacity = '1';
      if (index !== 3 && item.baseTransform) {
        item.el.setAttribute('transform', item.baseTransform);
      } else if (index !== 3) {
        item.el.removeAttribute('transform');
      }
    }
  });

  const lastLocal = (time - geometryAnimationStart - (3 * (segmentMs + holdMs))) / segmentMs;
  if (lastLocal >= 1 && items[3]) {
    const rotateProgress = easeOutCubic((lastLocal - 1) * segmentMs / finalRotateMs);
    const finalRotate = -45 * clamp01(rotateProgress);
    const item = items[3];
    item.el.style.display = '';
    item.el.style.opacity = '1';
    setTransform(item.el, item.center, {
      rotate: finalRotate,
      sx: 1,
      sy: 1,
    });
  }

  if ((lastLocal - 1) * segmentMs >= finalRotateMs) {
    if (items[3]) {
      items[3].el.setAttribute('transform', items[3].baseTransform || 'translate(-386.86 616.51) rotate(-45)');
    }
    geometryAnimationActive = false;
  }
}

function animate(time) {
  micVolumeLevel = micReady ? getMicVolume() : 0;
  updateVolumeDisplay();
  updateDayTextLayers(time);
  updateNightTextTyping(time);
  updateGeometryAnimation(time);
  updateBirthdayTextAnimation(time);
  updateMicBlow(time);
  updateFlame(time);
  updateCakeLayers(time);
  updateRabbitLayer(time);
  updateArrowLayer(time);
  updateStarLayer(time);
  updateSmoke(time);
  updateConfetti(time);
  rafId = requestAnimationFrame(animate);
}

function extinguishCandle() {
  if (extinguished) return;
  extinguished = true;
  targetBlow = 1;
  clearTimeout(blowHoldTimer);
  blowHoldTimer = 0;
  blowHoldActive = false;
  window.clearTimeout(dayTextSevenOneTimer);
  dayTextSevenOneTimer = 0;
  window.clearTimeout(dayTextAutoTimer);
  dayTextAutoTimer = 0;
  hideDayTexts();
  if (dayTextLayers[7]) {
    dayTextLayers[7].el.style.display = 'none';
  }
  activeDayTextIndex = dayTextLayers.length - 1;
  blowTextVisible = false;
  micAboveStart = 0;
  setSceneMode('night');
  startAmbientStrawberryAudio();
  spawnSmoke();
  spawnConfetti();
  startNightTextTyping(performance.now());
}

function startBlow() {
  if (extinguished || !blowStageArmed || activeDayTextIndex < 6) return;
  clearTimeout(blowHoldTimer);
  blowHoldTimer = window.setTimeout(() => {
    if (extinguished || !blowStageArmed || activeDayTextIndex < 6) return;
    targetBlow = 1;
    blowHoldActive = true;
    micAboveStart = 0;
    ensureMicMonitoring();
  }, BLOW_HOLD_DELAY);
}

function stopBlow() {
  targetBlow = 0;
  blowHoldActive = false;
  clearTimeout(blowHoldTimer);
  blowHoldTimer = 0;
  hideBlowText();
}

function relight() {
  if (!extinguished) return;
  extinguished = false;
  setSceneMode('day');
  startAmbientBurnAudio();
  targetBlow = 0;
  confetti.forEach((particle) => particle.el.remove());
  confetti = [];
  birthdayTextPending = false;
  birthdayTextTriggerAt = 0;
  resetBirthdayTextAnimation();
}

function bindInteraction() {
  STAGE.addEventListener('pointermove', (event) => {
    const box = STAGE.getBoundingClientRect();
    wind = clamp(((event.clientX - box.left) / box.width - 0.5) * 2, -1, 1);
  });
  STAGE.addEventListener('pointerleave', () => {
    wind = 0;
    pressStartTime = 0;
    if (blowHoldActive || blowHoldTimer) {
      stopBlow();
    }
  });
  STAGE.addEventListener('pointerdown', () => {
    primeMicContext();
    ensureMicMonitoring();
    flushPendingAudio();
    if (extinguished) {
      relight();
      return;
    }
    if (blowStageArmed && activeDayTextIndex >= 6) {
      startBlow();
      return;
    }
    if (activeDayTextIndex < 6) {
      pressStartTime = performance.now();
    }
  });
  STAGE.addEventListener('pointerup', () => {
    if (blowHoldActive || blowHoldTimer) {
      stopBlow();
      return;
    }
    if (!extinguished && activeDayTextIndex >= 0 && activeDayTextIndex < 6) {
      const pressDuration = pressStartTime ? (performance.now() - pressStartTime) : 0;
      if (pressDuration < 350 && activeDayTextIndex < dayTextLayers.length - 1) {
        revealNextDayText(performance.now());
      }
    }
    pressStartTime = 0;
  });
  window.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
      primeMicContext();
      ensureMicMonitoring();
      flushPendingAudio();
      if (activeDayTextIndex < 6) {
        pressStartTime = performance.now();
      }
    }
  });
  window.addEventListener('keyup', (event) => {
    if (event.code === 'Space') {
      if (blowHoldActive || blowHoldTimer) {
        stopBlow();
        return;
      }
      if (!extinguished && activeDayTextIndex >= 0 && activeDayTextIndex < 6) {
        const pressDuration = pressStartTime ? (performance.now() - pressStartTime) : 0;
        if (pressDuration < 350 && activeDayTextIndex < dayTextLayers.length - 1) {
          revealNextDayText(performance.now());
        }
      }
      pressStartTime = 0;
    }
  });
}

async function init() {
  try {
    const response = await fetch(SVG_URL, { cache: 'no-store' });
    if (!response.ok) throw new Error(`SVG 加载失败：${response.status}`);
    const parser = new DOMParser();
    svg = parser.parseFromString(await response.text(), 'image/svg+xml').querySelector('svg');
    if (!svg) throw new Error('没有找到 SVG。');
    svg.removeAttribute('width');
    svg.removeAttribute('height');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.classList.add('cake-svg');
    HOST.replaceChildren(svg);
    setupFlameGroup();
    setupCakeLayers();
    setupCakeExtras();
    setupDayTextLayers();
    setupNightTextLayers();
    setupGeometryAnimation();
    setupBirthdayTextLayer();
    setSceneMode('day');
    activeDayTextIndex = -1;
    blowStageArmed = false;
    blowTextVisible = false;
    blowHoldActive = false;
    pressStartTime = 0;
    micAboveStart = 0;
    confetti = [];
    confettiLayer = null;
    birthdayTextPending = false;
    birthdayTextTriggerAt = 0;
    resetBirthdayTextAnimation();
    clearTimeout(blowHoldTimer);
    blowHoldTimer = 0;
  bindControlPanelVisibility();
  bindGlowPanel();
  bindBirthdayParticlePanel();
  bindVolumePanel();
  bindInteraction();
  startTime = performance.now();
  primeMicContext();
  ensureMicMonitoring();
    window.clearTimeout(dayTextAutoTimer);
    dayTextAutoTimer = window.setTimeout(() => {
      startFirstDayTextAfterBurnAudio();
    }, 1000);
    rafId = requestAnimationFrame(animate);
  } catch (error) {
    HOST.innerHTML = `<div class="loading">${error.message}</div>`;
  }
}

startAmbientBurnAudio();
init();
