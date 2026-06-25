const STORAGE_KEY = 'qr-ordering-sound-enabled';

let audioContext = null;
let unlocked = false;

/** Giai điệu báo đơn: 3 nốt chuông quán (E5 → G5 → B5) */
const ORDER_MELODY = [
  { freq: 659.25, at: 0, duration: 0.32, peak: 0.36 },
  { freq: 783.99, at: 0.15, duration: 0.34, peak: 0.38 },
  { freq: 987.77, at: 0.34, duration: 0.55, peak: 0.42 },
];

/** Âm ngắn khi bật / thử loa */
const TEST_MELODY = [
  { freq: 783.99, at: 0, duration: 0.28, peak: 0.34 },
  { freq: 987.77, at: 0.13, duration: 0.38, peak: 0.36 },
];

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
};

const playChimeNote = (ctx, { freq, at, duration, peak }, baseTime) => {
  const startAt = baseTime + at;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, startAt);
  master.gain.exponentialRampToValueAtTime(peak, startAt + 0.01);
  master.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  master.connect(ctx.destination);

  const body = ctx.createOscillator();
  body.type = 'triangle';
  body.frequency.setValueAtTime(freq, startAt);
  body.frequency.exponentialRampToValueAtTime(freq * 0.978, startAt + duration);

  const shimmer = ctx.createOscillator();
  shimmer.type = 'sine';
  shimmer.frequency.setValueAtTime(freq * 2.02, startAt);

  const shimmerGain = ctx.createGain();
  shimmerGain.gain.value = 0.1;

  body.connect(master);
  shimmer.connect(shimmerGain);
  shimmerGain.connect(master);

  body.start(startAt);
  shimmer.start(startAt);
  body.stop(startAt + duration + 0.06);
  shimmer.stop(startAt + duration + 0.06);
};

const playMelody = (ctx, melody) => {
  const baseTime = ctx.currentTime;
  melody.forEach((note) => playChimeNote(ctx, note, baseTime));
};

const ensureRunning = async (ctx) => {
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
  return ctx.state === 'running';
};

export const isSoundEnabled = () => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY) === 'true';
};

export const isSoundUnlocked = () => unlocked && isSoundEnabled();

export const setSoundEnabled = (enabled) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
  if (!enabled) {
    unlocked = false;
  }
};

export const unlockNotificationSound = async () => {
  try {
    const ctx = getAudioContext();
    const running = await ensureRunning(ctx);

    if (!running) {
      unlocked = false;
      return false;
    }

    playMelody(ctx, TEST_MELODY);
    unlocked = true;
    setSoundEnabled(true);
    return true;
  } catch {
    unlocked = false;
    return false;
  }
};

export const playNotificationSound = async () => {
  if (!isSoundEnabled()) {
    return false;
  }

  try {
    const ctx = getAudioContext();
    const running = await ensureRunning(ctx);

    if (!running) {
      unlocked = false;
      return false;
    }

    playMelody(ctx, ORDER_MELODY);
    unlocked = true;
    return true;
  } catch {
    return false;
  }
};
