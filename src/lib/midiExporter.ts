import { ImitationSongBlueprint } from '../types';

/**
 * Utility to convert note pitch strings (e.g. "C4", "F#3", "Eb5") to MIDI note numbers (0-127).
 */
const NOTE_NAME_TO_OFFSET: Record<string, number> = {
  'C': 0, 'C#': 1, 'DB': 1,
  'D': 2, 'D#': 3, 'EB': 3,
  'E': 4,
  'F': 5, 'F#': 6, 'GB': 6,
  'G': 7, 'G#': 8, 'AB': 8,
  'A': 9, 'A#': 10, 'BB': 10,
  'B': 11
};

export function pitchToMidiNumber(pitchStr: string, defaultOctave = 4): number {
  if (!pitchStr) return 60; // Middle C
  const clean = pitchStr.trim();
  const match = clean.match(/^([A-Ga-g][#b]?)(-?\d+)?$/);
  if (!match) return 60;

  const noteName = match[1].toUpperCase();
  const oct = match[2] !== undefined ? parseInt(match[2], 10) : defaultOctave;
  const offset = NOTE_NAME_TO_OFFSET[noteName] ?? 0;

  return Math.max(0, Math.min(127, (oct + 1) * 12 + offset));
}

/**
 * Predefined common chord voicoings for clear MIDI track playback
 */
const PREDEFINED_CHORD_MIDI: Record<string, number[]> = {
  'C': [60, 64, 67],        // C4, E4, G4
  'Cadd9': [60, 64, 67, 74], // C4, E4, G4, D5
  'Cmaj7': [60, 64, 67, 71], // C4, E4, G4, B4
  'Cm': [60, 63, 67],       // C4, Eb4, G4
  'Dm': [62, 65, 69],       // D4, F4, A4
  'Dm7': [62, 65, 69, 72],  // D4, F4, A4, C5
  'D': [62, 66, 69],        // D4, F#4, A4
  'D7': [62, 66, 69, 72],   // D4, F#4, A4, C5
  'D/F#': [54, 62, 66, 69], // F#3, D4, F#4, A4
  'D/C': [60, 62, 66, 69],  // C4, D4, F#4, A4
  'Em': [64, 67, 71],       // E4, G4, B4
  'Em7': [64, 67, 71, 74],  // E4, G4, B4, D5
  'E': [64, 68, 71],        // E4, G#4, B4
  'F': [65, 69, 72],        // F4, A4, C5
  'Fmaj7': [65, 69, 72, 76], // F4, A4, C5, E5
  'Fm': [65, 68, 72],       // F4, Ab4, C5
  'G': [55, 59, 62, 67],    // G3, B3, D4, G4
  'G7': [55, 59, 62, 65],   // G3, B3, D4, F4
  'G/B': [59, 62, 67],      // B3, D4, G4
  'G/D': [62, 67, 71],      // D4, G4, B4
  'Am': [57, 60, 64],       // A3, C4, E4
  'Am7': [57, 60, 64, 67],  // A3, C4, E4, G4
  'A': [57, 61, 64],        // A3, C#4, E4
  'A7': [57, 61, 64, 67],   // A3, C#4, E4, G4
  'Bm': [59, 62, 66],       // B3, D4, F#4
  'Bm7': [59, 62, 66, 69],  // B3, D4, F#4, A4
  'Bb': [58, 62, 65],       // Bb3, D4, F4
  'Bbmaj7': [58, 62, 65, 69],// Bb3, D4, F4, A4
  'B7': [59, 63, 66, 69],   // B3, D#4, F#4, A4
  'F#m': [54, 57, 61],      // F#3, A3, C#4
  'F#m7': [54, 57, 61, 64], // F#3, A3, C#4, E4
};

/**
 * Dynamically converts any chord string (e.g. "G", "Am", "F#m7", "C/E") into array of MIDI note numbers
 */
export function chordToMidiNotes(chordStr: string): number[] {
  if (!chordStr) return [60, 64, 67];
  const clean = chordStr.trim();

  if (PREDEFINED_CHORD_MIDI[clean]) {
    return PREDEFINED_CHORD_MIDI[clean];
  }

  let rootPart = clean;
  let bassPart = '';
  if (clean.includes('/')) {
    const parts = clean.split('/');
    rootPart = parts[0];
    bassPart = parts[1];
  }

  const match = rootPart.match(/^([A-Ga-g][#b]?)(.*)$/);
  if (!match) return [60, 64, 67];

  const rootName = match[1].toUpperCase();
  const suffix = match[2].toLowerCase();

  const rootOffset = NOTE_NAME_TO_OFFSET[rootName] ?? 0;
  // Choose middle C (60) or octave 3 (48) so chord stays in 50-75 pitch range
  const rootMidi = rootOffset < 5 ? 60 + rootOffset : 48 + rootOffset;

  let intervals = [0, 4, 7]; // Default major

  if (suffix === 'm' || suffix === 'min') {
    intervals = [0, 3, 7];
  } else if (suffix === 'm7' || suffix === 'min7') {
    intervals = [0, 3, 7, 10];
  } else if (suffix === '7') {
    intervals = [0, 4, 7, 10];
  } else if (suffix === 'maj7' || suffix === 'm7+') {
    intervals = [0, 4, 7, 11];
  } else if (suffix === 'add9') {
    intervals = [0, 4, 7, 14];
  } else if (suffix === 'sus4') {
    intervals = [0, 5, 7];
  } else if (suffix === 'sus2') {
    intervals = [0, 2, 7];
  } else if (suffix === 'dim') {
    intervals = [0, 3, 6];
  } else if (suffix === 'aug') {
    intervals = [0, 4, 8];
  }

  const notes = intervals.map((inv) => rootMidi + inv);

  if (bassPart) {
    const bassName = bassPart.toUpperCase();
    if (NOTE_NAME_TO_OFFSET[bassName] !== undefined) {
      const bassMidi = 48 + NOTE_NAME_TO_OFFSET[bassName];
      if (!notes.includes(bassMidi)) {
        notes.unshift(bassMidi);
      }
    }
  }

  return notes;
}

/**
 * Variable-Length Quantity (VLQ) encoder for MIDI delta-times
 */
function encodeVLQ(num: number): number[] {
  let val = Math.max(0, Math.round(num));
  const buffer: number[] = [];

  let b = val & 0x7F;
  buffer.push(b);
  val >>= 7;

  while (val > 0) {
    b = (val & 0x7f) | 0x80;
    buffer.unshift(b);
    val >>= 7;
  }

  return buffer;
}

interface TimedMidiEvent {
  tick: number;
  type: 'noteOn' | 'noteOff' | 'meta' | 'programChange';
  status?: number;
  data: number[];
  metaType?: number;
  text?: string;
}

/**
 * Builder for a single MIDI Track Chunk
 */
class TrackBuilder {
  private events: TimedMidiEvent[] = [];

  addProgramChange(tick: number, channel: number, program: number) {
    this.events.push({
      tick,
      type: 'programChange',
      status: 0xC0 | (channel & 0x0F),
      data: [program & 0x7F],
    });
  }

  addTextMeta(tick: number, metaType: number, text: string) {
    this.events.push({
      tick,
      type: 'meta',
      metaType,
      text,
      data: [],
    });
  }

  addMeta(tick: number, metaType: number, data: number[]) {
    this.events.push({
      tick,
      type: 'meta',
      metaType,
      data,
    });
  }

  addNote(tick: number, durationTicks: number, channel: number, pitch: number, velocity = 90) {
    const chan = channel & 0x0F;
    const p = Math.max(0, Math.min(127, Math.round(pitch)));
    this.events.push({
      tick,
      type: 'noteOn',
      status: 0x90 | chan,
      data: [p, Math.max(1, Math.min(127, velocity))],
    });
    this.events.push({
      tick: tick + durationTicks,
      type: 'noteOff',
      status: 0x80 | chan,
      data: [p, 0],
    });
  }

  addChord(tick: number, durationTicks: number, channel: number, pitches: number[], velocity = 85) {
    pitches.forEach((p) => {
      this.addNote(tick, durationTicks, channel, p, velocity);
    });
  }

  buildChunk(): number[] {
    // Sort events by tick time
    this.events.sort((a, b) => {
      if (a.tick !== b.tick) return a.tick - b.tick;
      if (a.type === 'meta') return -1;
      if (b.type === 'meta') return 1;
      if (a.type === 'programChange') return -1;
      if (b.type === 'programChange') return 1;
      if (a.type === 'noteOff' && b.type === 'noteOn') return -1;
      if (a.type === 'noteOn' && b.type === 'noteOff') return 1;
      return 0;
    });

    const trackData: number[] = [];
    let currentTick = 0;

    for (const ev of this.events) {
      const delta = Math.max(0, ev.tick - currentTick);
      currentTick = ev.tick;

      // Write Delta time
      trackData.push(...encodeVLQ(delta));

      if (ev.type === 'meta') {
        if (ev.text !== undefined) {
          const textBytes = Array.from(new TextEncoder().encode(ev.text));
          trackData.push(0xFF, ev.metaType!, ...encodeVLQ(textBytes.length), ...textBytes);
        } else {
          trackData.push(0xFF, ev.metaType!, ...encodeVLQ(ev.data.length), ...ev.data);
        }
      } else if (ev.status !== undefined) {
        trackData.push(ev.status, ...ev.data);
      }
    }

    // End of track event: Delta 0, FF 2F 00
    trackData.push(...encodeVLQ(0), 0xFF, 0x2F, 0x00);

    const len = trackData.length;
    const lenBytes = [
      (len >> 24) & 0xFF,
      (len >> 16) & 0xFF,
      (len >> 8) & 0xFF,
      len & 0xFF,
    ];

    return [0x4D, 0x54, 0x72, 0x6B, ...lenBytes, ...trackData];
  }
}

/**
 * Generate a complete multi-track Standard MIDI File (Type 1) from an ImitationSongBlueprint
 */
export function generateMidiFromBlueprint(blueprint: ImitationSongBlueprint, bpmOverride?: number): number[] {
  // 1. Parse BPM
  let bpm = bpmOverride || 84;
  if (!bpmOverride && blueprint.tempoAndKey) {
    const match = blueprint.tempoAndKey.match(/(\d+)\s*bpm/i);
    if (match) {
      bpm = parseInt(match[1], 10);
    }
  }

  // Ticks per quarter note (TPQN) = 480
  const TPQN = 480;
  const barTicks = TPQN * 4; // 1920 ticks per 4/4 bar

  // Calculate microseconds per quarter note for MIDI Set Tempo Event
  const usPerQuarter = Math.round(60000000 / bpm);
  const tempoBytes = [
    (usPerQuarter >> 16) & 0xFF,
    (usPerQuarter >> 8) & 0xFF,
    usPerQuarter & 0xFF,
  ];

  // --- Track 1: Conductor Track (Tempo, Key, Time Signature, Song Markers) ---
  const conductorTrack = new TrackBuilder();
  conductorTrack.addTextMeta(0, 0x03, `Conductor - ${blueprint.title || 'Untitled'}`);
  conductorTrack.addMeta(0, 0x51, tempoBytes);
  conductorTrack.addMeta(0, 0x58, [0x04, 0x02, 0x18, 0x08]); // 4/4 Time Sig

  // Layout section markers along time
  let currentMarkerTick = 0;
  if (blueprint.structuralBlueprint && blueprint.structuralBlueprint.length > 0) {
    blueprint.structuralBlueprint.forEach((sec) => {
      conductorTrack.addTextMeta(currentMarkerTick, 0x06, sec.sectionName || 'Section');
      const linesCount = sec.lines?.length || 2;
      const secDurationBars = Math.max(2, linesCount * 2);
      currentMarkerTick += secDurationBars * barTicks;
    });
  }

  // --- Track 2: 副歌 Hook 旋律音轨 (Melody Hook Track) ---
  const melodyTrack = new TrackBuilder();
  melodyTrack.addTextMeta(0, 0x03, 'Melody Hook (副歌主旋律)');
  melodyTrack.addProgramChange(0, 0, 0); // Acoustic Grand Piano (0)

  if (blueprint.melodyHookNotes && blueprint.melodyHookNotes.length > 0) {
    blueprint.melodyHookNotes.forEach((note) => {
      const startTick = Math.round((note.timeOffset || 0) * TPQN);

      // Duration parsing
      let durTicks = TPQN / 2; // 8n default
      if (note.duration === '1n') durTicks = TPQN * 4;
      else if (note.duration === '2n') durTicks = TPQN * 2;
      else if (note.duration === '4n') durTicks = TPQN;
      else if (note.duration === '8n') durTicks = TPQN / 2;
      else if (note.duration === '16n') durTicks = TPQN / 4;
      else if (note.duration === '8n.') durTicks = (TPQN / 2) * 1.5;

      const pitchMidi = pitchToMidiNumber(note.pitch, 4);
      melodyTrack.addNote(startTick, durTicks, 0, pitchMidi, 96);
    });
  }

  // --- Track 3: 核心和弦走向音轨 (Chord Progression Guide Track) ---
  const chordGuideTrack = new TrackBuilder();
  chordGuideTrack.addTextMeta(0, 0x03, 'Chord Progression Guide (和弦走向)');
  chordGuideTrack.addProgramChange(0, 1, 4); // Electric Piano (4)

  let chordGuideTick = 0;
  if (blueprint.chordProgressionGuide && blueprint.chordProgressionGuide.length > 0) {
    blueprint.chordProgressionGuide.forEach((group) => {
      chordGuideTrack.addTextMeta(chordGuideTick, 0x01, `[${group.sectionName}] ${group.romanNumerals || ''}`);
      if (group.chords && group.chords.length > 0) {
        group.chords.forEach((chordName) => {
          const notes = chordToMidiNotes(chordName);
          chordGuideTrack.addChord(chordGuideTick, TPQN * 2, 1, notes, 85); // 2 beats per chord
          chordGuideTick += TPQN * 2;
        });
      }
    });
  }

  // --- Track 4: 完整歌曲总谱和弦音轨 (Full Song Structural Chords Track) ---
  const fullSongTrack = new TrackBuilder();
  fullSongTrack.addTextMeta(0, 0x03, 'Full Song Chords (全曲编曲和弦)');
  fullSongTrack.addProgramChange(0, 2, 24); // Nylon Guitar (24)

  let fullSongTick = 0;
  if (blueprint.structuralBlueprint && blueprint.structuralBlueprint.length > 0) {
    blueprint.structuralBlueprint.forEach((sec) => {
      fullSongTrack.addTextMeta(fullSongTick, 0x01, `[Section: ${sec.sectionName}]`);

      if (sec.lines && sec.lines.length > 0) {
        sec.lines.forEach((line) => {
          // Extract chords from line.chords string e.g. "C     G/B     Am     F"
          const chordMatches = line.chords ? line.chords.match(/[A-Ga-g][#b]?[^\s]*/g) : null;
          const lineChords = chordMatches && chordMatches.length > 0 ? chordMatches : (sec.chordsUsed || ['C']);

          lineChords.forEach((chordName) => {
            const notes = chordToMidiNotes(chordName);
            fullSongTrack.addChord(fullSongTick, TPQN * 2, 2, notes, 80); // 2 beats per chord
            fullSongTick += TPQN * 2;
          });
        });
      } else if (sec.chordsUsed && sec.chordsUsed.length > 0) {
        sec.chordsUsed.forEach((chordName) => {
          const notes = chordToMidiNotes(chordName);
          fullSongTrack.addChord(fullSongTick, TPQN * 2, 2, notes, 80);
          fullSongTick += TPQN * 2;
        });
      }
    });
  }

  // Build Track Chunks
  const track1Bytes = conductorTrack.buildChunk();
  const track2Bytes = melodyTrack.buildChunk();
  const track3Bytes = chordGuideTrack.buildChunk();
  const track4Bytes = fullSongTrack.buildChunk();

  const numTracks = 4;

  // MIDI Header Chunk: 'MThd', 6 bytes length, Format 1, 4 tracks, 480 TPQN
  const headerBytes = [
    0x4D, 0x54, 0x68, 0x64, // 'MThd'
    0x00, 0x00, 0x00, 0x06, // Length = 6
    0x00, 0x01,             // Format 1 (multi-track)
    0x00, numTracks,        // 4 tracks
    (TPQN >> 8) & 0xFF, TPQN & 0xFF, // 480 TPQN (0x01, 0xE0)
  ];

  return [
    ...headerBytes,
    ...track1Bytes,
    ...track2Bytes,
    ...track3Bytes,
    ...track4Bytes,
  ];
}

/**
 * Triggers browser download of standard MIDI file (.mid)
 */
export function downloadMidiFile(blueprint: ImitationSongBlueprint, bpmOverride?: number) {
  try {
    const midiBytes = generateMidiFromBlueprint(blueprint, bpmOverride);
    const blob = new Blob([new Uint8Array(midiBytes)], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    const safeTitle = (blueprint.title || 'ImitationSong')
      .replace(/[\\/:*?"<>|]/g, '_')
      .trim();

    link.download = `《${safeTitle}》_DAW_Arrangement.mid`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to export MIDI file:', err);
    alert('导出 MIDI 文件出现异常，请稍后重试');
  }
}
