import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  SongAnalysisResult,
  ImitationSongBlueprint,
  LyricComparisonData,
  LyricSectionStructure,
} from '../types';
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
  X,
  Plus,
  ArrowRight,
  ExternalLink,
  Bot,
  Users,
  Eye,
  AlignLeft,
  VolumeX,
} from 'lucide-react';

// Default reference lyrics structure sample
const DEFAULT_REFERENCE_LYRICS = `[前奏]
Dear old days
Goodbye now

[主歌]
抽屉里那张褪了色的旧相片
记录着当时稚嫩的侧脸
灰尘静静堆叠
故事还没写完结
笔尖停在昨天
没寄出的那场告别

[导歌]
Time to let it go
那些反复纠结的 every single night
终于在这一刻学会了 move on and smile
遗憾不再是锁链
像风吹过了指尖
往事化成碎片
散落在地平线

[副歌]
我们用尽全力 学会了释怀
却在人海茫茫中 弄丢了依赖
泪水凝结成了 微小的尘埃
在时光深处 慢慢掩埋
曾经以为永远 怎么被风吹散
承诺在岁月中 变成了习惯
现在的你 是否已经释然
晚安 那些未能说出口的爱

[桥段]
如果时间能够倒流重来
哪怕再次跌入深渊尘埃
我依然会选择 奔向你的未来

[尾声]
Goodbye my yesterday
终于学会释怀
晚安`;

// Helper: Calculate character/syllable count for Chinese or mixed English
const countSyllables = (text: string): number => {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  // Match English words
  const enWords = trimmed.match(/[a-zA-Z0-9']+/g) || [];
  // Remove English words and spaces to count Chinese chars
  const nonEn = trimmed.replace(/[a-zA-Z0-9'\s.,!?;:，。！？；：“”‘’]/g, '');
  return nonEn.length + enWords.length;
};

// Client-side quick parser for lyrics structure
const parseLyricsClientSide = (rawLyrics: string): LyricComparisonData => {
  const lines = rawLyrics.split('\n');
  const sections: LyricSectionStructure[] = [];
  let currentSection: LyricSectionStructure | null = null;
  let totalLineCount = 0;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Check if line is a section header like [前奏], [主歌], [Verse], etc.
    const tagMatch = trimmed.match(/^\[(.*?)\]/);
    if (tagMatch) {
      if (currentSection && currentSection.lines.length > 0) {
        currentSection.lineCount = currentSection.lines.length;
        currentSection.summary = `共${currentSection.lines.length}句: ${currentSection.lines
          .slice(0, 6)
          .map((l) => `${l.lineIndex}句${l.syllableCount}字`)
          .join(', ')}${currentSection.lines.length > 6 ? '...' : ''}`;
        sections.push(currentSection);
      }
      const rawTag = tagMatch[1];
      let standardName = rawTag;
      if (rawTag.includes('前奏') || rawTag.toLowerCase().includes('intro')) standardName = '前奏';
      else if (rawTag.includes('主歌') || rawTag.toLowerCase().includes('verse')) standardName = '主歌';
      else if (rawTag.includes('导歌') || rawTag.toLowerCase().includes('pre')) standardName = '导歌';
      else if (rawTag.includes('副歌') || rawTag.toLowerCase().includes('chorus')) standardName = '副歌';
      else if (rawTag.includes('桥段') || rawTag.toLowerCase().includes('bridge')) standardName = '桥段';
      else if (rawTag.includes('尾声') || rawTag.toLowerCase().includes('outro')) standardName = '尾声';

      currentSection = {
        sectionName: standardName,
        tag: `[${rawTag}]`,
        lineCount: 0,
        lines: [],
      };
    } else {
      if (!currentSection) {
        currentSection = {
          sectionName: '主歌',
          tag: '[主歌]',
          lineCount: 0,
          lines: [],
        };
      }
      const syl = countSyllables(trimmed);
      totalLineCount++;
      currentSection.lines.push({
        lineIndex: currentSection.lines.length + 1,
        text: trimmed,
        syllableCount: syl,
      });
    }
  });

  if (currentSection && (currentSection as LyricSectionStructure).lines.length > 0) {
    (currentSection as LyricSectionStructure).lineCount = (currentSection as LyricSectionStructure).lines.length;
    (currentSection as LyricSectionStructure).summary = `共${(currentSection as LyricSectionStructure).lines.length}句: ${(currentSection as LyricSectionStructure).lines
      .slice(0, 6)
      .map((l) => `${l.lineIndex}句${l.syllableCount}字`)
      .join(', ')}${(currentSection as LyricSectionStructure).lines.length > 6 ? '...' : ''}`;
    sections.push(currentSection);
  }

  return {
    totalSections: sections.length,
    totalLines: totalLineCount,
    formattedLyricsWithTags: rawLyrics,
    sections,
  };
};

// Helper: Generate Top Lyricist Master Prompt based on song DNA
const buildLyricistSkillPrompt = (analysisData: SongAnalysisResult): string => {
  const title = analysisData.songTitle || '目标对标歌曲';
  const genre = analysisData.genre || '华语流行抒情';
  const moods = analysisData.vibeMood?.join(' / ') || '伤感下沉 / 治愈释怀 / 怀旧回忆';
  const metaphors = analysisData.lyricCrafting?.coreMetaphors?.join('、') || '旧照片、褪色车票、未接来电、行李箱';
  const newTheme = analysisData.suggestedNewThemes?.[0] || '和过去的遗憾温柔告别，在时光深处学会释怀与前行';

  return `请基于《${title}》（曲风: ${genre}，情绪: ${moods}）提取的音乐 DNA 与【顶级作词大师文学工程学（林夕/李宗盛/黄伟文/姚若龙级别）】创作一首全新的华语流行金曲：

【1. 创作主题与受众定位】：围绕“${newTheme}”展开。叙事方式采用第一人称书信/深夜自省口吻，针对 25-40 岁男女听众在异乡奋斗、现实落差或情感体面告别中的内心隐痛，前 10 秒内迅速明确人物处境与矛盾冲突。
【2. 反俗套与微观写实镜头】：主歌起笔严禁出现“街头、影子、黄昏、咖啡、路灯、眼泪、伤痛、孤独”等陈腐空泛词汇！必须从真实可触碰的生活物件与动作切入（如：${metaphors}、行李箱滚轮碾过石子路的声音、泛黄的铝饭盒、洗到脱线的旧工装、玄关忘了收起的旧雨伞、未曾按下的拨号键等）。
【3. 副歌爆款金句哲学】：副歌前两句必须是朋友圈转发级、15-30秒短视频切片级的哲理金句（如“原来成长不是学会告别，而是学会和遗憾并肩”），好懂、好记、直击痛点，利于翻唱传播。
【4. 十三辙与发声声学工程】：
  - 主歌采用中闭口韵，配合【低位胸声+气声呢喃】；
  - 导歌采用【中声区混声渡桥】；
  - 副歌高音爆发区优先采用宽音开口韵母（如发花辙、江阳辙、人辰辙、怀来辙等），利于歌手声带闭合与【高位置平衡混声爆发】；
  - 逐句标注声乐发声技巧与呼吸气口留白（主歌 7-11 字，副歌短促有力 4-9 字）。`;
};

const PROMPT_TEMPLATES = [
  {
    name: '《顶级作词大师模式》· 林夕/李宗盛级微观叙事',
    content:
      '请遵循【顶级作词家文学工程学】，创作一首直击25-40岁群体的华语慢速抒情金曲。叙事采用第一人称书信自省口吻。主歌用微观物件（洗到脱线的旧工装、未寄出的信、深夜的泡面蒸汽）铺陈真实生活冲突，严禁使用“街头、影子、黄昏、咖啡”等空泛词汇。副歌前两句打造朋友圈转发级短视频黄金金句，发声规划严格遵循十三辙押韵与低位气声到高位置平衡混声爆发。',
  },
  {
    name: '《我们终究是错过》· 25-40人群 / 伤感下沉',
    content:
      '请围绕“和过去的遗憾温柔告别”创作一首完整歌曲。叙事方式采用第一人称书信口吻，针对25-40岁男女性听众。先明确人物处境、关系变化或内心冲突，再推动情绪从遗憾、反复想起走向平静放下。表达口吻保持温柔、克制、适合慢歌。主歌用具体场景和生活微观细节铺陈故事，严禁出现“街头、影子、黄昏、咖啡”等空泛词汇。副歌围绕核心哲理金句自然展开，整体主题集中、情绪统一、利于翻唱传播。',
  },
  {
    name: '《晚风里的第三封信》· 七夕/秋季节点 · 治愈释怀',
    content:
      '创作一首适合七夕或秋季节点发行的慢速抒情华语金曲。以“收拾旧抽屉发现未寄出的信”为微观镜头切入，情绪由克制感伤到副歌的勇敢释怀。配器以大钢琴和指弹木吉他为主，发声规划包含低位气声呢喃到副歌平衡混声爆发。',
  },
  {
    name: '《在人海与你擦肩》· 都会流行 · 6415卡农和声',
    content:
      '以都会现代冷色调为基底，采用 6415 经典流行和弦走向。刻画都市男女在写字楼与地铁人海中的情感抉择，副歌包含抓耳的短视频金句 Hook，适合 15 秒黄金传播。',
  },
];

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
  // Studio Mode: '3column' (Master Creation Studio) vs 'leadsheet' (Interactive Chords & Synth)
  const [studioView, setStudioView] = useState<'3column' | 'leadsheet'>('3column');

  // Column 1: DNA Source State
  const [isPlayingReferenceAudio, setIsPlayingReferenceAudio] = useState(false);
  const [referenceAudioTime, setReferenceAudioTime] = useState('0:00 / 3:02');
  const [customDnaBpm, setCustomDnaBpm] = useState(analysis.tempoBpm || 84);
  const [customDnaKey, setCustomDnaKey] = useState(analysis.musicalKey || 'G Major');
  const [isDnaSaved, setIsDnaSaved] = useState(false);

  // Column 2: Creation Engine State
  const [creationMode, setCreationMode] = useState<'theme' | 'existing_lyrics'>('theme');
  const [isInstrumentalOnly, setIsInstrumentalOnly] = useState(false);
  const [creationPromptText, setCreationPromptText] = useState(PROMPT_TEMPLATES[0].content);
  const [imitationIntensity, setImitationIntensity] = useState<'light' | 'medium' | 'exact'>('exact');
  const [newSongTitle, setNewSongTitle] = useState('我们终究是错过');

  // Lyric Structure Alignment State
  const [refLyricsText, setRefLyricsText] = useState(DEFAULT_REFERENCE_LYRICS);
  const [isParsingStructure, setIsParsingStructure] = useState(false);
  const [parsedStructureData, setParsedStructureData] = useState<LyricComparisonData>(() =>
    parseLyricsClientSide(DEFAULT_REFERENCE_LYRICS)
  );

  // Column 2 Bottom: Suno Prompt State
  const [sunoStylePrompt, setSunoStylePrompt] = useState(
    'mandopop ballad, grand piano, fingerstyle acoustic guitar, solo cello, warm intimate male vocal, 84 bpm, emotional, bittersweet, cinematic'
  );
  const [sunoNegativePrompt, setSunoNegativePrompt] = useState(
    'no auto-tune, no heavy rock, no EDM drop, no shouting, no harsh synth'
  );
  const [sunoWeight, setSunoWeight] = useState(85);
  const [sunoRandomness, setSunoRandomness] = useState(25);
  const [sunoVocalType, setSunoVocalType] = useState('Clear youth female solo, airy intimate delivery');

  // Copy & Notice States
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [showSunoModal, setShowSunoModal] = useState(false);

  // Lead Sheet / Audio Hook Synth States
  const [isPlayingHook, setIsPlayingHook] = useState(false);
  const [activeNoteIdx, setActiveNoteIdx] = useState<number | null>(null);
  const [playingChordSection, setPlayingChordSection] = useState<number | null>(null);

  // Rhyme Polish Modal State
  const [polishLine, setPolishLine] = useState('');
  const [polishOptions, setPolishOptions] = useState<string[]>([]);
  const [isPolishing, setIsPolishing] = useState(false);
  const [showPolishModal, setShowPolishModal] = useState(false);

  // Sync state automatically when analysis (DNA source) changes
  useEffect(() => {
    if (analysis) {
      if (analysis.tempoBpm) setCustomDnaBpm(analysis.tempoBpm);
      if (analysis.musicalKey) setCustomDnaKey(analysis.musicalKey);
      
      // Auto-populate Top Lyricist Master Prompt
      const dynamicPrompt = buildLyricistSkillPrompt(analysis);
      setCreationPromptText(dynamicPrompt);

      // Auto-populate new song title
      if (analysis.suggestedNewThemes?.[0]) {
        const cleaned = analysis.suggestedNewThemes[0].split(/[，,:：]/)[0].trim();
        setNewSongTitle(cleaned.length > 1 ? cleaned : `新歌·${analysis.songTitle}`);
      } else if (analysis.songTitle) {
        setNewSongTitle(`新歌·${analysis.songTitle}`);
      }

      // Auto-populate Suno style prompt from extracted DNA
      const instruments = analysis.arrangementInstruments?.slice(0, 4).join(', ') || 'grand piano, acoustic guitar, cello';
      const genre = analysis.genre?.toLowerCase() || 'mandopop ballad';
      const bpm = analysis.tempoBpm || 84;
      const key = analysis.musicalKey || 'G Major';
      setSunoStylePrompt(`${genre}, ${instruments}, warm intimate male/female vocal, ${bpm} bpm, ${key}, emotional, bittersweet, cinematic`);
    }
  }, [analysis.songTitle, analysis.genre, analysis.tempoBpm, analysis.musicalKey]);

  // Sync blueprint data when generated
  useEffect(() => {
    if (blueprint) {
      if (blueprint.title) setNewSongTitle(blueprint.title);
      const params = blueprint.aiMusicPrompt?.sunoParameters;
      if (params?.styleTags || blueprint.aiMusicPrompt?.sunoPrompt) {
        setSunoStylePrompt(params?.styleTags || blueprint.aiMusicPrompt?.sunoPrompt || sunoStylePrompt);
      }
      if (params?.vocalSettings) {
        setSunoVocalType(params.vocalSettings);
      }
      if (params?.negativePrompt) {
        setSunoNegativePrompt(params.negativePrompt);
      }
    }
  }, [blueprint]);

  // Recalculate parsed structure whenever refLyricsText changes
  const handleLyricsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setRefLyricsText(text);
    setParsedStructureData(parseLyricsClientSide(text));
  };

  // AI Auto-Tag Structure
  const handleAiAutoStructure = async () => {
    setIsParsingStructure(true);
    try {
      const res = await fetch('/api/parse-lyric-structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawLyrics: refLyricsText,
          targetSongTitle: analysis.songTitle,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setParsedStructureData(data.data);
          if (data.data.formattedLyricsWithTags) {
            setRefLyricsText(data.data.formattedLyricsWithTags);
          }
        }
      }
    } catch (err) {
      console.error('Error auto-structuring lyrics:', err);
    } finally {
      setIsParsingStructure(false);
    }
  };

  // Master Submission Trigger
  const handleLaunchEngine = () => {
    onGenerateBlueprint({
      imitationLevel: imitationIntensity,
      newTitle: newSongTitle,
      newThemeTopic: creationPromptText,
      targetMood: '伤感下沉 / 释怀治愈 / 留存率与金句对标',
      desiredKey: customDnaKey,
      tempoAdjustment: customDnaBpm,
      language: '中文',
      referenceLyricsStructure: parsedStructureData,
      isInstrumentalOnly,
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
      customDnaBpm,
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
    playChordProgression(chords, customDnaBpm, undefined, () => setPlayingChordSection(null));
  };

  const handleExportMidi = () => {
    if (!blueprint) return;
    downloadMidiFile(blueprint, customDnaBpm);
  };

  // Compile formatted Suno prompt suite
  const compileFullSunoSuite = () => {
    let lyricsBody = '';
    if (blueprint?.structuralBlueprint) {
      blueprint.structuralBlueprint.forEach((sec) => {
        lyricsBody += `[${sec.sectionName} - ${sec.vocalPlacement || 'Emotional Belt'}]\n`;
        sec.lines?.forEach((l) => {
          lyricsBody += `${l.lineText}\n`;
        });
        lyricsBody += '\n';
      });
    } else {
      lyricsBody = refLyricsText;
    }

    return `[Suno AI Custom Mode 黄金配方]\n\n【Title】: ${newSongTitle || blueprint?.title || '我们终究是错过'}\n\n【Style of Music】:\n${sunoStylePrompt}\n\n【Style Weight】: ${sunoWeight}%\n【Randomness】: ${sunoRandomness}%\n【Exclude Styles】:\n${sunoNegativePrompt}\n\n【Lyrics with Metatags】:\n${lyricsBody.trim()}`;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Workflow Tabs Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl gap-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <span>国际金曲 3-栏商业创作台 (Master Imitation Studio)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                PRD v3.0 对齐
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              基于原曲《{analysis.songTitle}》DNA 提取、歌词曲式字数对标与 Suno 提示词方案
            </p>
          </div>
        </div>

        {/* View Switcher: 3-Column Creation vs Lead Sheet & MIDI */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setStudioView('3column')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
              studioView === '3column'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>3-栏全流程创作台</span>
          </button>
          <button
            type="button"
            onClick={() => setStudioView('leadsheet')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
              studioView === 'leadsheet'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>互动总谱 & MIDI 试听</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: 3-COLUMN CREATION STUDIO (Matching User Image) */}
      {studioView === '3column' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* ========================================================= */}
          {/* COLUMN 1: 01 DNA 提取源 (可选) (3 Columns on XL) */}
          {/* ========================================================= */}
          <div className="xl:col-span-3 space-y-4">
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-5 shadow-xl">
              {/* Header Step Badge */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 font-mono font-bold text-xs flex items-center justify-center border border-amber-500/30">
                    01
                  </span>
                  <span className="font-bold text-sm text-slate-100">DNA 提取源 (可选)</span>
                </div>
              </div>

              {/* Reference Audio Player Bar */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/90 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-200 truncate">
                      {analysis.artist} - {analysis.songTitle}
                    </div>
                    <div className="text-[10px] text-slate-500">参考标杆参考音源</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPlayingReferenceAudio(!isPlayingReferenceAudio)}
                    className="p-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all cursor-pointer shadow-md"
                    title={isPlayingReferenceAudio ? '暂停播放' : '试听原曲'}
                  >
                    {isPlayingReferenceAudio ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                  </button>
                </div>

                {/* Soundwave Simulation Bar */}
                <div className="flex items-center space-x-1 h-4 bg-slate-900 px-2 rounded-md border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 mr-1">{referenceAudioTime}</div>
                  <div className="flex-1 flex items-center justify-center space-x-0.5">
                    {[40, 70, 30, 90, 60, 80, 50, 95, 45, 65, 85, 35, 75, 55, 90, 60].map((h, i) => (
                      <span
                        key={i}
                        className={`w-1 rounded-full transition-all ${
                          isPlayingReferenceAudio ? 'bg-amber-400 animate-pulse' : 'bg-slate-700'
                        }`}
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* DNA Tags & Action */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-slate-200">已提取 DNA</span>
                    <span className="text-[10px] text-amber-400/80 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                      TIP: 点击 DNA 标签，可自由选择对标
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDnaSaved(true);
                      setTimeout(() => setIsDnaSaved(false), 2000);
                    }}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1 cursor-pointer"
                  >
                    {isDnaSaved ? <Check className="w-3 h-3 text-emerald-400" /> : <Edit3 className="w-3 h-3" />}
                    <span>{isDnaSaved ? '已保存修改' : '保存 DNA 修改'}</span>
                  </button>
                </div>

                {/* Section 1: 核心属性 */}
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                  <div className="text-[11px] font-bold text-amber-400/90 border-b border-slate-800/60 pb-1">
                    核心属性
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-300">
                    <div>
                      <span className="text-slate-500 block text-[10px]">速度 (BPM):</span>
                      <input
                        type="number"
                        value={customDnaBpm}
                        onChange={(e) => setCustomDnaBpm(Number(e.target.value))}
                        className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-xs text-amber-300 font-mono w-full mt-0.5"
                      />
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">调性 (Key):</span>
                      <input
                        type="text"
                        value={customDnaKey}
                        onChange={(e) => setCustomDnaKey(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-xs text-indigo-300 font-mono w-full mt-0.5"
                      />
                    </div>
                  </div>
                  <div className="pt-1">
                    <span className="text-slate-500 block text-[10px]">主风格 / 细分风格:</span>
                    <span className="text-slate-200 font-medium text-[11px]">
                      {analysis.genre || '华语流行'} / 慢速伤感抒情 Ballad
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">情绪标签:</span>
                    <span className="text-slate-300 text-[11px]">
                      {analysis.vibeMood?.join(', ') || '浪漫, 深情, 淡淡遗憾, 渴望'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">能量 / 张力:</span>
                    <span className="text-slate-400 text-[11px]">
                      中等能量，主歌克制压抑，副歌平衡混声情感爆发
                    </span>
                  </div>
                </div>

                {/* Section 2: 演唱与配器 */}
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                  <div className="text-[11px] font-bold text-indigo-400/90 border-b border-slate-800/60 pb-1">
                    演唱与配器
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">配器 / 乐器:</span>
                    <span className="text-slate-300 text-[11px]">
                      {analysis.arrangementInstruments?.slice(0, 4).join(', ') ||
                        '立式钢琴, 指弹木吉他, 独奏大提琴, 轻柔沙锤'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">人声风格:</span>
                    <span className="text-slate-300 text-[11px]">
                      主歌为清澈带气声的亲密诉说，副歌过渡到饱满平衡混声
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">人声角色:</span>
                    <span className="text-slate-300 text-[11px]">清澈深情男女声独唱 (可自定义)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">音域跨度:</span>
                    <span className="text-amber-300 text-[11px] font-mono">
                      1.5 个八度 (C4-G5)，极佳 KTV 与短视频翻唱度
                    </span>
                  </div>
                </div>

                {/* Actions: Re-analyze / Change song */}
                <div className="flex items-center space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={handleLaunchEngine}
                    className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>重新提取 DNA</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* COLUMN 2: 02 创意生成核心 (5 Columns on XL) */}
          {/* ========================================================= */}
          <div className="xl:col-span-5 space-y-4">
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-5 shadow-xl">
              {/* Header Step Badge & Mode Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 font-mono font-bold text-xs flex items-center justify-center border border-amber-500/30">
                    02
                  </span>
                  <span className="font-bold text-sm text-slate-100">创意生成核心</span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
                    <button
                      type="button"
                      onClick={() => setCreationMode('theme')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        creationMode === 'theme' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                      }`}
                    >
                      主题创作
                    </button>
                    <button
                      type="button"
                      onClick={() => setCreationMode('existing_lyrics')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        creationMode === 'existing_lyrics' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                      }`}
                    >
                      已有歌词
                    </button>
                  </div>

                  <label className="flex items-center space-x-1 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInstrumentalOnly}
                      onChange={(e) => setIsInstrumentalOnly(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-0"
                    />
                    <span>纯音乐</span>
                  </label>
                </div>
              </div>

              {/* Form Input: 创作需求 (Prompt Textarea & Templates) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      <span>创作需求 (Prompt Concept)</span>
                    </label>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center space-x-1">
                      <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
                      <span>已启用顶级作词大师模式</span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setCreationPromptText(buildLyricistSkillPrompt(analysis))}
                      className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center space-x-1 cursor-pointer bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      <span>重新提取 DNA 提示词</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCreationPromptText('')}
                      className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center space-x-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                      <span>清空</span>
                    </button>
                  </div>
                </div>

                <textarea
                  rows={5}
                  value={creationPromptText}
                  onChange={(e) => setCreationPromptText(e.target.value)}
                  placeholder="请输入或调整你的创作需求..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-slate-200 placeholder-slate-600 text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-amber-500 custom-scrollbar"
                />

                {/* Quick Templates Selector */}
                <div className="space-y-1 pt-1">
                  <div className="text-[10px] text-slate-500 font-semibold flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>快捷灵感模版 (点击快速载入):</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {PROMPT_TEMPLATES.map((tmpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setCreationPromptText(tmpl.content);
                          if (idx === 0) setNewSongTitle('我们终究是错过');
                          else if (idx === 1) setNewSongTitle('晚风里的第三封信');
                          else if (idx === 2) setNewSongTitle('在人海与你擦肩');
                        }}
                        className="text-[10px] px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 transition-all cursor-pointer truncate max-w-full"
                      >
                        {tmpl.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ========================================================= */}
              {/* CORE MODULE: 歌词结构对标 (Lyrics Structure Comparison) */}
              {/* ========================================================= */}
              <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center space-x-2">
                    <AlignLeft className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-slate-200">歌词结构对标</span>
                  </div>
                  <div className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {parsedStructureData.totalSections}段 · {parsedStructureData.totalLines}句
                  </div>
                </div>

                {/* Sub-split: Left Text Input + Right Structure Stats */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
                  {/* Left: Raw Lyrics Editor with Section Tags */}
                  <div className="md:col-span-7 flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">原曲对标歌词与段落标签:</span>
                    </div>
                    <textarea
                      rows={10}
                      value={refLyricsText}
                      onChange={handleLyricsChange}
                      placeholder="在此处输入原歌对标歌词或带[主歌][副歌]标签的内容..."
                      className="w-full flex-1 p-2.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-amber-500 text-slate-200 font-mono text-[11px] leading-relaxed focus:outline-none custom-scrollbar resize-y min-h-[160px]"
                    />

                    <div className="flex items-center justify-end space-x-2 pt-1">
                      <button
                        type="button"
                        onClick={handleAiAutoStructure}
                        disabled={isParsingStructure}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-[10px] font-semibold transition-all flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                      >
                        {isParsingStructure ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Sparkles className="w-3 h-3 text-indigo-300" />
                        )}
                        <span>AI 补结构</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setParsedStructureData(parseLyricsClientSide(refLyricsText))}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold transition-all flex items-center space-x-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>实时识别</span>
                      </button>
                    </div>
                  </div>

                  {/* Right: Structure Sections & Line Syllable Stats */}
                  <div className="md:col-span-5 bg-slate-900/90 p-3 rounded-lg border border-slate-800/80 flex flex-col space-y-2 max-h-[240px] overflow-y-auto custom-scrollbar">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-800 pb-1">
                      结构与字数统计看板
                    </span>

                    <div className="space-y-2">
                      {parsedStructureData.sections.map((sec, sIdx) => (
                        <div key={sIdx} className="bg-slate-950 p-2 rounded-md border border-slate-800/60 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-amber-300">{sec.sectionName}</span>
                            <span className="text-[10px] text-slate-500 font-mono">共 {sec.lineCount} 句</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono leading-relaxed">
                            {sec.lines.map((l) => (
                              <span key={l.lineIndex} className="inline-block mr-1.5 mb-0.5">
                                {l.lineIndex}句 <strong className="text-slate-200">{l.syllableCount}字</strong>
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}

                      {parsedStructureData.sections.length === 0 && (
                        <div className="text-center py-4 text-[10px] text-slate-500">
                          暂无结构标签，点击左下方【AI 补结构】自动生成
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Imitation Intensity Toggle */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">仿写精度模版</span>
                  <span className="text-[10px] text-amber-400">100% 结构小节字数对齐</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['light', 'medium', 'exact'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setImitationIntensity(lvl)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer text-xs ${
                        imitationIntensity === lvl
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      {lvl === 'exact' ? '1:1 严格对标' : lvl === 'medium' ? '中度均衡' : '轻度拓展'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons: 启动 DNA 创作引擎 + 刷新提示词方案 */}
              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={handleLaunchEngine}
                  disabled={isGenerating}
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>正在全速生成《{newSongTitle}》...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-current" />
                      <span>启动 DNA 创作引擎 ⚡</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const prompt = `mandopop ballad, ${analysis.arrangementInstruments?.slice(0, 3).join(', ') || 'piano, acoustic guitar, cello'}, ${sunoVocalType}, ${customDnaBpm} bpm, emotional, bittersweet, cinematic`;
                    setSunoStylePrompt(prompt);
                    handleCopyText(prompt, 'quickStyle');
                  }}
                  className="px-3.5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer"
                  title="重新计算并生成 Suno 格式化 Style 提示词"
                >
                  <RefreshCw className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">刷新提示词</span>
                </button>
              </div>

              {/* Suno 提示词 Card */}
              <div className="rounded-xl bg-slate-950 border border-slate-800/90 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs font-bold text-slate-200">SUNO 提示词 (Style of Music)</span>
                    <span className="text-[10px] text-amber-400/80 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                      TIP: 支持自定义编辑
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyText(sunoStylePrompt, 'sunoStyle')}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1 cursor-pointer"
                  >
                    {copiedType === 'sunoStyle' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedType === 'sunoStyle' ? '已复制' : '复制'}</span>
                  </button>
                </div>

                <textarea
                  rows={3}
                  value={sunoStylePrompt}
                  onChange={(e) => setSunoStylePrompt(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-amber-300 font-mono text-[11px] leading-relaxed focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* COLUMN 3: 03 歌词创作方案 (4 Columns on XL) */}
          {/* ========================================================= */}
          <div className="xl:col-span-4 space-y-4">
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-xl flex flex-col h-full justify-between">
              <div>
                {/* Header Step Badge & Actions */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 font-mono font-bold text-xs flex items-center justify-center border border-amber-500/30">
                      03
                    </span>
                    <span className="font-bold text-sm text-slate-100">歌词创作方案</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleLaunchEngine}
                      disabled={isGenerating}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 text-xs transition-all cursor-pointer"
                      title="重新生成歌词"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyText(compileFullSunoSuite(), 'blueprintLyrics')}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all flex items-center space-x-1 cursor-pointer"
                    >
                      {copiedType === 'blueprintLyrics' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedType === 'blueprintLyrics' ? '已复制' : '复制歌词'}</span>
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 mt-2">
                  💡 点击分隔线加号插入新内容，选中歌词片段可重写选区
                </p>

                {/* Structured Lyrics Content Viewer */}
                <div className="space-y-3 mt-3 max-h-[580px] overflow-y-auto custom-scrollbar pr-1">
                  {blueprint ? (
                    // Display Generated Blueprint Sections
                    blueprint.structuralBlueprint?.map((sec, sIdx) => (
                      <div key={sIdx} className="space-y-2">
                        {/* Section Tag with Metatag info */}
                        <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-xs font-mono border border-amber-500/30">
                              [{sec.sectionName}]
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono truncate">
                              {sec.vocalPlacement || '气声叙事'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            和弦: {sec.chordsUsed?.slice(0, 3).join(' ')}
                          </span>
                        </div>

                        {/* Lyrics lines */}
                        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 space-y-1.5 font-sans">
                          {sec.lines?.map((line, lIdx) => (
                            <div
                              key={lIdx}
                              className="group flex items-center justify-between text-xs py-1 px-1.5 rounded hover:bg-slate-800/40 transition-colors"
                            >
                              <div className="text-slate-200 font-medium">
                                <span>{line.lineText}</span>
                                {line.rhymeTag && (
                                  <span className="ml-2 text-[10px] text-slate-500 font-mono">
                                    [{line.rhymeTag}]
                                  </span>
                                )}
                              </div>
                              <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPolishLine(line.lineText);
                                    setShowPolishModal(true);
                                  }}
                                  className="text-[10px] text-amber-400 hover:text-amber-300 px-1 py-0.5 rounded bg-slate-800"
                                >
                                  润色
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Plus insert line divider */}
                        <div className="flex items-center justify-center my-1">
                          <button
                            type="button"
                            className="w-5 h-5 rounded-full bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-400 flex items-center justify-center text-xs transition-all cursor-pointer shadow-sm"
                            title="在此处插入自定义段落或过渡句"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    // Display Default / Pre-generation Structure Template
                    parsedStructureData.sections.map((sec, sIdx) => (
                      <div key={sIdx} className="space-y-2">
                        <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-xs font-mono border border-amber-500/30">
                              {sec.tag}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {sec.sectionName === '前奏'
                                ? 'Atmospheric synth opening, clear breathy'
                                : sec.sectionName === '主歌'
                                ? 'Intimate breathy chest voice'
                                : sec.sectionName === '导歌'
                                ? 'Steady drive, vocal progression'
                                : sec.sectionName === '副歌'
                                ? 'Dense synth-pop, balanced mixed voice'
                                : 'Dramatic climax'}
                            </span>
                          </div>
                        </div>

                        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 space-y-1.5 font-sans">
                          {sec.lines.map((line, lIdx) => (
                            <div
                              key={lIdx}
                              className="group flex items-center justify-between text-xs py-1 px-1.5 rounded hover:bg-slate-800/40"
                            >
                              <div className="text-slate-200 font-medium">
                                <span>{line.text}</span>
                                <span className="ml-2 text-[10px] text-slate-500 font-mono">
                                  ({line.syllableCount}字)
                                </span>
                              </div>
                              <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPolishLine(line.text);
                                    setShowPolishModal(true);
                                  }}
                                  className="text-[10px] text-amber-400 hover:text-amber-300 px-1 py-0.5 rounded bg-slate-800"
                                >
                                  润色
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-center my-1">
                          <button
                            type="button"
                            className="w-5 h-5 rounded-full bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-400 flex items-center justify-center text-xs transition-all cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Bottom Big Action: 「立即在 SUNO 中创作」 */}
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    const fullConfig = compileFullSunoSuite();
                    handleCopyText(fullConfig, 'sunoLaunch');
                    setShowSunoModal(true);
                  }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>立即在 SUNO 中创作</span>
                  <ExternalLink className="w-4 h-4 stroke-[2.5]" />
                </button>
                <p className="text-[10px] text-slate-400 text-center">
                  点击将自动打包复制 Style Prompt、元标签结构歌词与防跑偏参数
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: INTERACTIVE LEAD SHEET & SYNTHESIS AUDIO (彈唱和弦總譜 & MIDI 導出) */}
      {studioView === 'leadsheet' && (
        <div className="space-y-6">
          {blueprint ? (
            <div className="space-y-6">
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
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer"
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
                          className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1 self-start sm:self-auto cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>试听此段和弦</span>
                        </button>
                      </div>

                      {/* Lines with Chords overlay */}
                      <div className="space-y-4 font-mono">
                        {section.lines?.map((line, lIdx) => (
                          <div
                            key={lIdx}
                            className="group relative bg-slate-900/50 p-3 rounded-lg border border-slate-800/50 hover:border-slate-700"
                          >
                            <div className="text-amber-400 font-bold text-xs tracking-wider">
                              {line.chords || 'C'}
                            </div>
                            <div className="text-slate-100 font-sans text-sm sm:text-base font-medium mt-1">
                              {line.lineText}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-12 text-center space-y-4">
              <Sparkles className="w-12 h-12 text-amber-400 mx-auto opacity-60" />
              <h3 className="text-lg font-bold text-slate-200">尚未生成原创歌曲 Blueprint</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                请先在「3-栏全流程创作台」中点击【启动 DNA 创作引擎 ⚡】，生成后即可在此试听互动和弦、钢琴 Hook 旋律与导出 MIDI。
              </p>
              <button
                type="button"
                onClick={() => setStudioView('3column')}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all cursor-pointer inline-flex items-center space-x-2"
              >
                <span>前往 3-栏创作台生成</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Polish Modal */}
      {showPolishModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-slate-100 text-sm flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span>歌词润色与押韵助手</span>
              </h4>
              <button
                onClick={() => setShowPolishModal(false)}
                className="text-slate-500 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-xs text-slate-400">当前句:</span>
              <input
                type="text"
                value={polishLine}
                onChange={(e) => setPolishLine(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              onClick={async () => {
                if (!polishLine.trim()) return;
                setIsPolishing(true);
                try {
                  const res = await fetch('/api/rhyme-helper', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ line: polishLine, targetRhyme: '流畅押韵', style: '伤感下沉' }),
                  });
                  const data = await res.json();
                  setPolishOptions(data.options || []);
                } catch (e) {
                  console.error(e);
                } finally {
                  setIsPolishing(false);
                }
              }}
              disabled={isPolishing}
              className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              {isPolishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>获取 AI 高阶填词建议</span>
            </button>

            {polishOptions.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-semibold text-slate-300">润色候选建议:</span>
                <div className="space-y-1.5">
                  {polishOptions.map((opt, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        handleCopyText(opt, `opt-${idx}`);
                      }}
                      className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <span>{opt}</span>
                      <span className="text-[10px] text-amber-400">点击复制</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Suno Suite Export Modal */}
      {showSunoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <ExternalLink className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-100 text-base">Suno AI 全套创作配方已准备就绪</h4>
                  <p className="text-xs text-slate-400">已自动复制到剪贴板，可直接前往 Suno Custom 模式使用</p>
                </div>
              </div>
              <button
                onClick={() => setShowSunoModal(false)}
                className="text-slate-500 hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                <span className="font-bold text-amber-400 block">Suno 填入步骤指南:</span>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
                  <li>打开 Suno.com，开启 **Custom (自定义模式)** 开关。</li>
                  <li>将 **Style of Music** 粘贴到风格框中。</li>
                  <li>将 **Lyrics with Metatags** 粘贴到歌词框中。</li>
                  <li>将 **Title** 设为 《{newSongTitle || '我们终究是错过'}》。</li>
                  <li>点击 **Create**，即可收获殿堂级华语金曲小样！</li>
                </ol>
              </div>

              <textarea
                readOnly
                rows={8}
                value={compileFullSunoSuite()}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed custom-scrollbar"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(compileFullSunoSuite());
                  setCopiedType('modalFull');
                  setTimeout(() => setCopiedType(null), 2000);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                {copiedType === 'modalFull' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedType === 'modalFull' ? '已再次复制' : '再次复制全套'}</span>
              </button>

              <a
                href="https://suno.com"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <span>直达 Suno.com 创作 ↗</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
