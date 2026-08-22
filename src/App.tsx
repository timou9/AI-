import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PresetSelector } from './components/PresetSelector';
import { SongAnalyzerForm } from './components/SongAnalyzerForm';
import { SongAnalysisView } from './components/SongAnalysisView';
import { ImitationStudio } from './components/ImitationStudio';
import { MusicProducerPRDView } from './components/MusicProducerPRDView';
import { AuthModal } from './components/AuthModal';
import { PRESET_SONGS } from './data/presets';
import { SongAnalysisResult, ImitationSongBlueprint, PresetSong, UserProfile } from './types';
import { Disc, Sparkles, Wand2, Music2, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'presets' | 'analyzer' | 'imitation' | 'prd'>('presets');
  const [currentAnalysis, setCurrentAnalysis] = useState<SongAnalysisResult | null>(PRESET_SONGS[0].analysis);
  const [currentBlueprint, setCurrentBlueprint] = useState<ImitationSongBlueprint | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingBlueprint, setIsGeneratingBlueprint] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // User Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Load persisted user state on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('song_studio_user');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('Failed to load user state:', e);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('song_studio_user');
    setCurrentUser(null);
  };

  // Handle Preset Selection
  const handleSelectPreset = (preset: PresetSong) => {
    setCurrentAnalysis(preset.analysis);
    setActiveTab('analyzer');
  };

  // Helper to check and deduct 1-time guest/free credit
  const checkCanPerformAction = (): boolean => {
    if (currentUser?.isVip) {
      return true; // VIP has unlimited access
    }

    if (currentUser) {
      // Logged in user but FREE tier
      if (currentUser.remainingCredits <= 0) {
        setErrorMessage('体验额度已用完（体验用户仅有 1 次免费尝试机会）。请联系客服微信 Adabaihua 获取专属特定独一激活码升级 VIP 解锁不限次使用！');
        setIsAuthModalOpen(true);
        return false;
      }
    } else {
      // Guest user (not logged in)
      const guestUsed = localStorage.getItem('song_studio_guest_used');
      if (guestUsed === 'true') {
        setErrorMessage('体验额度已用完（体验用户仅有 1 次免费尝试机会）。请注册登录并输入微信客服 Adabaihua 发放的专属特定独一激活码开通 VIP！');
        setIsAuthModalOpen(true);
        return false;
      }
    }

    return true;
  };

  const consumeOneCredit = () => {
    if (currentUser && !currentUser.isVip) {
      const updatedUser = {
        ...currentUser,
        remainingCredits: Math.max(0, currentUser.remainingCredits - 1),
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('song_studio_user', JSON.stringify(updatedUser));
    } else if (!currentUser) {
      localStorage.setItem('song_studio_guest_used', 'true');
    }
  };

  // Handle Song Analysis API request
  const handleAnalyzeSong = async (formData: {
    songTitle: string;
    artist: string;
    lyrics: string;
    genre: string;
    audioDescription: string;
    mediaFile?: { data: string; mimeType: string; fileName: string } | null;
  }) => {
    if (!checkCanPerformAction()) return;

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/analyze-song', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        let errText = `服务器响应异常 (${response.status})`;
        try {
          const text = await response.text();
          if (text.startsWith('{')) {
            const parsed = JSON.parse(text);
            errText = parsed.error || parsed.message || errText;
          } else {
            errText = `服务器繁忙或文件过大 (${response.status})，请重试。`;
          }
        } catch (e) {}
        throw new Error(errText);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || '分析歌曲失败');
      }

      setCurrentAnalysis(data.data);
      setActiveTab('analyzer');

      // Deduct credit for non-vip
      consumeOneCredit();
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMessage(err?.message || '服务器响应异常，请检查网络后重试。');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle Imitation Song Generation API request
  const handleGenerateImitationBlueprint = async (customization: any) => {
    if (!currentAnalysis) {
      setErrorMessage('请先选择或分析一首目标歌曲！');
      return;
    }

    if (!checkCanPerformAction()) return;

    setIsGeneratingBlueprint(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/generate-imitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisData: currentAnalysis,
          userCustomization: customization,
        }),
      });

      if (!response.ok) {
        let errText = `服务器响应异常 (${response.status})`;
        try {
          const text = await response.text();
          if (text.startsWith('{')) {
            const parsed = JSON.parse(text);
            errText = parsed.error || parsed.message || errText;
          } else {
            errText = `生成失败 (${response.status})，请重试。`;
          }
        } catch (e) {}
        throw new Error(errText);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || '生成仿写 Blueprint 失败');
      }

      setCurrentBlueprint(data.data);

      // Deduct credit for non-vip
      consumeOneCredit();
    } catch (err: any) {
      console.error('Blueprint generation error:', err);
      setErrorMessage(err?.message || '生成新歌失败，请重试。');
    } finally {
      setIsGeneratingBlueprint(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasAnalysisData={!!currentAnalysis}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => setCurrentUser(user)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Error Alert Notification */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start space-x-3 shadow-lg">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block mb-0.5">提示：</span>
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-rose-200 text-xs font-bold"
            >
              关闭
            </button>
          </div>
        )}

        {/* Tab 1: Preset Songs Reference Library */}
        {activeTab === 'presets' && (
          <PresetSelector
            onSelectPreset={handleSelectPreset}
            onGoCustom={() => setActiveTab('analyzer')}
            onGoPRD={() => setActiveTab('prd')}
          />
        )}

        {/* Tab 2: Song Analysis (Input Form + Result Dashboard) */}
        {activeTab === 'analyzer' && (
          <div className="space-y-8">
            <SongAnalyzerForm
              onAnalyze={handleAnalyzeSong}
              isLoading={isAnalyzing}
            />

            {currentAnalysis && (
              <SongAnalysisView
                analysis={currentAnalysis}
                onStartImitation={() => setActiveTab('imitation')}
              />
            )}
          </div>
        )}

        {/* Tab 3: AI Imitation Songwriting Studio */}
        {activeTab === 'imitation' && currentAnalysis && (
          <ImitationStudio
            analysis={currentAnalysis}
            onGenerateBlueprint={handleGenerateImitationBlueprint}
            blueprint={currentBlueprint}
            isGenerating={isGeneratingBlueprint}
          />
        )}

        {/* Tab 4: International Music Producer PRD & Specification Document */}
        {activeTab === 'prd' && (
          <MusicProducerPRDView
            onGoToImitation={() => setActiveTab('imitation')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI 音乐分析与仿写工作站 · Google AI Studio Build</span>
          </p>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>内置 Web Audio API 琴音合成器与 Gemini 乐理分析引擎</span>
            <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
              激活码客服微信：Adabaihua
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
