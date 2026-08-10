export interface SongStructureSection {
  section: string; // e.g. "Intro", "Verse 1", "Pre-Chorus", "Chorus", "Bridge", "Outro"
  bars: number;
  function: string;
  energyLevel: number; // 1-10
}

export interface ChordProgressionItem {
  name: string; // e.g. "主歌基础和弦", "副歌黄金和弦 (卡农进阶/4536251)"
  chords: string[]; // e.g. ["G", "D/F#", "Em", "Bm/D", "C", "G/B", "Am7", "D7"]
  romanNumerals: string; // e.g. "I - V/7 - vi - III/5 - IV - I/3 - ii7 - V7"
  emotionalEffect: string; // e.g. "层层递进的温暖怀旧感与淡淡忧伤"
}

export interface AnnotatedLyricLine {
  id: string;
  section?: string; // e.g. "Verse 1", "Chorus", "Bridge", "Outro"
  lyricText: string;
  emotionTag: string; // e.g. "伤感", "怀旧", "励志", "愤怒", "甜蜜", "迷茫", "释怀", "期待"
  emotionCategory?: 'sadness' | 'inspirational' | 'anger' | 'nostalgia' | 'sweet' | 'confused' | 'relieved' | 'expectation' | 'custom';
  explanation?: string; // e.g. "以细节勾勒青春遗憾"
}

export interface LyricCraftInfo {
  rhymeScheme: string; // e.g. "AABB / 韵脚主要集中在 [-an] 韵"
  coreMetaphors: string[]; // e.g. ["刮风的下午", "花落的声音", "消失的秋天"]
  themeSummary: string; // e.g. "青春遗憾与未能说出口的告白"
  sentenceStructure: string; // e.g. "长短句交替，前半句叙事，后半句抒发感官记忆"
  annotatedLyrics?: AnnotatedLyricLine[]; // 歌词情绪重心与段落自动标注
}

export interface SongAnalysisResult {
  songTitle: string;
  artist: string;
  genre: string;
  tempoBpm: number;
  musicalKey: string;
  vibeMood: string[];
  structure: SongStructureSection[];
  chordProgressions: ChordProgressionItem[];
  melodicCharacteristics: string[];
  lyricCrafting: LyricCraftInfo;
  arrangementInstruments: string[];
  goldenRulesForImitation: string[]; // 核心仿写法则 (3-5条)
  suggestedNewThemes: string[]; // 仿写灵感主题 (3个)
}

export interface SongSectionLine {
  lineText: string;
  chords: string; // e.g. "C     G/B     Am" above or inline
  rhymeTag?: string;
  expressionTip?: string;
}

export interface ImitationSongSection {
  sectionName: string; // "Verse 1", "Chorus", etc.
  energy: number;
  chordsUsed: string[];
  lines: SongSectionLine[];
  performanceNote: string;
}

export interface MelodyNotePreview {
  pitch: string; // e.g., "C4", "E4", "G4", "A4"
  duration: string; // "8n", "4n", "2n"
  lyricWord: string;
  timeOffset: number; // relative beat/time offset
}

export interface ImitationSongBlueprint {
  title: string;
  subtitle: string;
  imitationLevel?: string;
  genreAndMood: string;
  tempoAndKey: string;
  originalInspiration: string;
  structuralBlueprint: ImitationSongSection[];
  chordProgressionGuide: {
    sectionName: string;
    chords: string[];
    romanNumerals: string;
    noteFrequencies?: number[];
  }[];
  melodyHookNotes: MelodyNotePreview[];
  arrangementGuide: {
    introStyle: string;
    verseBuild: string;
    chorusExplosion: string;
    outroFade: string;
  };
  aiMusicPrompt: {
    sunoPrompt: string;
    udioPrompt: string;
    dawNotes: string;
    sunoParameters?: SunoTuningParameters;
  };
}

export interface SunoTuningParameters {
  styleTags: string; // e.g. "mandopop, acoustic guitar, soft piano, warm male vocal, 84 bpm, emotional"
  vocalSettings: string; // e.g. "Warm intimate male vocal, gentle breathiness"
  instrumentation: string; // e.g. "Acoustic guitar fingerpicking, grand piano, cello"
  tempoBpm: number;
  timeSignature: string; // e.g. "4/4"
  musicalKey: string;
  genreMain: string;
  moodAtmosphere: string;
  styleGuidanceWeight: number; // 0-100% e.g. 85
  creativityRandomness: number; // 0-100% e.g. 25
  negativePrompt: string; // Excluded tags e.g. "no auto-tune, no heavy rock, no EDM drop, no shouting"
  structuralMetatags?: {
    sectionTag: string; // e.g. "[Verse 1 - Soft Acoustic]"
    promptInstruction: string; // e.g. "低沉拉近感独唱"
  }[];
  antiDriftTips: string[]; // Anti-drift recommendations tailored to lyrics
}

export interface PresetSong {
  id: string;
  title: string;
  artist: string;
  genre: string;
  key: string;
  bpm: number;
  tags: string[];
  coverGradient: string;
  analysis: SongAnalysisResult;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  isVip: boolean;
  vipTier: 'FREE' | 'PRO_MEMBER' | 'STUDIO_VIP';
  remainingCredits: number;
  vipExpireDate?: string;
}
