import { PresetSong } from '../types';

export const PRESET_SONGS: PresetSong[] = [
  {
    id: 'qingtian',
    title: '晴天 (Sunny Day)',
    artist: '周杰伦 (Jay Chou)',
    genre: '华语流行 / 校园摇滚 / 木吉他流行',
    key: 'G Major (G大调)',
    bpm: 84,
    tags: ['青春怀旧', '木吉他分解', '经典4536251', '弱起切分', '前奏吉他Solo'],
    coverGradient: 'from-amber-500/20 via-orange-500/10 to-yellow-500/20',
    analysis: {
      songTitle: '晴天',
      artist: '周杰伦',
      genre: '华语流行 / 木吉他民谣摇滚',
      tempoBpm: 84,
      musicalKey: 'G Major',
      vibeMood: ['青春校园', '酸甜回忆', '木吉他质感', '淡淡遗憾'],
      structure: [
        { section: 'Intro 前奏', bars: 8, function: '经典的木吉他分解和弦+Solo，确立校园清爽基调', energyLevel: 3 },
        { section: 'Verse 1 主歌A', bars: 16, function: '低吟浅唱，叙述故事背景（故事的小黄花）', energyLevel: 4 },
        { section: 'Pre-Chorus 副歌前导', bars: 8, function: '和声开始走高，情绪逐步铺垫', energyLevel: 6 },
        { section: 'Chorus 副歌', bars: 16, function: '爆发情绪（刮风的下午），旋律线条高亢连贯', energyLevel: 9 },
        { section: 'Bridge 间奏/过场', bars: 8, function: 'Rap/口白韵律变化，拉开空间感', energyLevel: 7 },
        { section: 'Outro 尾声', bars: 8, function: '吉他扫弦渐弱，降B/升C级下行留白', energyLevel: 3 },
      ],
      chordProgressions: [
        {
          name: '主歌和弦 (经典 1 - 7 - 6 - 5 级下行)',
          chords: ['G', 'D/F#', 'Em7', 'G/D', 'C', 'G/B', 'Am7', 'D7'],
          romanNumerals: 'I - V/7 - vi7 - I/5 - IV - I/3 - ii7 - V7',
          emotionalEffect: '下行 Bass line 营造温情、怀旧与岁月流逝的沉浸感'
        },
        {
          name: '副歌黄金级进 (4536251 变体)',
          chords: ['Cadd9', 'D/C', 'Bm7', 'Em7', 'Am7', 'D7', 'G', 'G7'],
          romanNumerals: 'IVadd9 - V/IV - iii7 - vi7 - ii7 - V7 - I - I7',
          emotionalEffect: '副歌采用经典的华语流行金曲4536251级进，极具记忆点与情感共鸣强度'
        }
      ],
      melodicCharacteristics: [
        '使用了中国传统五声音阶 (宫商角徵羽) 与西方自然大调的交融',
        '副歌首句大量运用“弱起拍（Off-beat）”与十六分音符切分节奏',
        '音域跨度达到12度，副歌高音区在 G4-A4 连续停留，形成张力',
        '句尾习惯带有标志性的降级或滑音下行，呈现“杰式唱腔”特点'
      ],
      lyricCrafting: {
        rhymeScheme: 'AABB 押 [ua/a/ian] 韵 (花/刮/擦/雨/去)',
        coreMetaphors: ['故事的小黄花', '刮风的下午', '消失的下雨天', 'Re So So Si Do Si La'],
        themeSummary: '以具体的天气与校园事物作为情感载体，诉说青春里未能说出口的告白与遗憾',
        sentenceStructure: '开头短句叙事，随后长句倾诉，副歌将音乐名 (Re So So...) 融入歌词，别具一格',
        annotatedLyrics: [
          { id: 'qt-1', section: 'Verse 1 主歌', lyricText: '故事的小黄花 从出生那年就飘着', emotionTag: '怀旧', emotionCategory: 'nostalgia', explanation: '经典的校园物语开头，以“小黄花”意象带入童年记忆' },
          { id: 'qt-2', section: 'Verse 1 主歌', lyricText: '童年的风车 在深夜里不停地转动', emotionTag: '温暖', emotionCategory: 'sweet', explanation: '童年物语与梦幻色彩的温暖延续' },
          { id: 'qt-3', section: 'Pre-Chorus 导歌', lyricText: '刮风的下午 我试过握着你手', emotionTag: '期待', emotionCategory: 'expectation', explanation: '情绪开始酝酿升温，尝试靠近的羞涩期待' },
          { id: 'qt-4', section: 'Pre-Chorus 导歌', lyricText: '但偏偏 雨渐渐 大到我看你不见', emotionTag: '伤感', emotionCategory: 'sadness', explanation: '突如其来的天气变化预示着情感转折与遗憾' },
          { id: 'qt-5', section: 'Chorus 副歌', lyricText: '还要多久 我才能在你身边', emotionTag: '迷茫', emotionCategory: 'confused', explanation: '副歌爆发，高亢连贯旋律诉说内心的迷茫与执念' },
          { id: 'qt-6', section: 'Chorus 副歌', lyricText: '等到放晴的那天 也许我会比较好一点', emotionTag: '渴望', emotionCategory: 'expectation', explanation: '对美好结局的期盼与自我疗愈' },
          { id: 'qt-7', section: 'Bridge 桥段', lyricText: '从前从前 有个人爱你了很久', emotionTag: '深情', emotionCategory: 'sweet', explanation: '告白语气的平铺直叙，情感纯粹动人' },
          { id: 'qt-8', section: 'Outro 尾声', lyricText: '拜拜 吹着前奏望着天空 祝你幸福', emotionTag: '释怀', emotionCategory: 'relieved', explanation: '前奏钩子重现，化为对青春遗憾的释怀与祝福' }
        ]
      },
      arrangementInstruments: ['木吉他 (Acoustic Guitar)', '贝斯 (Electric Bass)', '流行打击乐/鼓组', '弦乐群 (Strings Group)', '电吉他 Solo'],
      goldenRulesForImitation: [
        '【和弦】使用下行 Bass line (I-V/7-vi-I/5) 作为主歌，副歌切换为 4536251 或 4536',
        '【前奏】使用标志性的单一原声乐器（如木吉他或钢琴）弹奏具识别度的 Hook 乐段',
        '【歌词】第一句引入具象的日常小物或天气（如“窗外的梧桐树”、“降温的傍晚”），不要空洞喊话',
        '【旋律】副歌采用“弱起切分 + 三连音/十六分音符密密麻麻的叙事”，句尾留白拉长音',
        '【彩蛋】在歌词或旋律中加入唱名/音符名（如“Do Re Mi”）或口白式说唱过场'
      ],
      suggestedNewThemes: [
        '《晚风里的信》：讲述高中毕业前夕留在书本里的旧书签与未寄出的信',
        '《雨后三点半》：以午后咖啡馆与骤降的大雨为背景，回忆旧日的约定',
        '《没能说出口的半句话》：以车站离别为场景，讲述遗憾与释怀'
      ]
    }
  },
  {
    id: 'cruel-summer',
    title: 'Cruel Summer',
    artist: 'Taylor Swift',
    genre: 'Synth-Pop / Dance-Pop / Synthwave',
    key: 'A Major (A大调)',
    bpm: 170,
    tags: ['合成器流行', '强劲Bridge吼唱', '四和弦循环', '高能情绪', '激情夏日'],
    coverGradient: 'from-pink-500/20 via-purple-500/10 to-indigo-500/20',
    analysis: {
      songTitle: 'Cruel Summer',
      artist: 'Taylor Swift',
      genre: 'Synth-Pop / 80s波浪流行',
      tempoBpm: 170,
      musicalKey: 'A Major',
      vibeMood: ['充沛活力', '极度渴望', '夏日狂欢', '戏剧化张力'],
      structure: [
        { section: 'Intro', bars: 4, function: '扭曲复古合成器 Riff 快速建立 80年代 Synth 气氛', energyLevel: 5 },
        { section: 'Verse 1', bars: 8, function: '主歌节奏紧凑，唱腔低沉有嚼劲', energyLevel: 6 },
        { section: 'Pre-Chorus', bars: 8, function: '人声加入高音和声，和声向高点汇聚', energyLevel: 8 },
        { section: 'Chorus', bars: 8, function: '“It’s a cruel summer!” 核心 Hook 炸裂爆发', energyLevel: 9 },
        { section: 'Bridge 桥段 (核心亮笔)', bars: 8, function: '全曲情绪最高峰，声嘶力竭的叙事吼唱 (I love you, ain’t that the worst thing you ever heard!)', energyLevel: 10 },
        { section: 'Outro', bars: 4, function: '合成器逐渐回落，留在回声里', energyLevel: 4 }
      ],
      chordProgressions: [
        {
          name: '全曲核心四和弦 Loop (I - vi - IV - V)',
          chords: ['A', 'F#m', 'D', 'E'],
          romanNumerals: 'I - vi - IV - V (A - F#m - D - E)',
          emotionalEffect: '极简的四和弦无限循环，靠编曲层次和人声旋律起伏创造强烈的动能与沉浸感'
        }
      ],
      melodicCharacteristics: [
        '短促的八分音符重复唱段，形成像脉搏跳动一样的律动感',
        'Bridge 段落采用“半说半吼”式的叙事旋律，直接打断歌词逻辑，直击人心',
        '利用高位置的假音 (Falsetto) 与强真音吼唱交替切换',
        '句尾使用向上微扬的音调，增加戏谑与不安全感'
      ],
      lyricCrafting: {
        rhymeScheme: 'AABB / 内部强抑扬顿挫的内押韵 (Internal Rhymes)',
        coreMetaphors: ['fever dream', 'bad, bad boy', 'devil’s roll of the dice', 'screaming through the window'],
        themeSummary: '秘密恋情中的不安、狂热、渴望与绝望交织的脆弱感',
        sentenceStructure: '主谓宾高度凝练，充满场景感动词（screaming, bleeding, crying, laughing）',
        annotatedLyrics: [
          { id: 'cs-1', section: 'Verse 1', lyricText: 'Fever dream high in the quiet of the night', emotionTag: '迷茫', emotionCategory: 'confused', explanation: '夜深人静时的不安全感与迷幻梦境' },
          { id: 'cs-2', section: 'Verse 1', lyricText: 'Bad, bad boy, shiny toy with a price', emotionTag: '试探', emotionCategory: 'sweet', explanation: '危险诱惑与小心翼翼的试探' },
          { id: 'cs-3', section: 'Pre-Chorus', lyricText: 'And it’s new, the shape of your body', emotionTag: '甜蜜', emotionCategory: 'sweet', explanation: '感官觉醒，情绪逐渐走向高潮' },
          { id: 'cs-4', section: 'Chorus', lyricText: 'It’s a cruel summer, with you', emotionTag: '狂热', emotionCategory: 'inspirational', explanation: '核心 Hook 炸裂，爱恨交织的夏日狂欢' },
          { id: 'cs-5', section: 'Bridge 桥段', lyricText: 'I’m drunk in the back of the car, crying like a baby', emotionTag: '宣泄', emotionCategory: 'anger', explanation: '情绪最高点，崩溃式的真实宣泄' },
          { id: 'cs-6', section: 'Bridge 桥段', lyricText: 'I love you, ain’t that the worst thing you ever heard!', emotionTag: '愤怒', emotionCategory: 'anger', explanation: '经典呐喊吼唱，将隐秘爱意化作绝望的震撼咆哮' },
          { id: 'cs-7', section: 'Outro', lyricText: 'I’m with you, even in the dark', emotionTag: '释怀', emotionCategory: 'relieved', explanation: '狂风暴雨后的平静拥抱与释怀' }
        ]
      },
      arrangementInstruments: ['波导合成器 (Analog Synthesizer)', '808电子鼓组/强劲4-on-the-floor拍子', 'Vocal Chops人声切片', '合成贝斯 (Synth Bass)'],
      goldenRulesForImitation: [
        '【和弦】选择一个极简的 4 和弦 Loop，全曲保持不变，靠声部叠加产生层次',
        '【Bridge】必须有一个极为爆裂、倾泻式呐喊的 Bridge，把内心最深隐秘大声喊出来',
        '【节奏】BPM设在 160-175 之间，搭配快节奏的八分音符吐字',
        '【音色】使用 80年代复古合成器电声配器（808强击打声 + 声场很宽的电音和声）'
      ],
      suggestedNewThemes: [
        '《Midnight Neon 霓虹午夜》：失眠城市里疯狂而短暂的逃离',
        '《Velvet Hazard 丝绒危险》：明知是陷阱却无法抗拒的恋爱沉沦',
        '《Wildest Horizon 狂野地平线》：夏末公路旅行中的绝唱'
      ]
    }
  },
  {
    id: 'yihoubiezuopengyou',
    title: '以后别做朋友 (Let’s Not Be Friends)',
    artist: '周兴哲 (Eric Chou)',
    genre: '华语抒情 Pop / 钢琴芭乐 / 伤感情歌',
    key: 'C Major (C大调)',
    bpm: 72,
    tags: ['深情芭乐', '钢琴伴奏', '催泪副歌', '4536251', '虐心告白'],
    coverGradient: 'from-blue-600/20 via-slate-500/10 to-indigo-600/20',
    analysis: {
      songTitle: '以后别做朋友',
      artist: '周兴哲',
      genre: '华语流行抒情芭乐 (Ballad)',
      tempoBpm: 72,
      musicalKey: 'C Major',
      vibeMood: ['伤感心碎', '默默守护', '深情告白', '遗憾释怀'],
      structure: [
        { section: 'Intro', bars: 4, function: '深沉优雅的单琴（钢琴）独奏引入静谧氛围', energyLevel: 2 },
        { section: 'Verse 1', bars: 8, function: '叙事性语气，平稳起步，表达退回朋友位置的无奈', energyLevel: 3 },
        { section: 'Pre-Chorus', bars: 8, function: '加入大提琴与轻柔鼓点，情感开始蔓延', energyLevel: 5 },
        { section: 'Chorus', bars: 16, function: '“以后别做朋友，朋友不能牵手”，爆发核心高音切分与抒情旋律', energyLevel: 9 },
        { section: 'Outro', bars: 4, function: '钢琴重现前奏主题，缓缓归于平静', energyLevel: 2 }
      ],
      chordProgressions: [
        {
          name: '抒情黄金和弦 (1-5-6-3-4-3-2-5)',
          chords: ['C', 'G/B', 'Am', 'Am/G', 'F', 'C/E', 'Dm7', 'G7'],
          romanNumerals: 'I - V/7 - vi - vi/5 - IV - I/3 - ii7 - V7',
          emotionalEffect: '最正统华语催泪芭乐下行级进，每一步都踏在心坎上'
        }
      ],
      melodicCharacteristics: [
        '主歌在低音区小跳，像在耳边小声呢喃',
        '副歌首句出现“八度跨度大跳”，迅速拉开情感张力',
        '非常注重“假音与真音”的柔和转换，呈现脆弱感',
        '长音拖腔多，给歌词情感留足回响时间'
      ],
      lyricCrafting: {
        rhymeScheme: 'ABAB 押 [-ou] 韵 (手/走/够/酒)',
        coreMetaphors: ['朋友的界线', '牵手与放手', '不能说的秘密', '忍住不哭的眼泪'],
        themeSummary: '爱而不得后，宁可绝交也不愿意只当假装大度“好朋友”的苦涩与尊严',
        sentenceStructure: '对仗严谨，前句假装坚强，后句真情露怯',
        annotatedLyrics: [
          { id: 'yh-1', section: 'Verse 1 主歌', lyricText: '习惯听你分享生活点滴 习惯当你倾诉的对象', emotionTag: '默默守护', emotionCategory: 'sweet', explanation: '以退为进的无微不至，隐藏真实的爱意' },
          { id: 'yh-2', section: 'Verse 1 主歌', lyricText: '保持这距离 怕太亲密会失去', emotionTag: '压抑', emotionCategory: 'confused', explanation: '害怕越界后的失去，内心的极度克制与纠结' },
          { id: 'yh-3', section: 'Pre-Chorus 导歌', lyricText: '忍住不哭 假装大度 地祝你幸福', emotionTag: '苦涩', emotionCategory: 'sadness', explanation: '心口不一的祝福，情绪开始积聚崩塌' },
          { id: 'yh-4', section: 'Chorus 副歌', lyricText: '以后别做朋友 朋友不能牵手', emotionTag: '伤感', emotionCategory: 'sadness', explanation: '八度大跳爆发，剖开残忍真相的催泪高潮' },
          { id: 'yh-5', section: 'Chorus 副歌', lyricText: '想爱不能爱 最寂寞 的理由', emotionTag: '心碎', emotionCategory: 'sadness', explanation: '长音托腔，撕开爱而不得的绝望痛楚' },
          { id: 'yh-6', section: 'Bridge 桥段', lyricText: '就让我保留 最后那一点点尊严', emotionTag: '坚毅', emotionCategory: 'inspirational', explanation: '在绝望中捡拾仅存的自尊与自爱' },
          { id: 'yh-7', section: 'Outro 尾声', lyricText: '最好的朋友 就走到这里', emotionTag: '释怀', emotionCategory: 'relieved', explanation: '钢琴声渐弱，为一段单向奔赴画上释怀句号' }
        ]
      },
      arrangementInstruments: ['大三角钢琴 (Grand Piano)', '弦乐四重奏 (String Quartet)', '轻流行鼓组', '电贝斯'],
      goldenRulesForImitation: [
        '【和弦】使用下行 Bass line 的经典八小节大调和弦循环',
        '【开场】以大三角钢琴单琴柱式和弦或分解和弦为核心引入',
        '【歌词】主题围绕“一种扎心的情感悖论”（如：越爱你越要远离你 / 假装不关心的关心）',
        '【旋律】副歌第一句必须有一个“六度或八度”的大跳音程，一瞬间点燃听觉点'
      ],
      suggestedNewThemes: [
        '《最熟络的陌生人》：在老同学聚会上远远相望却无法打招呼的尴尬',
        '《祝你幸福是假话》：心口不一的祝福背后的苦涩',
        '《撤回的消息》：深夜发送又立刻撤回的最后一句问候'
      ]
    }
  }
];
