import React, { useState, useMemo } from 'react';
import {
  MUSIC_PRODUCER_PRD_METADATA,
  PRD_SECTIONS,
  PRDSection,
} from '../data/musicProductionPRD';
import {
  FileText,
  Copy,
  Check,
  Download,
  Search,
  BookOpen,
  Sparkles,
  Music,
  Sliders,
  ShieldCheck,
  Code2,
  Layers,
  ArrowRight,
  ExternalLink,
  Bot,
  UserCheck,
  Disc,
  Users,
  Mic,
  ShieldAlert,
} from 'lucide-react';

interface MusicProducerPRDViewProps {
  onGoToImitation: () => void;
}

export const MusicProducerPRDView: React.FC<MusicProducerPRDViewProps> = ({
  onGoToImitation,
}) => {
  const [activeSectionId, setActiveSectionId] = useState<string>(PRD_SECTIONS[0].id);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter sections by search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return PRD_SECTIONS;
    const query = searchQuery.toLowerCase();
    return PRD_SECTIONS.filter(
      (sec) =>
        sec.title.toLowerCase().includes(query) ||
        sec.subtitle.toLowerCase().includes(query) ||
        sec.content.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const activeSection = useMemo(() => {
    const found = PRD_SECTIONS.find((sec) => sec.id === activeSectionId);
    return found || PRD_SECTIONS[0];
  }, [activeSectionId]);

  // Copy full document
  const handleCopyFullPRD = () => {
    const fullText = `# ${MUSIC_PRODUCER_PRD_METADATA.standardName}\n版本: ${MUSIC_PRODUCER_PRD_METADATA.version}\n更新日期: ${MUSIC_PRODUCER_PRD_METADATA.lastUpdated}\n适用对象: ${MUSIC_PRODUCER_PRD_METADATA.targetRoles.join(', ')}\n\n${PRD_SECTIONS.map((s) => `## ${s.title}\n${s.content}`).join('\n\n---\n\n')}`;
    navigator.clipboard.writeText(fullText);
    setCopiedId('full-prd');
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Copy single section
  const handleCopySection = (sec: PRDSection) => {
    const text = `## ${sec.title}\n${sec.subtitle}\n\n${sec.content}`;
    navigator.clipboard.writeText(text);
    setCopiedId(sec.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Download markdown file
  const handleDownloadMarkdown = () => {
    const fullText = `# ${MUSIC_PRODUCER_PRD_METADATA.standardName}\n\n> 版本: ${MUSIC_PRODUCER_PRD_METADATA.version} | 更新时间: ${MUSIC_PRODUCER_PRD_METADATA.lastUpdated}\n> 适用角色: ${MUSIC_PRODUCER_PRD_METADATA.targetRoles.join(' / ')}\n\n${PRD_SECTIONS.map((s) => `## ${s.title}\n\n${s.content}`).join('\n\n---\n\n')}`;
    const blob = new Blob([fullText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `华语流行金曲AI音乐创作与乐理需求规范_${MUSIC_PRODUCER_PRD_METADATA.version}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getSectionIcon = (category: string) => {
    switch (category) {
      case 'core':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'audience':
        return <Users className="w-4 h-4 text-emerald-400" />;
      case 'structure':
        return <Layers className="w-4 h-4 text-sky-400" />;
      case 'harmony':
        return <Music className="w-4 h-4 text-indigo-400" />;
      case 'vocal':
        return <Mic className="w-4 h-4 text-rose-400" />;
      case 'banned_words':
        return <ShieldAlert className="w-4 h-4 text-amber-400" />;
      case 'lyrics':
        return <BookOpen className="w-4 h-4 text-emerald-400" />;
      case 'melody':
        return <Disc className="w-4 h-4 text-rose-400" />;
      case 'suno':
        return <Sliders className="w-4 h-4 text-cyan-400" />;
      case 'schema':
        return <Code2 className="w-4 h-4 text-purple-400" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/70 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold font-mono">
              SPECIFICATION {MUSIC_PRODUCER_PRD_METADATA.version}
            </span>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-medium flex items-center space-x-1">
              <Bot className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Direct-Readable Protocol</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium flex items-center space-x-1">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>国际华语音乐制作人标准</span>
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-100 tracking-tight">
                {MUSIC_PRODUCER_PRD_METADATA.standardName}
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                {MUSIC_PRODUCER_PRD_METADATA.description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleCopyFullPRD}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center space-x-2 cursor-pointer"
              >
                {copiedId === 'full-prd' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-950" />
                    <span>已复制全套需求文档！</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>复制完整需求 PRD (Markdown)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadMarkdown}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>下载 .md 文档</span>
              </button>

              <button
                type="button"
                onClick={onGoToImitation}
                className="px-4 py-2.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <span>前往仿写工作站应用</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Sidebar + Document Content Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar Navigation (4 Columns on Desktop) */}
        <div className="lg:col-span-4 space-y-4 sticky top-24">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索乐理规范、和声走向、十三辙、Suno 参数..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Section Index List */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-2 space-y-1">
            <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-800/80 mb-1">
              <span>文档章节导航目录</span>
              <span className="font-mono text-amber-400">{filteredSections.length} 章节</span>
            </div>

            {filteredSections.map((sec) => {
              const isActive = activeSectionId === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSectionId(sec.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-start space-x-3 cursor-pointer ${
                    isActive
                      ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300 shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-100 border border-transparent'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">{getSectionIcon(sec.category)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs truncate">{sec.title}</div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">{sec.subtitle}</div>
                  </div>
                </button>
              );
            })}

            {filteredSections.length === 0 && (
              <div className="text-center py-6 text-xs text-slate-400">
                未找到匹配章节，请尝试其他关键词
              </div>
            )}
          </div>

          {/* Fast Quick Links Card */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>AI 与音乐人双向解析保障</span>
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              本需求文档已使用标准的 Markdown 结构与严格的 JSON Schema 进行双轨定义。您可以直接将本文档作为 Prompt 注入到任何大语言模型中，确保其以华语殿堂级水准输出。
            </p>
          </div>
        </div>

        {/* Right Main Document Reader (8 Columns on Desktop) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl relative">
            {/* Header of Active Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    SECTION {activeSection.id.toUpperCase()}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-100 mt-2">
                  {activeSection.title}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {activeSection.subtitle}
                </p>
              </div>

              {/* Copy Single Section Button */}
              <button
                type="button"
                onClick={() => handleCopySection(activeSection)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all flex items-center space-x-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
              >
                {copiedId === activeSection.id ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>本章已复制！</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>复制当前章节</span>
                  </>
                )}
              </button>
            </div>

            {/* Markdown Content Renderer */}
            <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-4">
              {activeSection.content.split('\n\n').map((block, idx) => {
                // Code blocks rendering
                if (block.startsWith('```')) {
                  const lines = block.replace(/```[a-z]*/, '').replace(/```$/, '').trim();
                  return (
                    <div key={idx} className="relative group my-4">
                      <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-amber-300 font-mono text-xs overflow-x-auto custom-scrollbar leading-relaxed whitespace-pre-wrap">
                        {lines}
                      </pre>
                    </div>
                  );
                }

                // Table rendering
                if (block.includes('|') && block.includes('---')) {
                  const rows = block.trim().split('\n').filter((r) => r.trim().startsWith('|'));
                  if (rows.length >= 2) {
                    const headers = rows[0].split('|').filter((c) => c.trim().length > 0).map((c) => c.trim());
                    const dataRows = rows.slice(2).map((r) =>
                      r.split('|').filter((c) => c.trim().length > 0).map((c) => c.trim())
                    );

                    return (
                      <div key={idx} className="my-4 overflow-x-auto rounded-2xl border border-slate-800">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-950 text-slate-200 font-bold border-b border-slate-800">
                            <tr>
                              {headers.map((h, hIdx) => (
                                <th key={hIdx} className="p-3">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/80 bg-slate-900/50">
                            {dataRows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-slate-800/40">
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="p-3 text-slate-300">
                                    {cell.startsWith('**') && cell.endsWith('**') ? (
                                      <strong className="text-amber-300 font-semibold">{cell.replace(/\*\*/g, '')}</strong>
                                    ) : cell.startsWith('`') && cell.endsWith('`') ? (
                                      <code className="bg-slate-950 px-1.5 py-0.5 rounded text-amber-300 font-mono">{cell.replace(/`/g, '')}</code>
                                    ) : (
                                      cell
                                    )}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  }
                }

                // Headings
                if (block.startsWith('### ')) {
                  return (
                    <h4 key={idx} className="text-base font-bold text-amber-300 pt-3 pb-1 border-b border-slate-800/80 flex items-center space-x-2">
                      <span>{block.replace('### ', '')}</span>
                    </h4>
                  );
                }
                if (block.startsWith('#### ')) {
                  return (
                    <h5 key={idx} className="text-sm font-bold text-indigo-300 pt-2">
                      {block.replace('#### ', '')}
                    </h5>
                  );
                }

                // Dividers
                if (block === '---') {
                  return <hr key={idx} className="border-slate-800 my-4" />;
                }

                // Standard Paragraphs & List Items
                return (
                  <p key={idx} className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                    {block}
                  </p>
                );
              })}
            </div>

            {/* Pagination Navigation Footer */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-6 mt-8">
              {(() => {
                const currentIndex = PRD_SECTIONS.findIndex((s) => s.id === activeSection.id);
                const prev = currentIndex > 0 ? PRD_SECTIONS[currentIndex - 1] : null;
                const next = currentIndex < PRD_SECTIONS.length - 1 ? PRD_SECTIONS[currentIndex + 1] : null;

                return (
                  <>
                    {prev ? (
                      <button
                        type="button"
                        onClick={() => setActiveSectionId(prev.id)}
                        className="text-xs text-slate-400 hover:text-amber-300 flex items-center space-x-1.5 transition-colors cursor-pointer"
                      >
                        <span>← 上一章：{prev.title.split(' ')[1] || prev.title}</span>
                      </button>
                    ) : (
                      <div />
                    )}

                    {next ? (
                      <button
                        type="button"
                        onClick={() => setActiveSectionId(next.id)}
                        className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
                      >
                        <span>下一章：{next.title.split(' ')[1] || next.title} →</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={onGoToImitation}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
                      >
                        <span>已阅完毕，前往仿写工作站 →</span>
                      </button>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
