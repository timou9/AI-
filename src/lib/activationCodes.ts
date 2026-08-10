// Specific Unique Activation Code Verification & Management System

export interface ActivationCodeInfo {
  code: string;
  tier: 'STUDIO_VIP' | 'PRO_MEMBER';
  credits: number;
  description: string;
  isSingleUse: boolean;
  used: boolean;
  usedBy?: string;
  usedAt?: string;
}

// Master / Preserved Official Codes
const MASTER_VIP_CODES: Record<string, { tier: 'STUDIO_VIP' | 'PRO_MEMBER'; credits: number; description: string }> = {
  'ADABAIHUA': { tier: 'STUDIO_VIP', credits: 9999, description: '微信客服官方通用高阶VIP码' },
  'ADA-VIP-8888': { tier: 'STUDIO_VIP', credits: 9999, description: '超级创作者年度VIP卡' },
  'VIP888': { tier: 'STUDIO_VIP', credits: 9999, description: '金曲制作人专属激活码' },
  'PRO666': { tier: 'PRO_MEMBER', credits: 500, description: 'PRO 创作者高级体验卡' },
  'ADABAIHUA-2026': { tier: 'STUDIO_VIP', credits: 9999, description: '2026 深度乐理拆解终身码' },
};

// Checksum algorithm for dynamic unique codes format: ADA-XXXX-YYYY (e.g., ADA-9F8A-7B2C)
export function isValidAlgorithmicCode(codeStr: string): boolean {
  const clean = codeStr.trim().toUpperCase();
  if (!clean.startsWith('ADA-')) return false;
  const parts = clean.split('-');
  if (parts.length !== 3) return false;
  
  const p1 = parts[1]; // 4 chars
  const p2 = parts[2]; // 4 chars
  if (p1.length !== 4 || p2.length !== 4) return false;

  // Verify checksum: sum of hex/alphanumeric chars
  let sum1 = 0;
  for (let i = 0; i < p1.length; i++) sum1 += p1.charCodeAt(i);
  let sum2 = 0;
  for (let i = 0; i < p2.length; i++) sum2 += p2.charCodeAt(i);

  // Valid if checksum condition matches (e.g. (sum1 + sum2) % 7 === 0 or specific hash pattern)
  return (sum1 * 3 + sum2 * 7) % 5 === 0;
}

// Get or initialize custom generated codes from localStorage
export function getStoredCodes(): Record<string, ActivationCodeInfo> {
  try {
    const raw = localStorage.getItem('song_studio_activation_codes');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load stored activation codes', e);
  }
  return {};
}

export function saveStoredCodes(codes: Record<string, ActivationCodeInfo>) {
  try {
    localStorage.setItem('song_studio_activation_codes', JSON.stringify(codes));
  } catch (e) {
    console.error('Failed to save activation codes', e);
  }
}

// Generate a brand new unique activation code for WeChat customers
export function generateUniqueCode(tier: 'STUDIO_VIP' | 'PRO_MEMBER' = 'STUDIO_VIP'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const stored = getStoredCodes();

  while (true) {
    let p1 = '';
    let p2 = '';
    for (let i = 0; i < 4; i++) p1 += chars.charAt(Math.floor(Math.random() * chars.length));
    for (let i = 0; i < 4; i++) p2 += chars.charAt(Math.floor(Math.random() * chars.length));

    let sum1 = 0;
    for (let i = 0; i < p1.length; i++) sum1 += p1.charCodeAt(i);
    let sum2 = 0;
    for (let i = 0; i < p2.length; i++) sum2 += p2.charCodeAt(i);

    // Adjust last char of p2 to satisfy (sum1 * 3 + sum2 * 7) % 5 === 0
    for (let c of chars) {
      let testP2 = p2.slice(0, 3) + c;
      let tSum2 = 0;
      for (let i = 0; i < testP2.length; i++) tSum2 += testP2.charCodeAt(i);
      if ((sum1 * 3 + tSum2 * 7) % 5 === 0) {
        const fullCode = `ADA-${p1}-${testP2}`;
        if (!MASTER_VIP_CODES[fullCode] && !stored[fullCode]) {
          // Save generated unique code
          stored[fullCode] = {
            code: fullCode,
            tier,
            credits: tier === 'STUDIO_VIP' ? 9999 : 500,
            description: `客服微信 Adabaihua 签发独一${tier === 'STUDIO_VIP' ? 'VIP' : 'PRO'}码`,
            isSingleUse: true,
            used: false,
          };
          saveStoredCodes(stored);
          return fullCode;
        }
      }
    }
  }
}

// Verify activation code
export interface CodeVerificationResult {
  valid: boolean;
  tier?: 'STUDIO_VIP' | 'PRO_MEMBER';
  credits?: number;
  message: string;
}

export function verifyActivationCode(inputCode: string, userAccount: string): CodeVerificationResult {
  const code = inputCode.trim().toUpperCase();
  if (!code) {
    return {
      valid: false,
      message: '未输入激活码。将按标准免费账户注册（送 10 次体验额度）。',
    };
  }

  // 1. Check Master VIP Codes
  if (MASTER_VIP_CODES[code]) {
    const info = MASTER_VIP_CODES[code];
    return {
      valid: true,
      tier: info.tier,
      credits: info.credits,
      message: `验证成功！已激活专属《${info.description}》，享有高阶 AI 拆解与仿写导出权限。`,
    };
  }

  // 2. Check Local Storage Stored Generated Codes
  const stored = getStoredCodes();
  if (stored[code]) {
    const item = stored[code];
    if (item.isSingleUse && item.used) {
      return {
        valid: false,
        message: `此激活码（${code}）已被账号 ${item.usedBy || '其他人'} 于 ${item.usedAt || '近期'} 使用过。独一码不可重复使用！请联系客服微信 Adabaihua 领取新码。`,
      };
    }

    // Mark as used
    item.used = true;
    item.usedBy = userAccount;
    item.usedAt = new Date().toLocaleString();
    stored[code] = item;
    saveStoredCodes(stored);

    return {
      valid: true,
      tier: item.tier,
      credits: item.credits,
      message: `验证成功！专一独享激活码激活成功，已绑定当前账号！`,
    };
  }

  // 3. Algorithmic Check
  if (isValidAlgorithmicCode(code)) {
    return {
      valid: true,
      tier: 'STUDIO_VIP',
      credits: 9999,
      message: '验证成功！独一格式校验通过，已成功升级为 STUDIO VIP！',
    };
  }

  // 4. Invalid Code
  return {
    valid: false,
    message: '激活码错误或不存在！激活码需为特定独一授权码。请联系客服微信 Adabaihua 获取专属独一激活码。',
  };
}
