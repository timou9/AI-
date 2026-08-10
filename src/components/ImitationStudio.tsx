import React, { useState, useMemo, useEffect } from 'react';
import { SongAnalysisResult, ImitationSongBlueprint } from '../types';
import { playChord, playChordProgression, stopChordProgression, playMelodyHook } from '../lib/audioSynth';
import { downloadMidiFile } from '../lib/midiExporter';
import {
  Wand2,
  Sparkles,
  Music,
  Play,
  Square,
  Copy,
  Check,
  Download,
  RefreshCw,
  Loader2,
  Volume2,
  FileText,
  Sliders,
  Guitar,
  Radio,
  Edit3,
  Layers,
  ChevronDown,
  ChevronUp,
  Dices,
  Shuffle,
  ShieldCheck,
  Settings2,
  Flame,
  Zap,
  Target,
  Mic,
  HelpCircle,
  Info,
  ListChecks,
  SlidersHorizontal,
} from 'lucide-react';

const SUNO_STYLE_PRESETS = [
  {
    id: 'acoustic_folk',
    name: '🎸 深情民谣/木吉他',
    style: 'mandopop, acoustic folk, fingerstyle acoustic guitar, warm male vocal, 84 bpm, intimate, storytelling, organic',
    vocal: 'Warm intimate male vocal with soft breathiness',
    inst: 'Fingerstyle acoustic guitar, solo cello, soft upright piano',
    negative: 'no auto-tune, no heavy drums, no EDM, no synth bass',
  },
  {
    id: 'pop_ballad',
    name: '🎹 抒情流行/大钢琴',
    style: 'mandopop ballad, grand piano, orchestral strings, emotional female vocal, 78 bpm, bittersweet, dramatic chorus',
    vocal: 'Ethereal emotional female vocal with powerful belt in chorus',
    inst: 'Steinway grand piano, full string section, subtle ambient pad',
    negative: 'no metal, no screaming, no trap beat, no autotune',
  },
  {
    id: 'guofeng_oriental',
    name: '🎻 古风国风/琴瑟弦乐',
    style: 'guofeng mandopop, guzheng, dizi flute, erhu, cinematic orchestra, 88 bpm, poetic, elegant, dramatic',
    vocal: 'Clear expressive vocal with traditional oriental falsetto ornamentation',
    inst: 'Guzheng, Dizi bamboo flute, Erhu, cinematic percussion',
    negative: 'no heavy distortion, no rap, no techno, no auto-tune',
  },
  {
    id: 'jazz_rb',
    name: '🎷 城市爵士/微醺R&B',
    style: 'urban R&B, lo-fi jazz pop, fender rhodes, electric guitar, relaxed groove, 86 bpm, melancholic, smooth',
    vocal: 'Smooth soulful R&B vocal, gentle runs and ad-libs',
    inst: 'Fender Rhodes electric piano, muted trumpet, warm bass, lo-fi drum kit',
    negative: 'no aggressive shouting, no heavy metal, no dubstep',
  },
  {
    id: 'pop_rock',
    name: '⚡ 流行摇滚/高亢飙音',
    style: 'pop rock ballad, driving acoustic and electric guitar, dynamic drums, soaring male vocal, 96 bpm, passionate',
    vocal: 'High-pitched raspy male vocal with soaring high notes',
    inst: 'Acoustic rhythm guitar, overdrive electric lead guitar, rock drum kit',
    negative: 'no auto-tune, no death metal, no electronic synth drop',
  },
];

const compileSunoMetatagLyrics = (bp: ImitationSongBlueprint | null, vocalStyle: string) => {
  if (!bp || !bp.structuralBlueprint) return '';
  let lyricText = `[Intro - ${bp.genreAndMood || 'Acoustic Intro'}]\n\n`;

  bp.structuralBlueprint.forEach((section) => {
    const secName = section.sectionName;
    const isChorus = secName.toLowerCase().includes('chorus') || secName.includes('副歌');
    const isVerse = secName.toLowerCase().includes('verse') || secName.includes('主歌');
    const isBridge = secName.toLowerCase().includes('bridge') || secName.includes('桥段');
    const isOutro = secName.toLowerCase().includes('outro') || secName.includes('尾声');

    let sectionTag = `[${secName}]`;
    if (isChorus) {
      sectionTag = `[${secName} - High Energy, ${vocalStyle || 'Emotional Belt'}]`;
    } else if (isVerse) {
      sectionTag = `[${secName} - Soft Whispering, Gentle Acoustic]`;
    } else if (isBridge) {
      sectionTag = `[${secName} - Cello Buildup, Dynamic Rise]`;
    } else if (isOutro) {
      sectionTag = `[${secName} - Slow Fade Out, Soft Piano]`;
    }

    lyricText += `${sectionTag}\n`;
    section.lines?.forEach((line) => {
      lyricText += `${line.lineText}\n`;
    });
    lyricText += `\n`;
  });

  return lyricText.trim();
};

const PAIRED_INSPIRATIONS = [
  {
    theme: "毕业多年后在旧书店偶遇青春期暗恋的人",
    mood: "由克制的遗憾转化为释怀的温柔"
  },
  {
    theme: "深夜独自坐在老餐馆里吃一碗热面，想起远方的故乡",
    mood: "怀旧温暖，伴随淡淡的怅然若失与岁月静好"
  },
  {
    theme: "收拾旧物件时翻出十年前未寄出的明信片",
    mood: "主歌压抑克制，副歌情感爆发宣泄，后段回归深情余音"
  },
  {
    theme: "异地恋最后一次在机场拥抱并各自奔赴前程",
    mood: "深情告白与放手祝福交织的复杂微妙心境"
  },
  {
    theme: "下雨天站在天桥上看熙熙攘攘的车流，内心重归平静",
    mood: "如清晨微风般治愈而平静的成长感悟"
  },
  {
    theme: "和多年老友在街头烧烤摊喝啤酒谈论未完成的梦想",
    mood: "微醺感伤中带着对未来的笃定与希望"
  },
  {
    theme: "独自在海边听浪花拍岸，告别一段无疾而终的感情",
    mood: "从自嘲孤单与迷茫，到勇敢拥抱真实的自己"
  },
  {
    theme: "搭乘末班地铁环线，看窗外倒退的城市夜景与灯火",
    mood: "空灵梦幻，仿佛置身于星空与大海交界处的沉浸感"
  },
  {
    theme: "告别打拼多年的大城市，在列车启动那一刻的释怀",
    mood: "热血燃向，从绝望低谷到破茧重生的极速飙升"
  },
  {
    theme: "在异国他乡的咖啡馆里突然听到熟悉的母语老歌",
    mood: "轻快俏皮，带着一丝对微小幸福的满足感"
  }
];

// Dynamic generator for song-derived story themes
const getSongDerivedThemes = (analysis: SongAnalysisResult) => {
  const themesSet = new Set<string>();

  // 1. Suggested themes from song analysis
  if (analysis.suggestedNewThemes && analysis.suggestedNewThemes.length > 0) {
    analysis.suggestedNewThemes.forEach((t) => themesSet.add(t));
  }

  // 2. Theme derived from lyricCrafting summary
  if (analysis.lyricCrafting?.themeSummary) {
    themesSet.add(`延续《${analysis.songTitle}》感人情绪: ${analysis.lyricCrafting.themeSummary}`);
  }

  // 3. Theme derived from core metaphors
  if (analysis.lyricCrafting?.coreMetaphors && analysis.lyricCrafting.coreMetaphors.length > 0) {
    themesSet.add(`以“${analysis.lyricCrafting.coreMetaphors.slice(0, 2).join(' / ')}”为核心意象的都市物语`);
  }

  // 4. Paired curated themes
  PAIRED_INSPIRATIONS.forEach((p) => themesSet.add(p.theme));

  return Array.from(themesSet);
};

// Dynamic generator for song-derived emotional logic & mood
const getSongDerivedMoods = (analysis: SongAnalysisResult) => {
  const moodsSet = new Set<string>();

  // 1. Vibe moods from song analysis
  if (analysis.vibeMood && analysis.vibeMood.length > 0) {
    moodsSet.add(analysis.vibeMood.join(' / '));
    analysis.vibeMood.forEach((m) => moodsSet.add(m));
  }

  // 2. Emotional effects from chord progressions
  if (analysis.chordProgressions) {
    analysis.chordProgressions.forEach((cp) => {
      if (cp.emotionalEffect) moodsSet.add(cp.emotionalEffect);
    });
  }

  // 3. Paired curated moods
  PAIRED_INSPIRATIONS.forEach((p) => moodsSet.add(p.mood));

  return Array.from(moodsSet);
};

interface ImitationStudioProps {
  analysis: SongAnalysisResult;
  onGenerateBlueprint: (customization: any) => Promise<void>;
  blueprint: ImitationSongBlueprint | null;
  isGenerating: boolean;
}

export const ImitationStudio: React.FC<ImitationStudioProps> = ({
  analysis,
  onGenerateBlueprint,
  blueprint,
  isGenerating,
}) => {
  // Customization Form States
  const [imitationLevel, setImitationLevel] = useState<'light' | 'medium' | 'exact'>('medium');
  const [newTitle, setNewTitle] = useState('');
  const [newThemeTopic, setNewThemeTopic] = useState(analysis.suggestedNewThemes?.[0] || '');
  const [targetMood, setTargetMood] = useState(analysis.vibeMood?.join(', ') || '感动 / 怀旧');
  const [desiredKey, setDesiredKey] = useState(analysis.musicalKey || 'G Major');
  const [tempoAdjustment, setTempoAdjustment] = useState(analysis.tempoBpm || 84);
  const [language, setLanguage] = useState('中文');

  // Copy & Audio States
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [isPlayingHook, setIsPlayingHook] = useState(false);
  const [activeNoteIdx, setActiveNoteIdx] = useState<number | null>(null);
  const [playingChordSection, setPlayingChordSection] = useState<number | null>(null);

  // Rhyme Polish Modal State
  const [polishLine, setPolishLine] = useState('');
  const [polishOptions, setPolishOptions] = useState<string[]>([]);
  const [isPolishing, setIsPolishing] = useState(false);
  const [showPolishModal, setShowPolishModal] = useState(false);

  // Suno AI Fine-Tuning & Anti-Drift Control Panel States
  const [sunoStylePrompt, setSunoStylePrompt] = useState('');
  const [sunoWeight, setSunoWeight] = useState(85);
  const [sunoRandomness, setSunoRandomness] = useState(25);
  const [sunoNegativePrompt, setSunoNegativePrompt] = useState('no auto-tune, no heavy rock, no EDM drop, no shouting, no harsh synth');
  const [sunoVocalType, setSunoVocalType] = useState('Warm intimate male vocal');
  const [sunoInstrumentation, setSunoInstrumentation] = useState('Fingerstyle acoustic guitar, grand piano, solo cello');
  const [activeSunoPreset, setActiveSunoPreset] = useState<string | null>(null);
  const [showMetatagsLyricView, setShowMetatagsLyricView] = useState(false);

  // Sync Suno parameters when blueprint updates
  useEffect(() => {
    if (blueprint) {
      const params = blueprint.aiMusicPrompt?.sunoParameters;
      setSunoStylePrompt(params?.styleTags || blueprint.aiMusicPrompt?.sunoPrompt || 'mandopop, acoustic guitar, soft piano, warm male vocal, 84 bpm, emotional');
      setSunoWeight(params?.styleGuidanceWeight || 85);
      setSunoRandomness(params?.creativityRandomness || 25);
      setSunoNegativePrompt(params?.negativePrompt || 'no auto-tune, no heavy rock, no EDM drop, no shouting, no harsh synth');
      setSunoVocalType(params?.vocalSettings || 'Warm intimate male vocal, gentle breathiness');
      setSunoInstrumentation(params?.instrumentation || 'Fingerstyle acoustic guitar, grand piano, solo cello');
      setActiveSunoPreset(null);
    }
  }, [blueprint]);

  // Memoized Song-Derived Inspiration Pools
  const songDerivedThemes = useMemo(() => getSongDerivedThemes(analysis), [analysis]);
  const songDerivedMoods = useMemo(() => getSongDerivedMoods(analysis), [analysis]);

  // Randomize Story Theme & Mood Logic Handlers
  const handleRandomizeTheme = () => {
    const filtered = songDerivedThemes.filter((item) => item !== newThemeTopic);
    const selected = filtered[Math.floor(Math.random() * filtered.length)] || songDerivedThemes[0];
    if (selected) setNewThemeTopic(selected);
  };

  const handleRandomizeMood = () => {
    const filtered = songDerivedMoods.filter((item) => item !== targetMood);
    const selected = filtered[Math.floor(Math.random() * filtered.length)] || songDerivedMoods[0];
    if (selected) setTargetMood(selected);
  };

  const handleRandomizeAllStoryAndMood = () => {
    // Pick a paired inspiration
    const pairIndex = Math.floor(Math.random() * PAIRED_INSPIRATIONS.length);
    const selectedPair = PAIRED_INSPIRATIONS[pairIndex];
    setNewThemeTopic(selectedPair.theme);
    setTargetMood(selectedPair.mood);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerateBlueprint({
      imitationLevel,
      newTitle,
      newThemeTopic,
      targetMood,
      desiredKey,
      tempoAdjustment,
      language,
    });
  };

  const handleCopyText = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handlePlayHookMelody = () => {
    if (!blueprint?.melodyHookNotes || blueprint.melodyHookNotes.length === 0) return;

    if (isPlayingHook) {
      stopChordProgression();
      setIsPlayingHook(false);
      setActiveNoteIdx(null);
      return;
    }

    setIsPlayingHook(true);
    playMelodyHook(
      blueprint.melodyHookNotes,
      tempoAdjustment,
      (idx) => setActiveNoteIdx(idx),
      () => {
        setIsPlayingHook(false);
        setActiveNoteIdx(null);
      }
    );
  };

  const handlePlayChordProg = (secIdx: number, chords: string[]) => {
    if (playingChordSection === secIdx) {
      stopChordProgression();
      setPlayingChordSection(null);
      return;
    }

    setPlayingChordSection(secIdx);
    playChordProgression(
      chords,
      tempoAdjustment,
      undefined,
      () => setPlayingChordSection(null)
    );
  };

  const handleOpenPolishModal = (lineText: string) => {
    setPolishLine(lineText);
    setPolishOptions([]);
    setShowPolishModal(true);
  };

  const handleRequestPolish = async () => {
    if (!polishLine.trim()) return;
    setIsPolishing(true);
    try {
      const res = await fetch('/api/rhyme-helper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ line: polishLine, targetRhyme: '流畅压韵', style: targetMood }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setPolishOptions(data.options || []);
    } catch (e) {
      console.error('Polish error:', e);
    } finally {
      setIsPolishing(false);
    }
  };

  const handleExportMidi = () => {
    if (!blueprint) return;
    downloadMidiFile(blueprint, tempoAdjustment);
  };

  // Format full lead sheet text for export
  const generateExportText = () => {
    if (!blueprint) return '';
    let text = `# 《${blueprint.title}》\n`;
    text += `副标题: ${blueprint.subtitle}\n`;
    text += `致敬参考: 《${analysis.songTitle}》 - ${analysis.artist}\n`;
    text += `调性/速度: ${blueprint.tempoAndKey}\n`;
    text += `风格氛围: ${blueprint.genreAndMood}\n\n`;
    text += `--------------------------------------\n\n`;

    blueprint.structuralBlueprint?.forEach((sec) => {
      text += `[${sec.sectionName}] (和弦: ${sec.chordsUsed?.join(' - ')})\n`;
      sec.lines?.forEach((line) => {
        text += `${line.chords}\n`;
        text += `${line.lineText}\n\n`;
      });
    });

    text += `--------------------------------------\n`;
    text += `【Suno AI 提示词】:\n${blueprint.aiMusicPrompt?.sunoPrompt}\n`;
    return text;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Customization Panel */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
              <Wand2 className="w-5 h-5 text-amber-400" />
              <span>AI 仿写定制参数 (Songwriting Customization)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              基于原曲《{analysis.songTitle}》的和声走向与律动模版，打造全新主题与歌词
            </p>
          </div>
        </div>

        <form onSubmit={handleCustomSubmit} className="space-y-6">
          {/* Block 1: Imitation Intensity Level Selection */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>仿写强度级别 (Imitation Intensity Level)</span>
              </label>
              <span className="text-[11px] text-amber-400 font-normal">选择 AI 继承原曲乐理基因的比重</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 items-stretch">
              {/* Light */}
              <button
                type="button"
                onClick={() => setImitationLevel('light')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  imitationLevel === 'light'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-200 ring-1 ring-amber-500/50 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-sky-400" />
                    <span>轻度仿写</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono">
                    20-30% 基因
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  提炼原曲情绪与氛围色彩，自由拓展全新和理走向与独立构思
                </p>
              </button>

              {/* Medium */}
              <button
                type="button"
                onClick={() => setImitationLevel('medium')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between relative ${
                  imitationLevel === 'medium'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-200 ring-1 ring-amber-500/50 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm flex items-center space-x-1.5">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    <span>中度仿写</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold">
                    推荐 · 50-70%
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  严格继承核心和声框架与段落布局，均衡经典神韵与全新原创
                </p>
              </button>

              {/* 1:1 Exact */}
              <button
                type="button"
                onClick={() => setImitationLevel('exact')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  imitationLevel === 'exact'
                    ? 'bg-rose-500/10 border-rose-500 text-rose-200 ring-1 ring-rose-500/50 shadow-lg shadow-rose-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm flex items-center space-x-1.5">
                    <Layers className="w-4 h-4 text-rose-400" />
                    <span>1:1 还原 (极致复刻)</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono font-bold">
                    100% 模版对齐
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  1:1 精确复刻小节数、和弦级数与字数押韵节奏，完美无缝模版替换
                </p>
              </button>
            </div>
          </div>

          {/* Block 2: Meta Settings (Title, Key & BPM) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            {/* Field 1: New Song Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                新歌名称 (留空则由 AI 自动生成)
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="例如：晚风里的第三封信"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Field 2: Target Key & Tempo */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                目标调性 (Key) & BPM 速度
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={desiredKey}
                  onChange={(e) => setDesiredKey(e.target.value)}
                  placeholder="调性 (如 G Major)"
                  className="w-1/2 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-sm focus:border-amber-500 focus:outline-none"
                />
                <input
                  type="number"
                  value={tempoAdjustment}
                  onChange={(e) => setTempoAdjustment(Number(e.target.value))}
                  placeholder="BPM (如 84)"
                  className="w-1/2 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Block 3: Story Theme & Emotional Logic (Spans full width) */}
          <div className="rounded-2xl bg-slate-950/90 border border-slate-800 p-5 space-y-4 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-3 gap-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="text-sm font-bold text-slate-100">
                    仿写故事主题 & 情感逻辑 (Story Theme & Emotional Logic)
                  </span>
                  <p className="text-[11px] text-slate-400">
                    基于原歌《{analysis.songTitle}》乐理与词作解构提供丰富灵感，点击下方推荐标签快速替换或点击一键随机
                  </p>
                </div>
              </div>

              {/* Master Combined Randomizer Button */}
              <button
                type="button"
                onClick={handleRandomizeAllStoryAndMood}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-indigo-500/20 hover:from-amber-500/30 hover:to-indigo-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer shrink-0 shadow-md"
                title="一键随机更换仿写故事主题与情感起伏逻辑"
              >
                <Dices className="w-4 h-4 text-amber-400 animate-bounce" />
                <span>🎲 随机全部更换 (主题+情感)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
              {/* Field 1: Story Theme Topic */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">
                    仿写故事主题 (Story Theme)
                  </label>
                  <button
                    type="button"
                    onClick={handleRandomizeTheme}
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center space-x-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 transition-all cursor-pointer"
                    title="仅随机换故事主题"
                  >
                    <Shuffle className="w-3 h-3" />
                    <span>单项微调</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={newThemeTopic}
                  onChange={(e) => setNewThemeTopic(e.target.value)}
                  placeholder="例如：毕业多年后在旧书店偶遇青春期暗恋的人"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-500 text-slate-100 placeholder-slate-600 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />

                {/* Quick Select Chips for Story Themes */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] text-slate-400 font-medium block">
                    💡 原歌衍生灵感 & 推荐主题 (点击直接套用):
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
                    {songDerivedThemes.map((themeItem, idx) => {
                      const isSelected = newThemeTopic === themeItem;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setNewThemeTopic(themeItem)}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all text-left cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-semibold'
                              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                          }`}
                        >
                          {themeItem}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Field 2: Emotional Logic & Mood */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">
                    情感逻辑 & 目标氛围 (Emotional Logic & Mood)
                  </label>
                  <button
                    type="button"
                    onClick={handleRandomizeMood}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 transition-all cursor-pointer"
                    title="仅随机换情感逻辑"
                  >
                    <Shuffle className="w-3 h-3" />
                    <span>单项微调</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={targetMood}
                  onChange={(e) => setTargetMood(e.target.value)}
                  placeholder="例如：由克制的遗憾转化为释怀的温柔"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-500 text-slate-100 placeholder-slate-600 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />

                {/* Quick Select Chips for Mood Logics */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] text-slate-400 font-medium block">
                    🎭 原曲起伏逻辑 & 目标氛围 (点击直接套用):
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
                    {songDerivedMoods.map((moodItem, idx) => {
                      const isSelected = targetMood === moodItem;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setTargetMood(moodItem)}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all text-left cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/60 font-semibold'
                              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                          }`}
                        >
                          {moodItem}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-bold text-sm transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>AI 作词家兼编曲师正在按【{imitationLevel === 'exact' ? '1:1 还原' : imitationLevel === 'light' ? '轻度仿写' : '中度仿写'}】标准谱写歌曲...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>生成【{imitationLevel === 'exact' ? '1:1 还原极致复刻' : imitationLevel === 'light' ? '轻度灵感仿写' : '中度平衡仿写'}】全新原创 Blueprint</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* 2. Generated Song Blueprint Display */}
      {blueprint && (
        <div className="space-y-8 animate-fadeIn">
          {/* Blueprint Hero Badge */}
          <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-amber-500/40 p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                    ✨ AI 仿写生成完成
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-semibold">
                    级别: {blueprint.imitationLevel || (imitationLevel === 'exact' ? '1:1 还原 (极致复刻)' : imitationLevel === 'light' ? '轻度仿写' : '中度仿写')}
                  </span>
                </div>
                <h1 className="text-3xl font-black text-amber-300 mt-2">
                  《{blueprint.title}》
                </h1>
                <p className="text-sm text-slate-300 italic mt-0.5">{blueprint.subtitle}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleExportMidi}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center space-x-1.5 cursor-pointer"
                  title="将旋律 Hook 与全曲和弦编曲导出为 standard .MID 文件，可直接导入 Logic, Ableton, FL Studio 等 DAW 中"
                >
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>导出为 MIDI 文件 (.mid)</span>
                </button>
                <button
                  onClick={() => handleCopyText(generateExportText(), 'leadSheet')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  {copiedType === 'leadSheet' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>复制完整和弦歌词总谱</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block">继承音乐基因:</span>
                <span className="font-semibold text-slate-200">{blueprint.originalInspiration}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block">调性与速度:</span>
                <span className="font-mono font-bold text-amber-400">{blueprint.tempoAndKey}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block">曲风与情绪:</span>
                <span className="font-semibold text-indigo-300">{blueprint.genreAndMood}</span>
              </div>
            </div>
          </div>

          {/* Melody Hook Piano Roll & Web Audio Synthesizer */}
          {blueprint.melodyHookNotes && blueprint.melodyHookNotes.length > 0 && (
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-slate-100 text-md flex items-center space-x-2">
                    <Music className="w-5 h-5 text-amber-400" />
                    <span>副歌核心 Hook 旋律音符预览 (Web Audio Piano Synthesis)</span>
                  </h3>
                  <p className="text-xs text-slate-400">点击播放试听 AI 构思的副歌旋律小样</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleExportMidi}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer"
                    title="将副歌 Hook 旋律与全曲和弦导出为标准 MIDI 文件"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>导出 Hook MIDI</span>
                  </button>

                  <button
                    onClick={handlePlayHookMelody}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center space-x-2 cursor-pointer ${
                      isPlayingHook
                        ? 'bg-rose-500 text-slate-950 shadow-lg shadow-rose-500/20'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                    }`}
                  >
                    {isPlayingHook ? (
                      <>
                        <Square className="w-4 h-4 fill-current" />
                        <span>停止试听</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        <span>播放副歌 Hook 旋律小样</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Note Pills Visualizer */}
              <div className="flex flex-wrap gap-2 pt-2">
                {blueprint.melodyHookNotes.map((note, idx) => {
                  const isActive = isPlayingHook && activeNoteIdx === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => playChord(note.pitch)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer min-w-[60px] ${
                        isActive
                          ? 'bg-amber-400 text-slate-950 border-amber-300 scale-110 shadow-lg shadow-amber-400/40'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800'
                      }`}
                    >
                      <span className="block font-mono font-bold text-sm">{note.pitch}</span>
                      <span className="block text-xs font-semibold text-rose-300 mt-1">
                        "{note.lyricWord}"
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Lead Sheet & Chords (弹唱和弦总谱) */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-lg flex items-center space-x-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <span>新歌和弦弹唱总谱 (Interactive Lead Sheet)</span>
              </h3>
              <button
                onClick={handleExportMidi}
                className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer"
                title="导出全曲各段落和弦与旋律为 DAW MIDI 文件"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>导出 DAW 和弦 MIDI</span>
              </button>
            </div>

            <div className="space-y-6">
              {blueprint.structuralBlueprint?.map((section, sIdx) => (
                <div key={sIdx} className="rounded-xl bg-slate-950 border border-slate-800/80 p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center space-x-3">
                      <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30">
                        {section.sectionName}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        和弦: {section.chordsUsed?.join(' - ')}
                      </span>
                    </div>

                    <button
                      onClick={() => handlePlayChordProg(sIdx, section.chordsUsed || [])}
                      className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1 self-start sm:self-auto"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>试听此段和弦</span>
                    </button>
                  </div>

                  {/* Lines with Chords overlay */}
                  <div className="space-y-4 font-mono">
                    {section.lines?.map((line, lIdx) => (
                      <div key={lIdx} className="group relative bg-slate-900/50 p-3 rounded-lg border border-slate-800/50 hover:border-slate-700">
                        {/* Chords row */}
                        <div className="text-amber-400 font-bold text-xs tracking-wider">
                          {line.chords || 'C'}
                        </div>
                        {/* Lyrics row */}
                        <div className="text-slate-100 font-sans text-sm sm:text-base font-medium mt-1">
                          {line.lineText}
                        </div>

                        {/* Rhyme tag */}
                        {line.rhymeTag && (
                          <span className="absolute right-3 top-3 px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-mono">
                            [{line.rhymeTag}] 韵
                          </span>
                        )}

                        {/* Polish button */}
                        <button
                          onClick={() => handleOpenPolishModal(line.lineText)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-16 top-2.5 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-amber-300 flex items-center space-x-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>改写/润色</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  {section.performanceNote && (
                    <p className="text-xs text-slate-400 italic bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/40">
                      💡 演唱提示: {section.performanceNote}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* AI Music Prompts & Suno AI Anti-Drift Studio */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
            {/* Header Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Suno AI 专属调教与防跑偏控制台 (Anti-Drift Studio)</span>
                  </span>
                </div>
                <h3 className="font-extrabold text-slate-100 text-lg mt-1.5 flex items-center space-x-2">
                  <span>根据仿写歌词与《{blueprint.title}》主题精确调节 Suno 生成参数</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  精细微调风格权重、离散随机度、负向排除词与结构元标签，确保 AI 生成歌曲 100% 契合主题不跑偏
                </p>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => {
                    const compiledLyrics = compileSunoMetatagLyrics(blueprint, sunoVocalType);
                    const fullConfig = `[Suno Custom Mode 一键应用配方]\n\n【Title】: ${blueprint.title}\n\n【Style of Music】:\n${sunoStylePrompt}\n\n【Style Weight】: ${sunoWeight}%\n【Randomness / Weirdness】: ${sunoRandomness}%\n【Exclude Styles (Negative Prompt)】:\n${sunoNegativePrompt}\n\n【Lyrics with Metatags】:\n${compiledLyrics}`;
                    handleCopyText(fullConfig, 'fullSunoSuite');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center space-x-1.5 cursor-pointer"
                >
                  {copiedType === 'fullSunoSuite' ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-950" />
                      <span>已复制全套配方！</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>一键复制 Suno Custom Mode 完整配置</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Block 1: Quick Style Preset Selector */}
            <div className="space-y-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>防跑偏风格流派一键预设 (Quick Style Presets)</span>
                </span>
                <span className="text-[11px] text-slate-400">点击自动填入优化后的 Style Tags & 排除词</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {SUNO_STYLE_PRESETS.map((preset) => {
                  const isActive = activeSunoPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setActiveSunoPreset(preset.id);
                        setSunoStylePrompt(preset.style);
                        setSunoVocalType(preset.vocal);
                        setSunoInstrumentation(preset.inst);
                        setSunoNegativePrompt(preset.negative);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-md shadow-amber-500/10'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                      }`}
                    >
                      <span className="text-xs font-semibold block">{preset.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Block 2: Interactive Sliders & Anti-Drift Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Left Column: Weight Sliders & Negative Exclusions */}
              <div className="space-y-5 bg-slate-950/90 p-5 rounded-2xl border border-slate-800 shadow-md">
                <h4 className="font-bold text-xs text-amber-400 uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-800 pb-2.5">
                  <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                  <span>Suno AI 参数精细度与防跑偏滑块</span>
                </h4>

                {/* Slider 1: Style Guidance Weight (风格跟随度 / 权重) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                      <Target className="w-3.5 h-3.5 text-amber-400" />
                      <span>风格跟随度 (Style Guidance Weight)</span>
                    </label>
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                      {sunoWeight}% {sunoWeight >= 80 ? '(高约束·防跑偏)' : '(中灵活性)'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={sunoWeight}
                    onChange={(e) => setSunoWeight(Number(e.target.value))}
                    className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-400 leading-normal">
                    💡 建议设为 <strong className="text-amber-300">80%-90%</strong>。权重越高，Suno 越严格依附于《{blueprint.title}》的乐理配方与情绪，杜绝AI擅自换曲风。
                  </p>
                </div>

                {/* Slider 2: Weirdness / Creativity Randomness (离散随机度) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                      <Zap className="w-3.5 h-3.5 text-indigo-400" />
                      <span>离散随机度 (Weirdness / Randomness)</span>
                    </label>
                    <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/30">
                      {sunoRandomness}% {sunoRandomness <= 30 ? '(稳定严谨)' : '(高离散随机)'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sunoRandomness}
                    onChange={(e) => setSunoRandomness(Number(e.target.value))}
                    className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-400 leading-normal">
                    💡 建议设为 <strong className="text-indigo-300">15%-30%</strong>。较低的随机度能保持和声与旋律走线平稳，防止副歌段落出现爆音或奇怪电子干扰。
                  </p>
                </div>

                {/* Field 3: Anti-Drift Negative Prompt (排除词 / Excluded Styles) */}
                <div className="space-y-2 pt-1 border-t border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                      <span>防跑偏排除词 (Exclude Styles / Negative Tags)</span>
                    </label>
                    <span className="text-[11px] text-rose-300 font-mono">告诉 AI 绝对不要包含的元素</span>
                  </div>
                  <input
                    type="text"
                    value={sunoNegativePrompt}
                    onChange={(e) => setSunoNegativePrompt(e.target.value)}
                    placeholder="如 no auto-tune, no heavy rock, no EDM drop, no shouting"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-mono text-xs focus:border-rose-500 focus:outline-none"
                  />
                  {/* Quick Toggle Chips for Excluded Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['no auto-tune', 'no EDM', 'no heavy metal', 'no shouting', 'no rap', 'no distortion'].map((tag) => {
                      const exists = sunoNegativePrompt.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            if (exists) {
                              setSunoNegativePrompt(
                                sunoNegativePrompt
                                  .split(',')
                                  .map((s) => s.trim())
                                  .filter((s) => s !== tag)
                                  .join(', ')
                              );
                            } else {
                              setSunoNegativePrompt(
                                sunoNegativePrompt ? `${sunoNegativePrompt}, ${tag}` : tag
                              );
                            }
                          }}
                          className={`text-[10px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                            exists
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 font-bold'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {exists ? `✓ ${tag}` : `+ ${tag}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Style of Music Editor & Vocal/Instrument Tweaks */}
              <div className="space-y-5 bg-slate-950/90 p-5 rounded-2xl border border-slate-800 shadow-md">
                <h4 className="font-bold text-xs text-indigo-400 uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-800 pb-2.5">
                  <Radio className="w-4 h-4 text-indigo-400" />
                  <span>Suno Style of Music (风格与人声调校)</span>
                </h4>

                {/* Style of Music Text Area */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-200">
                      Suno Style Prompt 提示词 (限制 120 字符)
                    </label>
                    <span
                      className={`text-[11px] font-mono font-bold ${
                        sunoStylePrompt.length > 120 ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {sunoStylePrompt.length} / 120 字符 {sunoStylePrompt.length > 120 ? '(超出建议缩短)' : ''}
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={sunoStylePrompt}
                    onChange={(e) => setSunoStylePrompt(e.target.value)}
                    placeholder="mandopop, acoustic guitar, soft piano, warm male vocal, 84 bpm, emotional"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 font-mono text-xs leading-relaxed focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {/* Vocal Style Selection */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-200">
                    人声质感 (Vocal Texture)
                  </label>
                  <input
                    type="text"
                    value={sunoVocalType}
                    onChange={(e) => setSunoVocalType(e.target.value)}
                    placeholder="Warm intimate male vocal with soft breathiness"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {/* Instrumentation Selection */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-200">
                    核心编曲乐器 (Instrumentation)
                  </label>
                  <input
                    type="text"
                    value={sunoInstrumentation}
                    onChange={(e) => setSunoInstrumentation(e.target.value)}
                    placeholder="Fingerstyle acoustic guitar, grand piano, solo cello"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Block 3: Suno Custom Mode Copy-Ready Form Cards */}
            <div className="space-y-4 pt-2">
              <h4 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
                <ListChecks className="w-4 h-4 text-amber-400" />
                <span>Suno 官方 Custom Mode 一键应用配方卡 (Direct Copy Cards)</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Card 1: Metatags Lyrics Block */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-amber-400 flex items-center space-x-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      <span>1. 歌词框 (嵌入 Suno 结构元标签)</span>
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowMetatagsLyricView(!showMetatagsLyricView)}
                        className="text-[11px] text-slate-400 hover:text-slate-200 underline"
                      >
                        {showMetatagsLyricView ? '折叠文本' : '预览全词'}
                      </button>
                      <button
                        onClick={() => {
                          const compiled = compileSunoMetatagLyrics(blueprint, sunoVocalType);
                          handleCopyText(compiled, 'metatagsLyrics');
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center space-x-1"
                      >
                        {copiedType === 'metatagsLyrics' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>复制带标签歌词</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    已在每段歌词头部注入 <code className="text-amber-300">[Verse 1 - Soft Acoustic]</code>、<code className="text-amber-300">[Chorus - Emotional Belt]</code> 等中括号结构指令，强力约束 AI 按情绪演进。
                  </p>

                  {showMetatagsLyricView && (
                    <pre className="text-[11px] font-mono text-slate-300 leading-relaxed bg-slate-900 p-3 rounded-lg border border-slate-800 max-h-60 overflow-y-auto whitespace-pre-wrap custom-scrollbar">
                      {compileSunoMetatagLyrics(blueprint, sunoVocalType)}
                    </pre>
                  )}
                </div>

                {/* Card 2: Style of Music Prompt Box */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-indigo-400 flex items-center space-x-1.5">
                      <Music className="w-3.5 h-3.5" />
                      <span>2. 风格提示词框 (Style of Music)</span>
                    </span>
                    <button
                      onClick={() => handleCopyText(sunoStylePrompt, 'sunoStyleField')}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center space-x-1"
                    >
                      {copiedType === 'sunoStyleField' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>复制 Style 词</span>
                    </button>
                  </div>
                  <p className="text-xs font-mono text-amber-300 leading-relaxed bg-slate-900 p-3 rounded-lg border border-slate-800">
                    {sunoStylePrompt}
                  </p>
                </div>

                {/* Card 3: Negative Excluded Tags */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-rose-400 flex items-center space-x-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>3. 排除风格框 (Exclude Styles)</span>
                    </span>
                    <button
                      onClick={() => handleCopyText(sunoNegativePrompt, 'sunoNegativeField')}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center space-x-1"
                    >
                      {copiedType === 'sunoNegativeField' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>复制排除词</span>
                    </button>
                  </div>
                  <p className="text-xs font-mono text-rose-300 leading-relaxed bg-slate-900 p-3 rounded-lg border border-slate-800">
                    {sunoNegativePrompt}
                  </p>
                </div>

                {/* Card 4: Udio Prompt & DAW Guide */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-emerald-400 flex items-center space-x-1.5">
                      <Radio className="w-3.5 h-3.5" />
                      <span>4. Udio AI & DAW 提示扩展</span>
                    </span>
                    <button
                      onClick={() => handleCopyText(blueprint.aiMusicPrompt?.udioPrompt || '', 'udioPrompt')}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center space-x-1"
                    >
                      {copiedType === 'udioPrompt' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>复制 Udio 提示词</span>
                    </button>
                  </div>
                  <p className="text-xs font-mono text-slate-300 leading-relaxed bg-slate-900 p-3 rounded-lg border border-slate-800">
                    {blueprint.aiMusicPrompt?.udioPrompt}
                  </p>
                </div>
              </div>
            </div>

            {/* Block 4: Anti-Drift Best Practices Guide */}
            <div className="bg-gradient-to-r from-amber-500/10 via-slate-950 to-indigo-500/10 p-5 rounded-2xl border border-amber-500/30 space-y-3">
              <h4 className="font-bold text-xs text-amber-300 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Suno AI “不跑偏” 调校 6 大金律 (Anti-Drift Rules for Lyrics & Theme)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-slate-300">
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="font-bold text-amber-300 block mb-1">1. 中括号结构约束</span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    在歌词各段落头部务必保留 <code className="text-amber-400">[Verse]</code>、<code className="text-amber-400">[Chorus]</code> 标记，Suno 识别后绝不跳乱段落顺序。
                  </p>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="font-bold text-indigo-300 block mb-1">2. 动态演唱加词</span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    在 <code className="text-indigo-400">[Chorus - High Energy Belt]</code> 追加情绪词，能引导 AI 在副歌自动飙高音与爆发全场弦乐。
                  </p>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="font-bold text-rose-300 block mb-1">3. 排除词彻底堵漏</span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    填入 <code className="text-rose-400">no auto-tune, no heavy metal</code> 排除词，彻底杜绝 AI 乱用电音修音或电吉他失真爆音。
                  </p>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="font-bold text-emerald-300 block mb-1">4. 权重与离散度黄金比</span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    风格跟随度保持 80%-90%，离散随机度保持 15%-30%，这是音乐听感最自然且最严守主题的经验参数。
                  </p>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="font-bold text-sky-300 block mb-1">5. 保持人声突出</span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    在 Style 提示词中加入 <code className="text-sky-400">warm male vocal, clear vocal focus</code>，可保证人声歌词清晰可听不被伴奏淹没。
                  </p>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="font-bold text-amber-300 block mb-1">6. 120 字符临界控制</span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Suno 的 Style 框限制 120 字符，精简提取核心流派 + 乐器 + 人声 + BPM 才是最精准的触发方式。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rhyme & Polish Modal */}
      {showPolishModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span>歌词金句润色助攻</span>
              </h3>
              <button
                onClick={() => setShowPolishModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">原句：</label>
              <input
                type="text"
                value={polishLine}
                onChange={(e) => setPolishLine(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-sans"
              />
            </div>

            <button
              onClick={handleRequestPolish}
              disabled={isPolishing}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center space-x-1"
            >
              {isPolishing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI 正在酝酿不同押韵与诗意选项...</span>
                </>
              ) : (
                <span>生成 4 种优质同韵改写方案</span>
              )}
            </button>

            {polishOptions.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-xs text-slate-400 font-semibold">推荐润色结果：</span>
                {polishOptions.map((opt, i) => (
                  <div
                    key={i}
                    onClick={() => handleCopyText(opt, `opt-${i}`)}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-xs text-slate-200 cursor-pointer flex items-center justify-between group"
                  >
                    <span>{opt}</span>
                    <span className="text-[10px] text-amber-400 group-hover:underline">点击复制</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
