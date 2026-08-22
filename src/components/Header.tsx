import React, { useState } from 'react';
import { Music, Disc, BookOpen, Wand2, User, LogOut, Sparkles, ShieldCheck, Crown, MessageCircle, Copy, Check, FileText } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  activeTab: 'analyzer' | 'imitation' | 'presets' | 'prd';
  setActiveTab: (tab: 'analyzer' | 'imitation' | 'presets' | 'prd') => void;
  hasAnalysisData: boolean;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  hasAnalysisData,
  currentUser,
  onOpenAuth,
  onLogout,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [copiedWeChat, setCopiedWeChat] = useState(false);

  const handleCopyWeChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText('Adabaihua');
    setCopiedWeChat(true);
    setTimeout(() => setCopiedWeChat(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('presets')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 p-0.5 shadow-lg shadow-amber-500/10">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Music className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-slate-100 via-amber-200 to-slate-200 bg-clip-text text-transparent flex items-center space-x-2">
              <span>AI 音乐分析与仿写工作站</span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              Song Analysis & AI Co-Writer Studio
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-2 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'presets'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Disc className="w-4 h-4" />
            <span>金曲参考库</span>
          </button>

          <button
            onClick={() => setActiveTab('analyzer')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'analyzer'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>歌曲深度分析</span>
          </button>

          <button
            onClick={() => setActiveTab('imitation')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center space-x-1.5 relative ${
              activeTab === 'imitation'
                ? 'bg-gradient-to-r from-rose-500/30 to-amber-500/30 text-rose-200 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Wand2 className="w-4 h-4 text-amber-400" />
            <span>AI 仿写工作站</span>
            {hasAnalysisData && activeTab !== 'imitation' && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('prd')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'prd'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>音乐家规范 (PRD)</span>
          </button>
        </nav>

        {/* User Login & Profile Area */}
        <div className="relative">
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                  {currentUser.username.slice(0, 1).toUpperCase()}
                </div>
                <div className="hidden md:block">
                  <div className="text-xs font-bold text-slate-200 flex items-center space-x-1">
                    <span>{currentUser.username}</span>
                    {currentUser.isVip && <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />}
                  </div>
                  <div className="text-[10px] text-amber-300 font-mono">
                    {currentUser.isVip ? 'STUDIO PRO VIP' : `剩余额度: ${currentUser.remainingCredits}次`}
                  </div>
                </div>
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3 z-50 space-y-2 animate-fadeIn">
                  <div className="pb-2 border-b border-slate-800">
                    <div className="text-xs font-bold text-slate-100">{currentUser.username}</div>
                    <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
                    <div className="mt-1.5 inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{currentUser.isVip ? '专业创作会员 (全功能)' : '基础免费账户'}</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 space-y-1.5 py-1">
                    <div className="flex justify-between">
                      <span>AI 生成额度:</span>
                      <span className="font-mono text-amber-400 font-bold">
                        {currentUser.remainingCredits > 500 ? '无限制' : `${currentUser.remainingCredits} 次`}
                      </span>
                    </div>

                    {/* WeChat activation code contact in dropdown */}
                    <button
                      type="button"
                      onClick={handleCopyWeChat}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-[11px] border border-emerald-500/30 transition-all flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center space-x-1">
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>客服微信: <strong className="text-amber-300">Adabaihua</strong></span>
                      </span>
                      {copiedWeChat ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 opacity-70" />
                      )}
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl bg-slate-950 hover:bg-rose-500/20 text-rose-300 text-xs font-medium transition-colors flex items-center space-x-2 border border-slate-800/80"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>退出当前登录</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyWeChat}
                className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all cursor-pointer"
                title="点击复制客服微信获取激活码"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>微信: Adabaihua</span>
                {copiedWeChat ? <Check className="w-3 h-3 text-emerald-400 ml-1" /> : <Copy className="w-3 h-3 ml-1 opacity-70" />}
              </button>

              <button
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/10 transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>登录 / 注册</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
