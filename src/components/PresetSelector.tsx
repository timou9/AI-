import React from 'react';
import { PRESET_SONGS } from '../data/presets';
import { PresetSong, SongAnalysisResult } from '../types';
import { Sparkles, Play, Music2, Search, ArrowRight, Guitar } from 'lucide-react';

interface PresetSelectorProps {
  onSelectPreset: (preset: PresetSong) => void;
  onGoCustom: () => void;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({ onSelectPreset, onGoCustom }) => {
  return (
    <div className="space-y-8 py-4">
      {/* Banner Intro */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800/80 p-6 sm:p-8 shadow-xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>专业音乐制作人 AI 辅助工具</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight leading-snug">
            解构金曲和声与律动 DNA，<br className="hidden sm:block" />
            一键创作属于你的同风格爆款新歌
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            选择经典示范歌曲直接查看深度乐理拆解（曲式结构、4536251和声走向、弱起切分旋律与歌词意象），或输入任意你喜爱的歌曲，让 AI 为你定制 1:1 风格仿写 Blueprint！
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={onGoCustom}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span>分析自定义歌曲或粘贴歌词</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preset Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <Music2 className="w-5 h-5 text-amber-400" />
            <span>精选金曲分析示范 (Click to Explore & Imitate)</span>
          </h3>
          <span className="text-xs text-slate-400">预设即时加载 · 免等待</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PRESET_SONGS.map((preset) => (
            <div
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className="group relative rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 p-5 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header Badge & Key */}
                <div className="flex items-start justify-between">
                  <div className={`px-2.5 py-1 rounded-lg bg-gradient-to-r ${preset.coverGradient} border border-slate-700/50 text-xs font-semibold text-slate-200`}>
                    {preset.genre}
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                      {preset.key}
                    </span>
                    <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                      BPM {preset.bpm}
                    </span>
                  </div>
                </div>

                {/* Title & Artist */}
                <div>
                  <h4 className="text-xl font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                    {preset.title}
                  </h4>
                  <p className="text-sm text-slate-400 mt-0.5">{preset.artist}</p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {preset.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-slate-800/80 text-[11px] text-slate-300 border border-slate-700/50"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Quick Highlights */}
                <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/60 space-y-1.5 text-xs text-slate-300">
                  <p className="line-clamp-2">
                    <span className="text-amber-400 font-semibold">仿写核心：</span>{' '}
                    {preset.analysis.goldenRulesForImitation[0]}
                  </p>
                </div>
              </div>

              {/* Card Footer Action */}
              <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between text-xs font-semibold text-amber-400 group-hover:text-amber-300">
                <span className="flex items-center space-x-1">
                  <Guitar className="w-4 h-4" />
                  <span>调取乐理拆解与仿写方案</span>
                </span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
