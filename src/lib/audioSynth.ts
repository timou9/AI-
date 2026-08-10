// Interactive Web Audio Synthesizer for Chord & Melody Playback

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Frequency map for musical notes
const NOTE_FREQUENCIES: Record<string, number> = {
  'C3': 130.81, 'C#3': 138.59, 'Db3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'Eb3': 155.56,
  'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'Gb3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'Ab3': 207.65,
  'A3': 220.00, 'A#3': 233.08, 'Bb3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'C#4': 277.18, 'Db4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'Eb4': 311.13,
  'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'Gb4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'Ab4': 415.30,
  'A4': 440.00, 'A#4': 466.16, 'Bb4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'C#5': 554.37, 'Db5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'Eb5': 622.25,
  'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'Gb5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'Ab5': 830.61,
  'A5': 880.00, 'A#5': 932.33, 'Bb5': 932.33, 'B5': 987.77,
};

// Map chord names to pitch arrays
const CHORD_MAP: Record<string, string[]> = {
  'C': ['C4', 'E4', 'G4'],
  'Cadd9': ['C4', 'E4', 'G4', 'D5'],
  'Cmaj7': ['C4', 'E4', 'G4', 'B4'],
  'Cm': ['C4', 'Eb4', 'G4'],
  'Dm': ['D4', 'F4', 'A4'],
  'Dm7': ['D4', 'F4', 'A4', 'C5'],
  'D': ['D4', 'F#4', 'A4'],
  'D7': ['D4', 'F#4', 'A4', 'C5'],
  'D/F#': ['F#3', 'D4', 'F#4', 'A4'],
  'D/C': ['C4', 'D4', 'F#4', 'A4'],
  'Em': ['E4', 'G4', 'B4'],
  'Em7': ['E4', 'G4', 'B4', 'D5'],
  'E': ['E4', 'G#4', 'B4'],
  'F': ['F4', 'A4', 'C5'],
  'Fmaj7': ['F4', 'A4', 'C5', 'E5'],
  'Fm': ['F4', 'Ab4', 'C5'],
  'G': ['G3', 'B3', 'D4', 'G4'],
  'G7': ['G3', 'B3', 'D4', 'F4'],
  'G/B': ['B3', 'D4', 'G4'],
  'G/D': ['D4', 'G4', 'B4'],
  'Am': ['A3', 'C4', 'E4'],
  'Am7': ['A3', 'C4', 'E4', 'G4'],
  'A': ['A3', 'C#4', 'E4'],
  'A7': ['A3', 'C#4', 'E4', 'G4'],
  'Bm': ['B3', 'D4', 'F#4'],
  'Bm7': ['B3', 'D4', 'F#4', 'A4'],
  'Bb': ['Bb3', 'D4', 'F4'],
  'Bbmaj7': ['Bb3', 'D4', 'F4', 'A4'],
  'B7': ['B3', 'D#4', 'F#4', 'A4'],
  'F#m': ['F#3', 'A3', 'C#4'],
  'F#m7': ['F#3', 'A3', 'C#4', 'E4'],
};

// Play a single synthesized piano/synth note
export function playNote(pitch: string, durationSeconds: number = 0.6) {
  try {
    const ctx = getAudioContext();
    const freq = NOTE_FREQUENCIES[pitch] || 440;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // Warm piano-like sine + triangle wave mix
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, ctx.currentTime);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, ctx.currentTime); // Harmonic overtone

    const now = ctx.currentTime;
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.03); // Fast attack
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + durationSeconds); // Exponential decay

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + durationSeconds);
    osc2.stop(now + durationSeconds);
  } catch (e) {
    console.error('Audio playNote error:', e);
  }
}

// Play a chord by name or notes array
export function playChord(chordName: string, durationSeconds: number = 1.2) {
  try {
    const cleanName = chordName.trim();
    const notes = CHORD_MAP[cleanName] || CHORD_MAP['C'] || ['C4', 'E4', 'G4'];

    notes.forEach((note, index) => {
      // Arpeggiate slightly for natural strum sound
      setTimeout(() => {
        playNote(note, durationSeconds);
      }, index * 35);
    });
  } catch (e) {
    console.error('Audio playChord error:', e);
  }
}

let activeProgressionTimer: any = null;

// Play a sequence of chords in a loop or once
export function playChordProgression(
  chords: string[],
  bpm: number = 84,
  onChordChange?: (index: number) => void,
  onEnd?: () => void
): () => void {
  stopChordProgression();

  let currentIndex = 0;
  const chordDuration = (60 / bpm) * 2; // 2 beats per chord

  const playNext = () => {
    if (currentIndex >= chords.length) {
      if (onEnd) onEnd();
      return;
    }

    const currentChord = chords[currentIndex];
    if (onChordChange) onChordChange(currentIndex);
    playChord(currentChord, chordDuration * 0.95);

    currentIndex++;
    activeProgressionTimer = setTimeout(playNext, chordDuration * 1000);
  };

  playNext();

  return stopChordProgression;
}

export function stopChordProgression() {
  if (activeProgressionTimer) {
    clearTimeout(activeProgressionTimer);
    activeProgressionTimer = null;
  }
}

// Play melody hook notes
export function playMelodyHook(
  notes: { pitch: string; duration?: string; lyricWord?: string; timeOffset?: number }[],
  bpm: number = 84,
  onNotePlay?: (index: number) => void,
  onComplete?: () => void
) {
  stopChordProgression();
  const ctx = getAudioContext();
  const beatTime = 60 / bpm;

  notes.forEach((item, idx) => {
    const delayMs = (item.timeOffset || idx * 0.5) * beatTime * 1000;
    setTimeout(() => {
      if (onNotePlay) onNotePlay(idx);
      playNote(item.pitch || 'C4', 0.5);
    }, delayMs);
  });

  const totalTimeMs = (notes.length * 0.5 + 1) * beatTime * 1000;
  setTimeout(() => {
    if (onComplete) onComplete();
  }, totalTimeMs);
}
