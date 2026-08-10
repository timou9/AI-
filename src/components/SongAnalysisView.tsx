import React, { useState, useEffect, useMemo } from 'react';
import { SongAnalysisResult, AnnotatedLyricLine } from '../types';
import { playChord, playChordProgression, stopChordProgression } from '../lib/audioSynth';
import {
  Sparkles,
  Music,
  Activity,
  Layers,
  BookOpen,
  Guitar,
  Volume2,
  Play,
  Square,
  Wand2,
  CheckCircle2,
  Quote,
  Sliders,
  ChevronRight,
  Disc,
  Tag,
  RotateCcw,
  Edit2,
  Plus,
  Trash2,
  Filter,
  Check,
  Heart,
  Flame,
  Zap,
  Smile
} from 'lucide-react';

const DEFAULT_PRESET_EMOTIONS = [
  '伤感', '励志', '愤怒', '怀旧', '甜蜜', '迷茫', '释怀', '期待', '默默守护', '狂热', '执念', '心碎'
];

export const getEmotionStyle = (tag: string) => {
  const normalized = (tag || '').toLowerCase();
  if (['伤感', '心碎', '苦涩', '哀伤', '悲伤', 'sadness', 'grief'].some(k => normalized.includes(k))) {
    return {
      badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40 hover:bg-sky-500/30',
      barBg: 'bg-sky-400',
      icon: '💧',
      label: '伤感 (Sadness)'
    };
  }
  if (['励志', '坚毅', '拼搏', '燃点', '希望', 'inspirational', 'hope'].some(k => normalized.includes(k))) {
    return {
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30',
      barBg: 'bg-emerald-400',
      icon: '🔥',
      label: '励志 (Inspirational)'
    };
  }
  if (['愤怒', '宣泄', '咆哮', '怒火', '不平', 'anger', 'rage'].some(k => normalized.includes(k))) {
    return {
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30',
      barBg: 'bg-rose-500',
      icon: '⚡',
      label: '愤怒 (Anger)'
    };
  }
  if (['怀旧', '回忆', '青春', '童年', '留恋', 'nostalgia'].some(k => normalized.includes(k))) {
    return {
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30',
      barBg: 'bg-amber-400',
      icon: '🌅',
      label: '怀旧 (Nostalgia)'
    };
  }
  if (['甜蜜', '告白', '温暖', '深情', '浪漫', '默默守护', '依赖', 'sweet', 'love'].some(k => normalized.includes(k))) {
    return {
      badge: 'bg-pink-500/20 text-pink-300 border-pink-500/40 hover:bg-pink-500/30',
      barBg: 'bg-pink-400',
      icon: '💕',
      label: '甜蜜 (Sweet)'
    };
  }
  if (['迷茫', '纠结', '不安', '压抑', '试探', 'confused'].some(k => normalized.includes(k))) {
    return {
      badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30',
      barBg: 'bg-purple-400',
      icon: '🌫️',
      label: '迷茫 (Confused)'
    };
  }
  if (['释怀', '沉淀', '坦然', '祝福', 'relieved'].some(k => normalized.includes(k))) {
    return {
      badge: 'bg-teal-500/20 text-teal-300 border-teal-500/40 hover:bg-teal-500/30',
      barBg: 'bg-teal-400',
      icon: '🍃',
      label: '释怀 (Relieved)'
    };
  }
  if (['期待', '渴望', '执念', '狂热', 'longing', 'desire'].some(k => normalized.includes(k))) {
    return {
      badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 hover:bg-yellow-500/30',
      barBg: 'bg-yellow-400',
      icon: '✨',
      label: '期待/渴望 (Longing)'
    };
  }

  return {
    badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-500/30',
    barBg: 'bg-indigo-400',
    icon: '🏷️',
    label: tag
  };
};

const generateFallbackAnnotatedLyrics = (analysis: SongAnalysisResult): AnnotatedLyricLine[] => {
  const metaphors = analysis.lyricCrafting?.coreMetaphors || [];
  const title = analysis.songTitle || '歌曲';
  const vibe = analysis.vibeMood || [];

  return [
    {
      id: 'fb-1',
      section: 'Verse 1 主歌',
      lyricText: metaphors[0] ? `在旧日回忆里 ${metaphors[0]}` : `关于《${title}》的第一幕讲述`,
      emotionTag: vibe[0] || '怀旧',
      explanation: '主歌起笔引入关键意象，奠定情感基调'
    },
    {
      id: 'fb-2',
      section: 'Verse 1 主歌',
      lyricText: metaphors[1] ? `伴着风吹过 ${metaphors[1]}` : `安静铺陈故事里的细微心绪`,
      emotionTag: '迷茫',
      explanation: '细节展开，勾勒情绪隐秘起伏'
    },
    {
      id: 'fb-3',
      section: 'Pre-Chorus 导歌',
      lyricText: `试着伸出双手 却又悄悄缩回`,
      emotionTag: '期待',
      explanation: '导歌和声层层推进，酝酿爆发力量'
    },
    {
      id: 'fb-4',
      section: 'Chorus 副歌',
      lyricText: metaphors[2] ? `直到那一天 ${metaphors[2]}` : `《${title}》核心情感高潮爆发段落`,
      emotionTag: vibe[1] || '伤感',
      explanation: '副歌黄金级进处，情感重心彻底释放'
    },
    {
      id: 'fb-5',
      section: 'Chorus 副歌',
      lyricText: `还要走多久 才能找到属于我们的答案`,
      emotionTag: '渴望',
      explanation: '旋律最高点呐喊，倾诉内心执念'
    },
    {
      id: 'fb-6',
      section: 'Bridge 桥段',
      lyricText: `把未说出口的誓言 留在风里`,
      emotionTag: '愤怒',
      explanation: '桥段张力拉满，情感破茧而出'
    },
    {
      id: 'fb-7',
      section: 'Outro 尾声',
      lyricText: `面向远方 轻轻道一声珍重`,
      emotionTag: '释怀',
      explanation: '尾声余音袅袅，归于安宁与释怀'
    }
  ];
};

interface SongAnalysisViewProps {
  analysis: SongAnalysisResult;
  onStartImitation: () => void;
}

export const SongAnalysisView: React.FC<SongAnalysisViewProps> = ({ analysis, onStartImitation }) => {
  const [playingProgressionIndex, setPlayingProgressionIndex] = useState<number | null>(null);
  const [activeChordHighlight, setActiveChordHighlight] = useState<number | null>(null);

  // Annotated Lyrics Interactive State
  const [annotatedLyricsState, setAnnotatedLyricsState] = useState<AnnotatedLyricLine[]>(() => {
    if (analysis.lyricCrafting?.annotatedLyrics && analysis.lyricCrafting.annotatedLyrics.length > 0) {
      return analysis.lyricCrafting.annotatedLyrics;
    }
    return generateFallbackAnnotatedLyrics(analysis);
  });

  // Sync state if analysis prop changes
  useEffect(() => {
    if (analysis.lyricCrafting?.annotatedLyrics && analysis.lyricCrafting.annotatedLyrics.length > 0) {
      setAnnotatedLyricsState(analysis.lyricCrafting.annotatedLyrics);
    } else {
      setAnnotatedLyricsState(generateFallbackAnnotatedLyrics(analysis));
    }
  }, [analysis]);

  const [activeEmotionFilter, setActiveEmotionFilter] = useState<string | null>(null);
  const [editingLineId, setEditingLineId] = useState<string | null>(null);
  const [editingLineText, setEditingLineText] = useState<string>('');
  const [editingExplanationText, setEditingExplanationText] = useState<string>('');
  const [openPickerLineId, setOpenPickerLineId] = useState<string | null>(null);
  const [customTagInput, setCustomTagInput] = useState<string>('');

  // Emotion Statistics & Percentages
  const emotionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    annotatedLyricsState.forEach(l => {
      if (l.emotionTag) {
        counts[l.emotionTag] = (counts[l.emotionTag] || 0) + 1;
      }
    });
    const total = annotatedLyricsState.length || 1;
    return Object.entries(counts).map(([tag, count]) => ({
      tag,
      count,
      percentage: Math.round((count / total) * 100),
      style: getEmotionStyle(tag)
    })).sort((a, b) => b.count - a.count);
  }, [annotatedLyricsState]);

  // Handlers for Lyrics Emotion Tweak
  const handleUpdateEmotionTag = (lineId: string, newTag: string) => {
    setAnnotatedLyricsState(prev => prev.map(line => line.id === lineId ? { ...line, emotionTag: newTag } : line));
    setOpenPickerLineId(null);
  };

  const handleApplyCustomTag = (lineId: string) => {
    if (!customTagInput.trim()) return;
    handleUpdateEmotionTag(lineId, customTagInput.trim());
    setCustomTagInput('');
  };

  const handleSaveLineEdit = (lineId: string) => {
    setAnnotatedLyricsState(prev => prev.map(line => line.id === lineId ? {
      ...line,
      lyricText: editingLineText,
      explanation: editingExplanationText
    } : line));
    setEditingLineId(null);
  };

  const handleStartEditLine = (line: AnnotatedLyricLine) => {
    setEditingLineId(line.id);
    setEditingLineText(line.lyricText);
    setEditingExplanationText(line.explanation || '');
  };

  const handleAddLyricLine = () => {
    const newLine: AnnotatedLyricLine = {
      id: `custom-${Date.now()}`,
      section: 'Chorus 副歌',
      lyricText: '在这里填入新的歌词单句...',
      emotionTag: '深情',
      explanation: '用户手动添加的情感解析标注'
    };
    setAnnotatedLyricsState(prev => [...prev, newLine]);
    handleStartEditLine(newLine);
  };

  const handleDeleteLyricLine = (lineId: string) => {
    setAnnotatedLyricsState(prev => prev.filter(line => line.id !== lineId));
  };

  const handleResetToDefault = () => {
    if (analysis.lyricCrafting?.annotatedLyrics && analysis.lyricCrafting.annotatedLyrics.length > 0) {
      setAnnotatedLyricsState(analysis.lyricCrafting.annotatedLyrics);
    } else {
      setAnnotatedLyricsState(generateFallbackAnnotatedLyrics(analysis));
    }
    setActiveEmotionFilter(null);
    setEditingLineId(null);
    setOpenPickerLineId(null);
  };

  const handlePlayProgression = (progIndex: number, chords: string[]) => {
    if (playingProgressionIndex === progIndex) {
      stopChordProgression();
      setPlayingProgressionIndex(null);
      setActiveChordHighlight(null);
      return;
    }

    setPlayingProgressionIndex(progIndex);
    playChordProgression(
      chords,
      analysis.tempoBpm || 84,
      (index) => setActiveChordHighlight(index),
      () => {
        setPlayingProgressionIndex(null);
        setActiveChordHighlight(null);
      }
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Header Hero Banner */}
      <div className="relative rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-bl from-amber-500/10 via-indigo-500/10 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center space-x-1">
                <Disc className="w-3.5 h-3.5" />
                <span>乐理 Blueprint 解构完成</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700">
                {analysis.genre}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight">
              《{analysis.songTitle}》
            </h1>

            <p className="text-base text-slate-300 font-medium">
              原唱 / 艺术家: <span className="text-amber-300">{analysis.artist || '经典作品'}</span>
            </p>

            {/* Vibe Tags */}
            <div className="flex flex-wrap gap-2 pt-1">
              {analysis.vibeMood?.map((vibe, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-200"
                >
                  #{vibe}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Musical Specs */}
          <div className="flex items-center gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 self-start md:self-auto">
            <div className="text-center px-3 border-r border-slate-800">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                主调性 Key
              </span>
              <span className="text-xl font-bold font-mono text-amber-400">
                {analysis.musicalKey}
              </span>
            </div>
            <div className="text-center px-3">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                速度 Tempo
              </span>
              <span className="text-xl font-bold font-mono text-indigo-400">
                {analysis.tempoBpm} <span className="text-xs font-normal text-slate-400">BPM</span>
              </span>
            </div>
          </div>
        </div>

        {/* CTA to Imitation */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-300">
            想写一首同调性、同情感张力与相同和声逻辑的新歌？
          </p>
          <button
            onClick={onStartImitation}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
          >
            <Wand2 className="w-4 h-4" />
            <span>一键基于此歌曲开启 AI 仿写创作</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Golden Rules for Imitation (5大仿写黄金法则 - Highlighted Focus) */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center space-x-2 border-b border-amber-500/20 pb-3">
          <Sparkles className="w-5 h-5 text-amber-400 animate-spin-slow" />
          <h2 className="text-lg font-bold text-amber-200">
            核心仿写公式 (5 Golden Rules for Songwriting Imitation)
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {analysis.goldenRulesForImitation?.map((rule, idx) => (
            <div
              key={idx}
              className="flex items-start space-x-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-sm text-slate-200 leading-relaxed"
            >
              <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                0{idx + 1}
              </div>
              <div>{rule}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Chord Progression Explorer (和声与弦进分析 + Web Audio 音效播放) */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <Guitar className="w-5 h-5 text-amber-400" />
            <span>和声走向与核心和弦分析 (Chord Progression Analysis)</span>
          </h2>
          <span className="text-xs text-slate-400 flex items-center space-x-1">
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            <span>点击和弦卡片可试听和音</span>
          </span>
        </div>

        <div className="space-y-6">
          {analysis.chordProgressions?.map((item, pIdx) => {
            const isPlayingThis = playingProgressionIndex === pIdx;
            return (
              <div
                key={pIdx}
                className="rounded-xl bg-slate-950 p-5 border border-slate-800 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-200 text-sm">{item.name}</h3>
                    <p className="text-xs text-amber-400/90 font-mono mt-0.5">
                      级进 (Roman): {item.romanNumerals}
                    </p>
                  </div>

                  <button
                    onClick={() => handlePlayProgression(pIdx, item.chords)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                      isPlayingThis
                        ? 'bg-rose-500 text-slate-950 shadow-lg shadow-rose-500/20'
                        : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {isPlayingThis ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>停止播放</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>试听此段和弦走向</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Chords Sequence Pills */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {item.chords?.map((chord, cIdx) => {
                    const isHighlighted = isPlayingThis && activeChordHighlight === cIdx;
                    return (
                      <button
                        key={cIdx}
                        onClick={() => playChord(chord)}
                        className={`px-4 py-2 rounded-xl font-mono text-sm font-bold transition-all transform active:scale-95 ${
                          isHighlighted
                            ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/50 scale-105 border-2 border-amber-300'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-amber-500/50'
                        }`}
                      >
                        {chord}
                      </button>
                    );
                  })}
                </div>

                {/* Emotional Effect */}
                <p className="text-xs text-slate-400 bg-slate-900/60 p-3 rounded-lg border border-slate-800/60">
                  <span className="text-slate-300 font-semibold">听感与心理效应：</span>
                  {item.emotionalEffect}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Song Structure & Energy Flow (曲式结构与能量起伏) */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            <span>曲式结构与能量图谱 (Structure & Energy Dynamics)</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {analysis.structure?.map((sec, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-3 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 text-sm">{sec.section}</span>
                <span className="text-xs text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {sec.bars} 小节
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{sec.function}</p>

              {/* Energy Meter */}
              <div className="space-y-1 pt-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>情绪能量值</span>
                  <span className="font-mono font-bold text-amber-400">{sec.energyLevel}/10</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-rose-500 to-amber-400 transition-all duration-500"
                    style={{ width: `${(sec.energyLevel / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Melody & Rhyme & Arrangement Dimensions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Melodic & Rhythmic DNA */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
          <h2 className="text-md font-bold text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Music className="w-5 h-5 text-rose-400" />
            <span>旋律与律动基因 (Melody & Rhythm)</span>
          </h2>

          <ul className="space-y-2.5">
            {analysis.melodicCharacteristics?.map((char, idx) => (
              <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{char}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Lyrical Craft & Rhyme */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
          <h2 className="text-md font-bold text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Quote className="w-5 h-5 text-amber-400" />
            <span>歌词作词工艺 (Lyric Craft & Rhymes)</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-semibold block mb-0.5">押韵模式 (Rhyme Scheme):</span>
              <span className="text-amber-300 font-mono">{analysis.lyricCrafting?.rhymeScheme}</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-semibold block mb-1">核心词汇与意象群:</span>
              <div className="flex flex-wrap gap-1.5">
                {analysis.lyricCrafting?.coreMetaphors?.map((met, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                    {met}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-semibold block mb-0.5">句式分布律动:</span>
              <span className="text-slate-300">{analysis.lyricCrafting?.sentenceStructure}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Original Lyrics Emotional Focus & Section Annotations (原歌词情绪重心与段落标注 + 用户手动微调) */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Tag className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-slate-100">
                原歌词情绪重心与段落标注 (Lyrics Emotional Focus & Annotations)
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              AI 自动按歌曲乐理与词作走向标注情绪重心，点击情绪彩色标签可<span className="text-amber-300 font-semibold">手动微调或自定义标签</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleResetToDefault}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer"
              title="还原为 AI 初始标注"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重置标注</span>
            </button>

            <button
              onClick={handleAddLyricLine}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>添加歌词行</span>
            </button>
          </div>
        </div>

        {/* Emotion Spectrum Distribution Bar */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>全曲情绪光谱比例 (Emotional Focus Spectrum)</span>
            </span>
            <span className="text-[11px] text-slate-400 font-normal">
              点击情绪标签可分类筛选歌词
            </span>
          </div>

          {/* Stacked Progress Bar */}
          <div className="w-full h-3 rounded-full bg-slate-900 border border-slate-800 flex overflow-hidden">
            {emotionCounts.map((item, idx) => (
              <div
                key={idx}
                className={`${item.style.barBg} h-full transition-all`}
                style={{ width: `${item.percentage}%` }}
                title={`${item.tag}: ${item.percentage}% (${item.count}句)`}
              />
            ))}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={() => setActiveEmotionFilter(null)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 cursor-pointer ${
                activeEmotionFilter === null
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Filter className="w-3 h-3" />
              <span>全部 ({annotatedLyricsState.length})</span>
            </button>

            {emotionCounts.map((item, idx) => {
              const isSelected = activeEmotionFilter === item.tag;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveEmotionFilter(isSelected ? null : item.tag)}
                  className={`px-2.5 py-1 rounded-lg text-xs border font-medium transition-all flex items-center space-x-1 cursor-pointer ${
                    isSelected
                      ? 'ring-2 ring-amber-400 font-bold scale-105 ' + item.style.badge
                      : item.style.badge
                  }`}
                >
                  <span>{item.style.icon}</span>
                  <span>{item.tag}</span>
                  <span className="opacity-70 text-[10px]">({item.count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Lyrics Annotated List */}
        <div className="space-y-3">
          {annotatedLyricsState
            .filter(line => !activeEmotionFilter || line.emotionTag === activeEmotionFilter)
            .map((line, index) => {
              const style = getEmotionStyle(line.emotionTag);
              const isEditing = editingLineId === line.id;
              const isPickerOpen = openPickerLineId === line.id;

              return (
                <div
                  key={line.id || index}
                  className="rounded-xl bg-slate-950/90 border border-slate-800/80 p-4 space-y-3 relative hover:border-slate-700 transition-all shadow-md group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-900 text-slate-400 border border-slate-800 font-mono text-xs">
                        {line.section || `段落 0${index + 1}`}
                      </span>

                      {/* Emotion Tag Badge with Manual Micro-tweak Trigger */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setOpenPickerLineId(isPickerOpen ? null : line.id)}
                          className={`px-3 py-1 rounded-lg border text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${style.badge}`}
                          title="点击手动微调/更换此句情绪标签"
                        >
                          <span>{style.icon}</span>
                          <span>{line.emotionTag}</span>
                          <Edit2 className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                        </button>

                        {/* Popover Emotion Picker Palette */}
                        {isPickerOpen && (
                          <div className="absolute left-0 top-full mt-2 z-30 w-72 p-3 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl space-y-3 animate-fadeIn">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 border-b border-slate-800 pb-1.5">
                              <span>点击微调此句情绪标签:</span>
                              <button
                                onClick={() => setOpenPickerLineId(null)}
                                className="text-slate-400 hover:text-slate-200 cursor-pointer"
                              >
                                ✕
                              </button>
                            </div>

                            {/* Preset Options Grid */}
                            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto custom-scrollbar">
                              {DEFAULT_PRESET_EMOTIONS.map((presetTag) => {
                                const presetStyle = getEmotionStyle(presetTag);
                                const isCurrent = line.emotionTag === presetTag;
                                return (
                                  <button
                                    key={presetTag}
                                    type="button"
                                    onClick={() => handleUpdateEmotionTag(line.id, presetTag)}
                                    className={`px-2 py-0.5 rounded-md text-[11px] border transition-all cursor-pointer flex items-center space-x-1 ${
                                      isCurrent ? 'ring-2 ring-amber-400 font-bold ' + presetStyle.badge : presetStyle.badge
                                    }`}
                                  >
                                    <span>{presetStyle.icon}</span>
                                    <span>{presetTag}</span>
                                  </button>
                                );
                              })}
                            </div>

                            {/* Custom Tag Input */}
                            <div className="pt-2 border-t border-slate-800 space-y-1.5">
                              <span className="text-[10px] text-slate-400 block font-medium">
                                ✍️ 输入自定义情绪标签:
                              </span>
                              <div className="flex items-center space-x-1.5">
                                <input
                                  type="text"
                                  value={customTagInput}
                                  onChange={(e) => setCustomTagInput(e.target.value)}
                                  placeholder="例如：执念 / 孤寂"
                                  className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleApplyCustomTag(line.id)}
                                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shrink-0 cursor-pointer"
                                >
                                  套用
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons (Edit / Delete) */}
                    <div className="flex items-center space-x-2 text-xs">
                      {isEditing ? (
                        <button
                          onClick={() => handleSaveLineEdit(line.id)}
                          className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg font-semibold flex items-center space-x-1 cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          <span>保存</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartEditLine(line)}
                          className="p-1 text-slate-400 hover:text-amber-300 rounded hover:bg-slate-900 transition-all cursor-pointer"
                          title="修改歌词文本或备注"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteLyricLine(line.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-900 transition-all cursor-pointer"
                        title="删除此行"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Lyric Text Render / Edit */}
                  {isEditing ? (
                    <div className="space-y-2 pt-1">
                      <input
                        type="text"
                        value={editingLineText}
                        onChange={(e) => setEditingLineText(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-amber-500 text-slate-100 text-sm font-semibold focus:outline-none"
                      />
                      <input
                        type="text"
                        value={editingExplanationText}
                        onChange={(e) => setEditingExplanationText(e.target.value)}
                        placeholder="关于此句情绪语气的解析备注..."
                        className="w-full px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs focus:outline-none"
                      />
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm sm:text-base font-bold text-slate-100 leading-relaxed tracking-wide">
                        “{line.lyricText}”
                      </p>
                      {line.explanation && (
                        <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
                          <span className="text-amber-400/80 font-semibold">情绪触点:</span>
                          <span>{line.explanation}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

          {annotatedLyricsState.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-xs">
              暂无标注歌词，点击右上角“添加歌词行”或“重置标注”。
            </div>
          )}
        </div>
      </div>

      {/* 6. Arrangement & Suggested Themes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Instruments */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
          <h2 className="text-md font-bold text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <span>核心编曲乐器调色盘 (Instruments)</span>
          </h2>

          <div className="flex flex-wrap gap-2">
            {analysis.arrangementInstruments?.map((inst, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-indigo-300 font-medium"
              >
                🎺 {inst}
              </span>
            ))}
          </div>
        </div>

        {/* Suggested Themes */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
          <h2 className="text-md font-bold text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-3">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <span>衍生仿写创意灵感 (Suggested New Topics)</span>
          </h2>

          <div className="space-y-2">
            {analysis.suggestedNewThemes?.map((theme, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-200 flex items-center space-x-2"
              >
                <span className="text-emerald-400 font-bold">💡</span>
                <span>{theme}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Floating Action Bar */}
      <div className="sticky bottom-6 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-amber-500/40 p-4 shadow-2xl flex items-center justify-between">
        <div className="hidden sm:block">
          <h3 className="text-sm font-bold text-slate-100">已解锁《{analysis.songTitle}》音乐基因库</h3>
          <p className="text-xs text-slate-400">点击右侧按钮立刻生成 1:1 同风格全新原创歌曲 Blueprint</p>
        </div>

        <button
          onClick={onStartImitation}
          className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center space-x-2"
        >
          <Wand2 className="w-4 h-4 text-slate-950" />
          <span>开始 AI 仿写原创创作</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
