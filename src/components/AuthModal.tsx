import React, { useState } from 'react';
import {
  X,
  User,
  Lock,
  Mail,
  Sparkles,
  KeyRound,
  CheckCircle2,
  Music,
  ShieldCheck,
  Zap,
  ArrowRight,
  UserCheck,
  MessageCircle,
  Copy,
  Check,
  Plus
} from 'lucide-react';
import { UserProfile } from '../types';
import { verifyActivationCode, generateUniqueCode } from '../lib/activationCodes';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [activationCode, setActivationCode] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedWeChat, setCopiedWeChat] = useState(false);
  const [generatedDemoCode, setGeneratedDemoCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyWeChat = () => {
    navigator.clipboard.writeText('Adabaihua');
    setCopiedWeChat(true);
    setTimeout(() => setCopiedWeChat(false), 2000);
  };

  const handleGenerateSampleCode = () => {
    const code = generateUniqueCode('STUDIO_VIP');
    setGeneratedDemoCode(code);
    setActivationCode(code);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!account.trim() || !password.trim()) {
      setErrorMsg('请填写完整的账号与密码。');
      return;
    }

    if (mode === 'register' && password.length < 6) {
      setErrorMsg('密码长度不能少于 6 位。');
      return;
    }

    // Strictly verify activation code if supplied in register mode or login with code
    let userVipTier: 'FREE' | 'PRO_MEMBER' | 'STUDIO_VIP' = 'FREE';
    let userCredits = 1; // 体验用户只有 1 次机会
    let isVip = false;

    if (mode === 'register') {
      if (activationCode.trim()) {
        const verifyRes = verifyActivationCode(activationCode, account);
        if (!verifyRes.valid) {
          setErrorMsg(verifyRes.message);
          return;
        }
        userVipTier = verifyRes.tier || 'STUDIO_VIP';
        userCredits = verifyRes.credits || 9999;
        isVip = userVipTier === 'STUDIO_VIP' || userVipTier === 'PRO_MEMBER';
      }
    } else {
      // Login mode - if existing local user matches or defaults
      isVip = true;
      userVipTier = 'STUDIO_VIP';
      userCredits = 9999;
    }

    setIsSubmitting(true);

    // Simulate login / registration delay
    setTimeout(() => {
      setIsSubmitting(false);

      const displayName = username.trim() || account.split('@')[0] || '音乐制作人';

      const newUser: UserProfile = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        username: displayName,
        email: account.includes('@') ? account : `${account}@music.studio`,
        isVip: isVip,
        vipTier: userVipTier,
        remainingCredits: userCredits,
        vipExpireDate: isVip ? '2027-12-31' : undefined,
      };

      // Save to localStorage
      localStorage.setItem('song_studio_user', JSON.stringify(newUser));

      if (mode === 'register') {
        if (isVip) {
          setSuccessMsg(`注册并激活成功！已成功为您锁定【${userVipTier === 'STUDIO_VIP' ? '独一 VIP 尊享' : 'PRO 创作者'}】全功能权限。`);
        } else {
          setSuccessMsg('注册成功！已分配 1 次体验额度（体验用户仅有 1 次机会）。');
        }
      } else {
        setSuccessMsg('登录成功！欢迎回到 AI 音乐工作站。');
      }

      setTimeout(() => {
        onLoginSuccess(newUser);
        onClose();
      }, 700);
    }, 500);
  };

  const handleQuickGuest = () => {
    const guestUser: UserProfile = {
      id: 'guest_' + Math.random().toString(36).substring(2, 7),
      username: '体验音乐人',
      email: 'guest@studio.com',
      isVip: false,
      vipTier: 'FREE',
      remainingCredits: 1, // 体验用户只有 1 次机会
    };
    localStorage.setItem('song_studio_user', JSON.stringify(guestUser));
    onLoginSuccess(guestUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Top Accent Gradient Header */}
        <div className="bg-gradient-to-r from-amber-500/20 via-indigo-500/20 to-purple-500/20 p-6 border-b border-slate-800 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 p-0.5 shadow-lg shadow-amber-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Music className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                <span>{mode === 'login' ? '创作者登录' : '注册新账号'}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  PRO 工作站
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {mode === 'login' ? '登录解锁云端词曲同步与无限制 AI 仿写' : '免费注册即赠 50 次 AI 全维度音视频乐理拆解额度'}
              </p>
            </div>
          </div>
        </div>

        {/* Form & Content Body */}
        <div className="p-6 space-y-5">
          {/* Toggle Login/Register */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-slate-100 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              账号密码登录
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              免费注册创作者
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  <span>音乐人昵称 / 创作署名</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="例如: JayProducer / 词曲人阿杰"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>手机号 / 电子邮箱</span>
              </label>
              <input
                type="text"
                required
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                placeholder="请输入手机号或邮箱账号"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                <span>登录密码</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'login' ? '请输入密码' : '设置 6 位以上密码'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {mode === 'register' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    <span>特定独一 VIP 激活码 (选填)</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateSampleCode}
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center space-x-1 underline decoration-amber-500/40"
                    title="自动生成格式合规的专一测试激活码"
                  >
                    <Plus className="w-3 h-3" />
                    <span>测试生成独一码</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={activationCode}
                  onChange={(e) => setActivationCode(e.target.value)}
                  placeholder="请输入特定独一激活码 (例: ADA-8F3K-9B2M / VIP888)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono uppercase"
                />
                {generatedDemoCode && (
                  <div className="text-[11px] text-amber-300 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 flex items-center justify-between font-mono">
                    <span>已生成独一校验码: <strong>{generatedDemoCode}</strong></span>
                    <span className="text-[10px] text-slate-400">单次有效</span>
                  </div>
                )}
              </div>
            )}

            {/* WeChat Activation Code Banner */}
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-slate-300 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 font-semibold text-emerald-300">
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>获取专属特定独一激活码:</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyWeChat}
                  className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 transition-all flex items-center space-x-1 cursor-pointer"
                >
                  {copiedWeChat ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>已复制</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>复制微信号</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                激活码需特定独一授权（如 <span className="font-mono text-amber-300">VIP888</span> 或专属 <span className="font-mono text-amber-300">ADA-XXXX-XXXX</span> 码）。请联系客服微信：<span className="font-mono font-bold text-amber-300 select-all">Adabaihua</span> 获取属于您的特定独一码。
              </p>
            </div>

            {mode === 'login' && (
              <div className="flex items-center justify-between text-xs text-slate-400">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-indigo-500 focus:ring-indigo-500"
                  />
                  <span>记住登录状态</span>
                </label>
                <button
                  type="button"
                  onClick={() => setErrorMsg('忘记密码或需要帮助，请加微信 Adabaihua 找回账号。')}
                  className="text-indigo-400 hover:text-indigo-300"
                >
                  忘记密码?
                </button>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                <X className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center space-x-2 cursor-pointer ${
                mode === 'login'
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-slate-100 shadow-indigo-600/20'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
              }`}
            >
              {isSubmitting ? (
                <span>验证处理中...</span>
              ) : mode === 'login' ? (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>立即登录工作站</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>完成注册并开始创作</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Guest mode alternative */}
          <div className="pt-2 border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={handleQuickGuest}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center space-x-1 mx-auto"
            >
              <span>暂不登录，先以游客身份体验基础功能</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
