import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ limit: '100mb', extended: true }));

  // Initialize Gemini API client
  const getAiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is missing in environment variables.');
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // API Endpoint: Recognize Media (Audio / Video File Auto-Identification)
  app.post('/api/recognize-media', async (req, res) => {
    try {
      const { mediaFile } = req.body;

      if (!mediaFile || !mediaFile.data || !mediaFile.mimeType) {
        return res.status(400).json({ error: '请上传有效的音频(MP3/WAV/M4A等)或视频(MP4等)文件。' });
      }

      const ai = getAiClient();

      const promptText = `你是顶级音乐识别AI与专业音乐制作人。
请仔细倾听与分析附件中的音视频文件内容（文件名: ${mediaFile.fileName || '已上传媒体文件'}）。
请自动识别或分析出该音视频曲目的以下基础信息：

1. songTitle: 歌曲/曲目标题 (如果识别出是已知金曲请给出原歌名；如果是原创/演奏曲且无法识别，请根据曲风给出一个优雅专业的暂定标题)
2. artist: 歌手/演唱者/演奏家 (如识别出原唱请填入，否则填"未知/原创")
3. genre: 曲风/流派 (例如: Pop / R&B / 民谣 / 摇滚 / Synth-Pop / 电子 / 古风)
4. tempoBpm: 估算 BPM 速度数字 (如 84, 120, 96)
5. musicalKey: 估算主调性 (例如 "G Major", "A Minor", "C Major")
6. lyrics: 从音视频中辨识到的歌词文本/片段 (如果是纯音乐/演奏曲，请填写"[纯音乐 / 无歌词演奏曲]")
7. audioDescription: 音效听感与编曲亮点深度总结 (例如：以木吉他扫弦开场，主歌人声亲切低沉，副歌有层层推进的弦乐与切分鼓点，空间感饱满)

请严格按 JSON 格式输出：`;

      const contents: any[] = [
        {
          inlineData: {
            mimeType: mediaFile.mimeType,
            data: mediaFile.data,
          },
        },
        {
          text: promptText,
        },
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: contents,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              songTitle: { type: Type.STRING },
              artist: { type: Type.STRING },
              genre: { type: Type.STRING },
              tempoBpm: { type: Type.INTEGER },
              musicalKey: { type: Type.STRING },
              lyrics: { type: Type.STRING },
              audioDescription: { type: Type.STRING },
            },
            required: ['songTitle', 'artist', 'genre', 'tempoBpm', 'musicalKey', 'lyrics', 'audioDescription'],
          },
        },
      });

      const recognitionData = JSON.parse(response.text || '{}');
      res.json({ success: true, data: recognitionData });
    } catch (err: any) {
      console.error('Error recognizing media:', err);
      res.status(500).json({ error: err?.message || '自动识别音视频文件失败，请重试。' });
    }
  });

  // API Endpoint: Analyze Song
  app.post('/api/analyze-song', async (req, res) => {
    try {
      const { songTitle, artist, lyrics, audioDescription, genre, mediaFile } = req.body;

      if (!songTitle && !lyrics && !audioDescription && (!mediaFile || !mediaFile.data)) {
        return res.status(400).json({ error: '请提供歌曲名称、歌词、描述内容或上传 MP3/MP4 音视频文件。' });
      }

      const ai = getAiClient();

      const promptText = `你是华语与国际顶尖乐理专家、著名音乐制作人与词曲创作者。
请全面深度分析以下歌曲/音视频文件的音乐特点，并提取适合“仿写创作（Songwriting Imitation）”的核心 Blueprint：

【歌曲/媒体信息】
- 歌名: ${songTitle || '请根据音视频自动判定'}
- 歌手/艺术家: ${artist || '请根据音视频自动判定'}
- 曲风/流派: ${genre || '请根据音视频自动识别'}
- 歌词/描述/文本:
"""
${lyrics || audioDescription || '请结合音视频中的音频流与人声进行深度乐理拆解与全维度分析。'}
"""
${mediaFile ? `[提示: 已附带名为 ${mediaFile.fileName || '音视频文件'} 的多媒体文件，请仔细识别音频中的和弦走向、节奏BPM、曲式、编曲乐器与人声旋律路线]` : ''}

请严格按照以下 JSON Schema 输出分析结果：
1. songTitle: 歌曲名称
2. artist: 歌手/艺术家
3. genre: 曲风流派
4. tempoBpm: 大致 BPM 速度 (数字，例如 84)
5. musicalKey: 主调性 (例如 "G Major", "A Minor")
6. vibeMood: 4个情绪/氛围标签数组 (例如 ["青春怀旧", "酸甜回忆", "木吉他质感", "淡淡遗憾"])
7. structure: 曲式结构数组 [{ section: "Section名", bars: 小节数, function: "功能说明", energyLevel: 1-10能量值 }]
8. chordProgressions: 和声走向数组 [{ name: "名称", chords: ["和弦1", "和弦2"...], romanNumerals: "罗马数字级进", emotionalEffect: "情绪听感" }]
9. melodicCharacteristics: 旋律与律动特点数组 (4条专业分析)
10. lyricCrafting: 歌词工艺对象 { rhymeScheme: "押韵模式", coreMetaphors: ["意象1", "意象2"], themeSummary: "核心主题", sentenceStructure: "句式律动", annotatedLyrics: [{ id: "l-1", section: "Verse 1 主歌", lyricText: "歌词文本", emotionTag: "伤感/励志/愤怒/怀旧/甜蜜/迷茫/释怀/期待", explanation: "情绪解析" }] }
11. arrangementInstruments: 核心编曲乐器数组 (5种乐器)
12. goldenRulesForImitation: 5条最核心、最具体可操作的仿写黄金法则 (【和弦】、【前奏】、【歌词】、【旋律】、【编曲】)
13. suggestedNewThemes: 3个由该歌曲衍生出的全新仿写创意主题`;

      const contents: any[] = [];
      if (mediaFile && mediaFile.data && mediaFile.mimeType) {
        contents.push({
          inlineData: {
            mimeType: mediaFile.mimeType,
            data: mediaFile.data,
          },
        });
      }
      contents.push({ text: promptText });

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: contents,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              songTitle: { type: Type.STRING },
              artist: { type: Type.STRING },
              genre: { type: Type.STRING },
              tempoBpm: { type: Type.INTEGER },
              musicalKey: { type: Type.STRING },
              vibeMood: { type: Type.ARRAY, items: { type: Type.STRING } },
              structure: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    section: { type: Type.STRING },
                    bars: { type: Type.INTEGER },
                    function: { type: Type.STRING },
                    energyLevel: { type: Type.INTEGER },
                  },
                  required: ['section', 'bars', 'function', 'energyLevel'],
                },
              },
              chordProgressions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    chords: { type: Type.ARRAY, items: { type: Type.STRING } },
                    romanNumerals: { type: Type.STRING },
                    emotionalEffect: { type: Type.STRING },
                  },
                  required: ['name', 'chords', 'romanNumerals', 'emotionalEffect'],
                },
              },
              melodicCharacteristics: { type: Type.ARRAY, items: { type: Type.STRING } },
              lyricCrafting: {
                type: Type.OBJECT,
                properties: {
                  rhymeScheme: { type: Type.STRING },
                  coreMetaphors: { type: Type.ARRAY, items: { type: Type.STRING } },
                  themeSummary: { type: Type.STRING },
                  sentenceStructure: { type: Type.STRING },
                  annotatedLyrics: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        section: { type: Type.STRING },
                        lyricText: { type: Type.STRING },
                        emotionTag: { type: Type.STRING },
                        explanation: { type: Type.STRING },
                      },
                      required: ['id', 'lyricText', 'emotionTag'],
                    },
                  },
                },
                required: ['rhymeScheme', 'coreMetaphors', 'themeSummary', 'sentenceStructure'],
              },
              arrangementInstruments: { type: Type.ARRAY, items: { type: Type.STRING } },
              goldenRulesForImitation: { type: Type.ARRAY, items: { type: Type.STRING } },
              suggestedNewThemes: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: [
              'songTitle',
              'artist',
              'genre',
              'tempoBpm',
              'musicalKey',
              'vibeMood',
              'structure',
              'chordProgressions',
              'melodicCharacteristics',
              'lyricCrafting',
              'arrangementInstruments',
              'goldenRulesForImitation',
              'suggestedNewThemes',
            ],
          },
        },
      });

      const analysisData = JSON.parse(response.text || '{}');
      res.json({ success: true, data: analysisData });
    } catch (err: any) {
      console.error('Error analyzing song:', err);
      res.status(500).json({ error: err?.message || '分析歌曲时出错，请重试。' });
    }
  });

  // API Endpoint: Generate Imitation Song Blueprint
  app.post('/api/generate-imitation', async (req, res) => {
    try {
      const { analysisData, userCustomization } = req.body;

      if (!analysisData) {
        return res.status(400).json({ error: '缺少原歌曲分析数据。' });
      }

      const ai = getAiClient();

      const levelMap: Record<string, string> = {
        light: '【轻度仿写】: 提炼原曲的情绪氛围与意象色彩，重新创作全新的和声走向与叙事结构。保持 20%-30% 原曲神韵，属于高自由度的灵感拓展仿写。',
        medium: '【中度仿写 (推荐)】: 严格继承原曲的核心和声走向、段落布局与情感起伏逻辑，但歌词意象、韵脚与旋律保持全新的独立原创，达到 50%-70% 的经典神韵契合。',
        exact: '【1:1 还原 (极致复刻)】: 1:1 精确复刻对齐原曲的小节数、和弦级数走向（如卡农4536251走向等）与歌词逐句断句字数押韵节奏！实现乐理架构与声韵框架的 100% 完美模版对应替换！',
      };
      const levelGuide = levelMap[userCustomization?.imitationLevel || 'medium'] || levelMap['medium'];

      const prompt = `你是顶级金曲制作人与作词作曲家。
请基于原歌曲《${analysisData.songTitle}》（风格: ${analysisData.genre}, 键位: ${analysisData.musicalKey}, BPM: ${analysisData.tempoBpm}）的分析特征与仿写公式：
仿写法则: ${JSON.stringify(analysisData.goldenRulesForImitation)}

创作一首【全新的同风格原创歌曲】（Imitation Original Song Blueprint）：

【仿写强度要求】
${levelGuide}

【用户自定义需求】
- 新歌标题: ${userCustomization?.newTitle || '自动创作一个有感染力的新歌名'}
- 新歌故事/主题概念: ${userCustomization?.newThemeTopic || '由AI根据原歌氛围自动构思同风格感人主题'}
- 目标情绪氛围: ${userCustomization?.targetMood || analysisData.vibeMood?.join('/') || '感人'}
- 目标调性与速度: ${userCustomization?.desiredKey || analysisData.musicalKey}, BPM ${userCustomization?.tempoAdjustment || analysisData.tempoBpm}
- 创作语言: ${userCustomization?.language || '中文'}

要求：
1. 歌词必须完整、精美，包含 Verse 1, Verse 2, Pre-Chorus, Chorus, Bridge, Outro。
2. 每句歌词上面标注推荐弹唱和弦 (chords) 与押韵标记 (rhymeTag)。
3. 根据【仿写强度要求】对齐原歌的和声走向逻辑与押韵韵律，歌词意象与故事必须是全新的原创作品，决不抄袭原词。
4. 提供 8 个小节的副歌 Hook 旋律音符预览数据（用于网页内置钢琴音效播放预览，音符格式如 "C4", "E4", "G4", "A4", "B4", "C5"）。
5. 提供详细的 Suno AI / Udio AI 提示词、Suno 防跑偏全套调节参数 (Suno Parameters Suite) 与 DAW 编曲指南。

请严格返回 JSON 格式：
{
  "title": "新歌歌名",
  "subtitle": "副标题/一句话文案",
  "imitationLevel": "${userCustomization?.imitationLevel === 'exact' ? '1:1 还原 (极致复刻)' : userCustomization?.imitationLevel === 'light' ? '轻度仿写 (灵感拓展)' : '中度仿写 (平衡模式)'}",
  "genreAndMood": "曲风与氛围描述",
  "tempoAndKey": "BPM 84 / G大调",
  "originalInspiration": "致敬并继承自《${analysisData.songTitle}》的XXX元素",
  "structuralBlueprint": [
    {
      "sectionName": "Verse 1",
      "energy": 4,
      "chordsUsed": ["G", "D/F#", "Em", "C"],
      "lines": [
        { "lineText": "歌词文本...", "chords": "G       D/F#      Em", "rhymeTag": "a", "expressionTip": "低沉叙事，如耳边呢喃" }
      ],
      "performanceNote": "演唱指导说明"
    }
  ],
  "chordProgressionGuide": [
    {
      "sectionName": "副歌段和弦",
      "chords": ["Cadd9", "D", "Bm7", "Em7"],
      "romanNumerals": "IV - V - iii - vi",
      "noteFrequencies": [261.63, 293.66, 246.94, 329.63]
    }
  ],
  "melodyHookNotes": [
    { "pitch": "G4", "duration": "4n", "lyricWord": "雨", "timeOffset": 0 },
    { "pitch": "A4", "duration": "4n", "lyricWord": "后", "timeOffset": 0.5 },
    { "pitch": "B4", "duration": "2n", "lyricWord": "天", "timeOffset": 1.0 },
    { "pitch": "D5", "duration": "2n", "lyricWord": "晴", "timeOffset": 2.0 }
  ],
  "arrangementGuide": {
    "introStyle": "前奏编曲建议",
    "verseBuild": "主歌仪器铺垫",
    "chorusExplosion": "副歌高潮编曲爆发",
    "outroFade": "尾声收束方式"
  },
  "aiMusicPrompt": {
    "sunoPrompt": "适合输入给 Suno AI 的 Style Prompt (必须控制在 120 字符内，英文/混用，如: mandopop, acoustic guitar, soft piano, warm male vocal, 84 bpm, bittersweet, emotional)",
    "udioPrompt": "适合输入给 Udio AI 的 Prompt",
    "dawNotes": "Logic/Cubase/Ableton 制作建议",
    "sunoParameters": {
      "styleTags": "mandopop, acoustic guitar, soft piano, warm male vocal, 84 bpm, emotional",
      "vocalSettings": "Warm intimate male vocal, gentle breathiness",
      "instrumentation": "Fingerpicking acoustic guitar, grand piano, solo cello, soft brushes percussion",
      "tempoBpm": 84,
      "timeSignature": "4/4",
      "musicalKey": "G Major",
      "genreMain": "流行 / 民谣 / 感人抒情",
      "moodAtmosphere": "感人怀旧 / 淡淡遗憾 / 渐进高潮",
      "styleGuidanceWeight": 85,
      "creativityRandomness": 25,
      "negativePrompt": "no auto-tune, no heavy rock, no EDM drop, no shouting, no harsh synth",
      "structuralMetatags": [
        { "sectionTag": "[Verse 1 - Soft Acoustic Guitar]", "promptInstruction": "前奏纯木吉他，低沉呢喃人声开场" },
        { "sectionTag": "[Chorus - Emotional Belt & Piano]", "promptInstruction": "大钢琴与弦乐加入，情绪全面爆发" }
      ],
      "antiDriftTips": [
        "在 Suno 歌词框中使用 [Verse 1]、[Chorus] 等中括号结构标记，约束 AI 生成正确的曲式结构",
        "将 Style Guidance Weight 设为 80-90%，防止 AI 擅自改变流派曲风",
        "填入负向排除词 Avoid Tags (no EDM, no shouting) 彻底杜绝失真爆音或电音跑偏"
      ]
    }
  }
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              subtitle: { type: Type.STRING },
              imitationLevel: { type: Type.STRING },
              genreAndMood: { type: Type.STRING },
              tempoAndKey: { type: Type.STRING },
              originalInspiration: { type: Type.STRING },
              structuralBlueprint: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    sectionName: { type: Type.STRING },
                    energy: { type: Type.INTEGER },
                    chordsUsed: { type: Type.ARRAY, items: { type: Type.STRING } },
                    lines: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          lineText: { type: Type.STRING },
                          chords: { type: Type.STRING },
                          rhymeTag: { type: Type.STRING },
                          expressionTip: { type: Type.STRING },
                        },
                        required: ['lineText', 'chords'],
                      },
                    },
                    performanceNote: { type: Type.STRING },
                  },
                  required: ['sectionName', 'energy', 'chordsUsed', 'lines', 'performanceNote'],
                },
              },
              chordProgressionGuide: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    sectionName: { type: Type.STRING },
                    chords: { type: Type.ARRAY, items: { type: Type.STRING } },
                    romanNumerals: { type: Type.STRING },
                  },
                  required: ['sectionName', 'chords', 'romanNumerals'],
                },
              },
              melodyHookNotes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    pitch: { type: Type.STRING },
                    duration: { type: Type.STRING },
                    lyricWord: { type: Type.STRING },
                    timeOffset: { type: Type.NUMBER },
                  },
                  required: ['pitch', 'duration', 'lyricWord', 'timeOffset'],
                },
              },
              arrangementGuide: {
                type: Type.OBJECT,
                properties: {
                  introStyle: { type: Type.STRING },
                  verseBuild: { type: Type.STRING },
                  chorusExplosion: { type: Type.STRING },
                  outroFade: { type: Type.STRING },
                },
                required: ['introStyle', 'verseBuild', 'chorusExplosion', 'outroFade'],
              },
              aiMusicPrompt: {
                type: Type.OBJECT,
                properties: {
                  sunoPrompt: { type: Type.STRING },
                  udioPrompt: { type: Type.STRING },
                  dawNotes: { type: Type.STRING },
                  sunoParameters: {
                    type: Type.OBJECT,
                    properties: {
                      styleTags: { type: Type.STRING },
                      vocalSettings: { type: Type.STRING },
                      instrumentation: { type: Type.STRING },
                      tempoBpm: { type: Type.INTEGER },
                      timeSignature: { type: Type.STRING },
                      musicalKey: { type: Type.STRING },
                      genreMain: { type: Type.STRING },
                      moodAtmosphere: { type: Type.STRING },
                      styleGuidanceWeight: { type: Type.INTEGER },
                      creativityRandomness: { type: Type.INTEGER },
                      negativePrompt: { type: Type.STRING },
                      structuralMetatags: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            sectionTag: { type: Type.STRING },
                            promptInstruction: { type: Type.STRING },
                          },
                          required: ['sectionTag', 'promptInstruction'],
                        },
                      },
                      antiDriftTips: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: [
                      'styleTags',
                      'vocalSettings',
                      'instrumentation',
                      'tempoBpm',
                      'timeSignature',
                      'musicalKey',
                      'genreMain',
                      'moodAtmosphere',
                      'styleGuidanceWeight',
                      'creativityRandomness',
                      'negativePrompt',
                      'antiDriftTips',
                    ],
                  },
                },
                required: ['sunoPrompt', 'udioPrompt', 'dawNotes'],
              },
            },
            required: [
              'title',
              'subtitle',
              'genreAndMood',
              'tempoAndKey',
              'originalInspiration',
              'structuralBlueprint',
              'chordProgressionGuide',
              'melodyHookNotes',
              'arrangementGuide',
              'aiMusicPrompt',
            ],
          },
        },
      });

      const blueprint = JSON.parse(response.text || '{}');
      res.json({ success: true, data: blueprint });
    } catch (err: any) {
      console.error('Error generating imitation song:', err);
      res.status(500).json({ error: err?.message || '生成仿写 Blueprint 时出错，请重试。' });
    }
  });

  // API Endpoint: Rhyme & Line Polish Helper
  app.post('/api/rhyme-helper', async (req, res) => {
    try {
      const { line, targetRhyme, style } = req.body;
      const ai = getAiClient();

      const prompt = `你是资深填词人。请为这句歌词"${line}"提供 4 种不同韵脚或表达风格的优质改写/润色选项，目标韵脚为 ${targetRhyme || '推荐同韵'}，风格为 ${style || '流行感人'}:
返回 JSON 对象，键为 options (字符串数组)。`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['options'],
          },
        },
      });

      const data = JSON.parse(response.text || '{}');
      res.json({ success: true, options: data.options || [] });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || '润色建议出错。' });
    }
  });

  // Mount Vite middleware in development or static serve in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎵 AI Song Analysis & Co-Writer Studio Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
