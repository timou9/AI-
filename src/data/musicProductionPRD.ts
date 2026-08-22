export interface PRDSection {
  id: string;
  title: string;
  subtitle: string;
  category: 'core' | 'audience' | 'structure' | 'harmony' | 'vocal' | 'banned_words' | 'suno' | 'schema';
  content: string;
}

export const MUSIC_PRODUCER_PRD_METADATA = {
  version: 'v3.0-MASTER',
  standardName: '国际华语音乐家级 AI 音乐创作与乐理需求规格说明书 (Mandopop Master Production PRD & AI System Spec)',
  targetRoles: ['AI 大语言模型 (LLM/Gemini/GPT)', '国际华语音乐制作人 (Music Producer)', '作词/作曲/编曲家', 'Suno/Udio 提示词工程师'],
  lastUpdated: '2026-08',
  description: '将商业金曲五大指标（留存率、传播率、旋律度、传唱度、共情力）、25-40岁心理学、七夕等节点发歌策略、严格字数段落对标、发声位置规划（胸声/混声/头声/假声）、反俗套词汇库与 Suno AI 防跑偏完美标准化的工程级需求文档。',
};

export const PRD_SECTIONS: PRDSection[] = [
  {
    id: 'overview-metrics',
    title: '1. 总体设计愿景与商业金曲五大核心指标',
    subtitle: 'Commercial Mandopop Engineering & The 5 Golden Hit Metrics',
    category: 'core',
    content: `### 1.1 总体使命 (Core Mission)
构建一套能够指导 AI（大语言模型及生成式音乐模型）和专业音乐人协同创作的**“国际华语流行金曲 (Mandopop Master Standard)”**全流程乐理、文学、演唱与商业发行规范。

彻底消除 AI 生成音乐中常见的**“歌词假大空、旋律无记忆点、和声无递进、演唱无轻重缓急、烂大街词汇堆砌、Suno 乱转风格”**等行业顽疾。从一首标杆参考曲出发，精准解构其和声与律动 DNA，重构出兼具艺术美感与爆款商业潜力的华语金曲。

---

### 1.2 华语爆款商业金曲五大核心指标 (The 5 Commercial Pillars)

| 指标维度 (Pillar) | 行业定义与核心机制 | 创作落地要求与量化标准 |
| :--- | :--- | :--- |
| **1. 留存率 (Retention Rate)** | **前 3-15 秒听觉抓耳力**：决定听众是否在流媒体或短视频中滑走。 | 前奏 4-8 小节必须有**高辨识度乐器独白动机 (Motif)**；主歌第 1 句在 10 秒内切入，用具有画面感的第一人称细节直接抓住听众。 |
| **2. 传播率 (Virality & Shareability)** | **15-30 秒短视频黄金高潮**：适合二次创作、剪辑配乐与朋友圈分享。 | 副歌必须包含 1-2 句直击灵魂的**“哲理/情感金句”**，旋律具有阶梯式爬升感，方便作为短视频情感 BGM 病毒式传播。 |
| **3. 旋律好听 (Melodic Catchiness)** | **动机极简、顺耳流畅**：70% 级进 + 30% 适度跳进。 | 严禁无逻辑的乱跳乱跑；核心 Hook 由 3-5 个音符构成，节奏律动鲜明，听一遍即可在脑海中单曲循环。 |
| **4. 传唱度与好翻唱 (Singability)** | **KTV 必点、素人好驾驭**：音域控制在 1.5 个八度内。 | 避免过窄或过宽音域；高音处留出换气口，重音踩在强拍，音程大跳在人声最自然的混声区爆发，让大众容易翻唱跟唱。 |
| **5. 歌词情绪回忆共情 (Emotional Resonance)** | **代入感与情感共鸣**：引发听众对过往岁月与情感遗憾的共鸣。 | **写实微观细节代替抽象词汇**；真实描写普通人的生活处境、关系变迁或内心冲突，让听众在歌里听见自己的故事。 |

---

### 1.3 整体统一性原则 (Total Artistic Consistency)
一首成功的华语金曲必须实现**“五位一体”**的绝对统一：
- **歌名**：4-7 字，意境深邃，自带故事悬念（如《我们终究是错过》《晚风里的第三封信》）。
- **歌词主题**：通篇紧扣核心矛盾与人物处境，第一人称书信口吻，情感由克制逐步走向爆发与释怀。
- **视觉氛围**：与情绪调性严格匹配的冷暖色温与封面质感。
- **核心情绪**：悲而不伤、伤感下沉却留有温暖余温，不无病呻吟。
- **编曲风格**：乐器克制不夸张，与情绪呼吸同频共振。`,
  },
  {
    id: 'audience-calendar',
    title: '2. 目标受众画像心理学与时间节点发歌策略',
    subtitle: 'Target Audience Psychology & Marketing Release Calendar',
    category: 'audience',
    content: `### 2.1 目标受众核心画像 (25-40 岁都市男女)
- **人群特征**：经历过青春爱恋、职场沉浮、生活妥协的青年与中青年群体（25-40 岁）。
- **心理痛点**：
  - 对“未完成的情感”抱有克制的遗憾与怀念；
  - 白天理性坚强，深夜感性脆弱；
  - 渴望被理解、被治愈，拒绝空洞的说教与幼稚的无病呻吟。
- **听觉审美**：偏爱真实乐器质感（木吉他、立式钢琴、大提琴）、温暖带气声的人声诉说、层次分明的和声推进。

---

### 2.2 特定时令与节日节点营销心理学 (Seasonal Release Strategy)

| 时间节点 (Occasion) | 目标情绪共鸣点 (Emotional Trigger) | 编曲与词作调优方向 |
| :--- | :--- | :--- |
| **七夕情人节 / 情人节** | **有人甜蜜，有人落单，有人在回忆里想念**。单身/遗憾人群在节日气氛下的反差落寞与温柔自处。 | 歌词避免纯秀恩爱，多写“成全与错过的体面”；编曲采用慢速抒情 Ballad，钢琴与弦乐交织。 |
| **毕业季 (6-7 月)** | 告别同窗、异地奔波、青春散场的阵痛与祝福。 | 青春怀旧色彩，可采用卡农走向或 1645 和声，加入木吉他扫弦与轻快鼓点。 |
| **秋季与雨季 (9-11 月)** | 凉意渐浓、物是人非、落叶与雨滴引发的深沉自省。 | 伤感下沉调性，小调和弦（vi-IV-I-V）与吉他分解，人声强调气声与叹息。 |
| **深夜/独处时刻 (全年)** | 凌晨两点的不眠、加班回家的末班车、卸下面具的孤独。 | 极简配器、近场人声、低沉胸声诉说，如在耳边低语。 |`,
  },
  {
    id: 'structure-wordcount',
    title: '3. 歌词结构样式固定、字数对标与停顿呼吸工程学',
    subtitle: 'Strict Structural Alignment, Syllable Count & Pause Engineering',
    category: 'structure',
    content: `### 3.1 固定结构与段落规划 (Fixed 6-Part Structure)
华语伤感抒情金曲采用严谨的六段式黄金架构：
\`\`\`text
[Intro 前奏] ──> [Verse 1 主歌一] ──> [Verse 2 主歌二] ──> [Pre-Chorus 导歌] ──> [Chorus 1 副歌一]
  ──> [Bridge 桥段] ──> [Chorus 2 副歌二 (升调/高潮)] ──> [Outro 尾声]
\`\`\`

---

### 3.2 段落字数、行数与停顿呼吸对标表

| 段落 (Section) | 建议行数 | 单行建议字数 | 停顿/呼吸控制 (Breathing / Pause) | 写作目标与镜头规划 |
| :--- | :--- | :--- | :--- | :--- |
| **[Intro 前奏]** | 2 句 (可选短吟) | 2-4 字 (或纯乐器 8 小节) | 留白 4-8 拍，给情绪铺底 | 确立全曲调性与核心动机，勾勒特定时空背景。 |
| **[Verse 1 主歌一]** | 4-6 句 | 7-11 字 (长短句交替) | 句尾留出 1-2 拍换气，从容不迫 | **微观写实镜头**：交代具体时间、地点、物件细节与微小动作。 |
| **[Verse 2 主歌二]** | 4-6 句 | 7-11 字 (与 Verse 1 对齐) | 语气较 Verse 1 更坚定、层次丰富 | 视角推进，交代内心冲突或关系转变，不重复主歌一意象。 |
| **[Pre-Chorus 导歌]** | 2-4 句 | 6-9 字 (紧凑递进) | 缩短停顿，节奏加速，音区上移 | 情绪爬坡，使用副属和弦或减和弦，制造悬念拉力。 |
| **[Chorus 1 副歌一]** | 6-8 句 | 7-10 字 (对仗工整) | **8 小节黄金 Hook**，金句强拍卡点 | **主题立意升华**：哲理金句、情感爆发、音律密集押韵。 |
| **[Bridge 桥段]** | 2-4 句 | 8-12 字 (情绪突变) | 留白长音后接爆发撕裂高音 | **全曲情感风暴眼**：顿悟、抉择、放手，蓄满终极能量。 |
| **[Chorus 2 终极副歌]**| 6-8 句 | 7-10 字 | 升半音 (Modulation)，穿插 Ad-lib | 全编制爆发，长音延展，听觉最大峰值体验。 |
| **[Outro 尾声]** | 2-4 句 | 4-7 字 (极简收束) | 慢速衰减，大量留白与轻叹 | 故事落幕，余音回荡，给听众留下长久回味空间。 |

---

### 3.3 严格字数对称与十三辙押韵定律
- **字数对齐**：主歌对应行的字数误差不超过 ±1 个字（例如 Verse 1 第 1 句 11 字，Verse 2 第 1 句必须为 10-12 字），确保旋律节奏完美复刻。
- **十三辙押韵**：
  - 主歌通常采用 **AABB** 或 **ABCB** 抱韵；
  - 副歌必须统一在同一大辙（如言前辙 an、人辰辙 en、发花辙 a、江阳辙 ang），保证听觉冲击力。`,
  },
  {
    id: 'harmony-instrumentation',
    title: '4. 伤感下沉和声走向与克制配器工程学',
    subtitle: 'Sinking Sad Harmonies & Tasteful Organic Instrumentation',
    category: 'harmony',
    content: `### 4.1 伤感下沉四大经典和声走向 (Harmonic Blueprints)

#### 1. 经典王道抒情 4536251 (IV - V - iii - vi - ii - V - I)
- **情绪特质**：下属和弦进入，情绪柔和；iii - vi 级带来东方独有的遗憾与伤感；ii - V - I 解决平稳。
- **适用场景**：深情诉说、释怀告别（如《说谎》《修炼爱情》）。

#### 2. 卡农下行叙事 (I - V - vi - iii - IV - I - IV - V)
- **情绪特质**：低音八度平滑下行，古典庄重，带有极强的故事代入感与青春怀旧色彩。
- **适用场景**：青春遗憾、回忆重现（如《那些年》《红豆》）。

#### 3. 现代都会冷色调 6415 (vi - IV - I - V)
- **情绪特质**：关系小调起手，现代感强烈，带有释怀后的洒脱与冷色调情绪。
- **适用场景**：都市男女的情感抉择（如《体面》《年少有为》）。

#### 4. 情绪下沉借音走向 (IV - iv - I / IV - V - I - bVII)
- **情绪特质**：在副歌关键转折处使用**同主音小四度借音和弦 (iv)**（如 C 大调中的 Fm），瞬间产生“心头一酸、眼泪落下”的戏剧性下沉感。

---

### 4.2 编曲配器“克制而不夸张”三大法则 (Arrangement Rules)
1. **真实原声乐器优先**：立式钢琴 (Upright Piano) 铺底、木吉他 (Fingerstyle Acoustic Guitar) 细致分解、大提琴 (Solo Cello) 勾勒忧伤线条。
2. **节奏组渐进切入**：主歌一严禁重鼓点，使用轻柔沙锤或 Rimshot；导歌加入轻通鼓；副歌才开启完整架子鼓与深沉 Bass。
3. **空间感与环境质感**：加入低频温暖的 Analog Pad 与细腻的 Plate Reverb，严禁突兀的重金属电吉他失真或劣质 EDM 电子音效。`,
  },
  {
    id: 'vocal-placement',
    title: '5. 国际流行唱法发声位置与演唱规划指南',
    subtitle: 'Professional Vocal Delivery, Placement & Dynamics Guide',
    category: 'vocal',
    content: `### 5.1 各段落发声位置与演唱技巧规划 (Vocal Placement Chart)

| 段落 (Section) | 推荐发声位置 (Placement) | 演唱音色与咬字特征 | 情感传递目标 |
| :--- | :--- | :--- | :--- |
| **[Verse 1 主歌一]** | **低位胸声 + 气声 (Chest Voice & Breathy)** | 喉位放松，气息包裹，近距离呢喃，咬字靠前，如在耳边低语。 | 压抑克制、真实自白、毫无防备的脆弱感。 |
| **[Verse 2 主歌二]** | **实声胸声 + 轻微共鸣 (Solid Chest Voice)** | 咬字更清晰坚定，胸腔共鸣增加，减少纯气声。 | 沉淀后的回忆、故事推进、内心逐渐笃定。 |
| **[Pre-Chorus 导歌]** | **胸声向混声过渡 (Chest-to-Mix Transition)** | 音高进入换声区 (Passaggio)，声带适度闭合，语气急迫。 | 情绪爬坡、悬念蓄积、不可遏制的倾诉欲。 |
| **[Chorus 1 副歌一]** | **平衡混声 + 适度高亢 (Balanced Mixed Voice)** | 鼻咽腔共鸣充沛，高音处真声比例占 70%，字字饱满。 | 情感全面引爆、金句穿透力、深情宣泄。 |
| **[Bridge 桥段]** | **强混声 / 撕裂高音 / 弱化假声 (Belt & Falsetto)** | 在极限音高处使用真假音快速切换，或带有颗粒感的撕裂音。 | 全曲情感风暴眼、顿悟、痛苦抉择与彻底放手。 |
| **[Chorus 2 终极副歌]**| **高位置头声混声 + 伴唱 Ad-lib (Head Mix & Ad-lib)**| 升调演唱，穿插长音延展与背景高音吟唱。 | 达到听觉峰值、悲壮与释怀交织的宏大感。 |
| **[Outro 尾声]** | **极弱气声 + 叹息音 (Airy Whispering & Sighs)** | 气息完全放松，尾音自然下落衰减，字句留白。 | 尘埃落定、释怀释然、长久的余味与沉思。 |

---

### 5.2 演唱调控关键指标
- **咬字清晰度**：华语讲究“字正腔圆”，声母有力、韵母归韵饱满，严禁吞字。
- **声律顺向**：歌词字调的高低走势必须与旋律音高走势同向，杜绝因音调相反产生的“倒字”现象。`,
  },
  {
    id: 'banned-words-imagery',
    title: '6. 反俗套文学意象库与严禁烂大街词汇清单',
    subtitle: 'Anti-Cliché Lexicon & Fresh Cinematic Imagery Standards',
    category: 'banned_words',
    content: `### 6.1 严禁使用的“烂大街 / 假大空”词汇清单 (Banned Clichés)
在创作中，**严禁**未经深度语境设计直接堆砌以下泛滥词汇：

❌ **禁止无动机空泛堆砌**：
- \`街头\`、\`路灯\`、\`影子\`、\`黄昏\`、\`咖啡\`、\`时钟\`、\`落叶\`、\`眼泪\`、\`天空\`、\`酒精\`、\`烟头\`、\`雨夜\`、\`拥抱\`、\`心痛\`、\`窒息\`、\`撕心裂肺\`、\`迷茫\`、\`悲伤\`、\`孤独\`。

---

### 6.2 优秀替代方案：微观写实镜头与具象生活细节 (Cinematic Replacements)

| 俗套空泛表达 (Bad Cliché) | 国际音乐人级具象镜头重写 (Pro Cinematic Replacement) |
| :--- | :--- |
| *“在空荡的街头喝着冷咖啡，看着黄昏的影子”* | *“外卖单上的免密支付还没解绑，便利店关东煮的白气模糊了玻璃”* |
| *“我的眼泪流下来，心里很悲伤”* | *“整理旧抽屉时，那张退磁的门禁卡在掌心硌出红印”* |
| *“看着时钟走过，回忆我们的拥抱”* | *“微信对话框里删掉了三次‘最近好吗’，最终只发出了天气预报”* |
| *“天空下起了雨，我感到非常孤独”* | *“玄关处那把备用伞积了层薄灰，出门时下意识把手缩进袖口”* |

---

### 6.3 华语金曲文学叙事“三层进阶法”
1. **第一层（主歌）：物与动作** —— 用一件物品、一个微小动作交代处境（如“未洗的杯子”、“系错的纽扣”）。
2. **第二层（导歌）：时间与心理** —— 展现心理矛盾与时间流动（如“三年零四个月的习惯，一秒钟被推翻”）。
3. **第三层（副歌）：人生哲理** —— 提炼出超越具体事件的普适人生感悟（如“原来所有的体面退场，都是耗尽心力的成全”）。`,
  },
  {
    id: 'suno-parameters',
    title: '7. Suno AI / Udio 提示词工程与防跑偏控制矩阵',
    subtitle: 'Suno AI Anti-Drift Suite, Metatags & Parameter Constraints',
    category: 'suno',
    content: `### 7.1 Suno Style Prompt 120 字符黄金公式
Suno Style 提示词输入框有约 120 字符限制。最有效的防跑偏公式为：
\`\`\`text
[流派主风格] + [核心音色乐器] + [人声质感] + [BPM 节拍] + [情绪基调]
\`\`\`
- **标准范例 1 (伤感民谣/流行)**：\`mandopop ballad, grand piano, acoustic guitar, warm intimate male vocal, 84 bpm, emotional, bittersweet\`
- **标准范例 2 (都市流行/女声)**：\`mandopop, synth-pop, digital keyboard, clean young female vocal, 130 bpm, romantic, yearning\`

---

### 7.2 结构元标签 (Structural Metatags) 注入规范
在歌词输入框中，必须在每个段落开头强制注入结构与发声动态标签：
\`\`\`text
[Intro: Atmospheric synth opening, clear breathy narration]

[Verse 1: Intimate breathy chest voice, minimal acoustic guitar]
抽屉里那张褪了色的旧相片
记录着当时稚嫩的侧脸
灰尘静静堆叠
故事还没写完结

[Pre-Chorus: Steady percussion drive, chest-to-mix transition]
钟摆在催促着最后的妥协
谁在回忆里越走越遥远

[Chorus: Dense synth-pop, powerful mixed voice release, soaring hook]
我们用尽全力学会了释怀
却在人海茫茫中弄丢了依赖

[Bridge: Passionate belt & dramatic buildup]
如果时间能够重来 哪怕跌入深渊尘埃

[Outro: Slow fade out, airy whispering sigh]
晚安 那些未能说出口的爱
[Fade Out]
[End]
\`\`\`

---

### 7.3 Suno AI 官方参数防跑偏黄金比

| 参数项 (Parameter) | 推荐区间 (Golden Value) | 防跑偏控制机理 (Anti-Drift Purpose) |
| :--- | :--- | :--- |
| **Style Guidance Weight (风格跟随度)** | **80% - 90%** | 高约束力：强迫 AI 严格遵循给定的和声与流派配方，杜绝自动转变为劣质 EDM 或违和摇滚。 |
| **Weirdness / Randomness (离散随机度)** | **15% - 25%** | 低随机性：保证副歌与主歌旋律走向平稳顺畅，避免产生刺耳音符或爆音杂音。 |
| **Negative Prompt (排除风格 / Avoid Tags)** | \`no auto-tune, no heavy rock, no EDM drop, no shouting, no harsh distortion\` | 彻底封堵电音过度修音、刺耳嘶吼或突兀重低音打击。 |`,
  },
  {
    id: 'system-schema',
    title: '8. AI 系统交互契约与标准 JSON 输出规范',
    subtitle: 'Machine-Readable JSON Contract for LLM & Generation Pipeline',
    category: 'schema',
    content: `### 8.1 标准生成契约 (Standard Machine-Readable JSON Schema)
AI 在执行歌曲分析或仿写时，必须严格遵守以下类型契约：

\`\`\`json
{
  "title": "新歌名称 (4-7 字具备华语金曲质感)",
  "subtitle": "副标题 / 情感金句",
  "genreAndMood": "流派与情感标签 (如: 流行抒情 / 84 BPM / 伤感下沉)",
  "tempoAndKey": "BPM 84 / G Major",
  "commercialMetrics": {
    "retentionStrategy": "前奏 4 小节木吉他极简单音开场，10 秒内主歌切入抓耳",
    "viralHookSnippet": "副歌 8 小节金句：‘原来所有体面的离开，都是耗尽心力的成全’",
    "singabilityScore": "音域 1.5 个八度 (C4-G5)，适合大众与短视频翻唱"
  },
  "structuralBlueprint": [
    {
      "sectionName": "Verse 1",
      "energy": 3,
      "vocalPlacement": "低位胸声 + 气声诉说 (Chest Voice & Breathy)",
      "chordsUsed": ["G", "D/F#", "Em7", "Cadd9"],
      "lines": [
        { "lineText": "抽屉里那张褪了色的旧相片", "chords": "G      D/F#", "rhymeTag": "言前辙 (an)", "syllableCount": 11, "expressionTip": "低沉呢喃，近麦克风" },
        { "lineText": "记录着当时稚嫩的侧脸", "chords": "Em7    Cadd9", "rhymeTag": "言前辙 (an)", "syllableCount": 9, "expressionTip": "轻声叹息" }
      ],
      "performanceNote": "主歌压抑克制，严禁大声呐喊"
    },
    {
      "sectionName": "Chorus",
      "energy": 9,
      "vocalPlacement": "平衡混声 + 高亢混声 (Balanced Mixed Voice)",
      "chordsUsed": ["Cadd9", "D", "Bm7", "Em7", "Am7", "D", "G"],
      "lines": [
        { "lineText": "我们用尽全力 学会了释怀", "chords": "Cadd9    D", "rhymeTag": "怀来辙 (ai)", "syllableCount": 10, "expressionTip": "混声爆发，真假音交替" },
        { "lineText": "却在人海茫茫中 丢失了依赖", "chords": "Bm7     Em7", "rhymeTag": "怀来辙 (ai)", "syllableCount": 11, "expressionTip": "长音延展" }
      ],
      "performanceNote": "8 小节黄金 Hook，全配器高潮推进"
    }
  ],
  "aiMusicPrompt": {
    "sunoPrompt": "mandopop ballad, grand piano, acoustic guitar, warm male vocal, 84 bpm, emotional, bittersweet",
    "sunoParameters": {
      "styleTags": "mandopop ballad, grand piano, acoustic guitar, warm male vocal, 84 bpm, emotional",
      "vocalSettings": "Warm intimate male vocal, gentle breathiness",
      "instrumentation": "Fingerstyle acoustic guitar, grand piano, solo cello",
      "tempoBpm": 84,
      "styleGuidanceWeight": 85,
      "creativityRandomness": 25,
      "negativePrompt": "no auto-tune, no heavy rock, no EDM drop, no shouting"
    }
  }
}
\`\`\``,
  },
];
