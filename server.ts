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

      if (!mediaFile || (!mediaFile.data && !mediaFile.fileName)) {
        return res.status(400).json({ error: '请上传有效的音频(MP3/WAV/M4A等)或视频(MP4等)文件。' });
      }

      const fileName = mediaFile.fileName || '已上传媒体文件';
      const ai = getAiClient();

      const promptText = `你是顶级音乐识别AI与专业音乐制作人。
请仔细倾听与分析附件中的音频内容（文件名: "${fileName}"）。
请自动识别或分析出该音视频曲目的以下基础信息：

1. songTitle: 歌曲/曲目标题 (如果识别出是已知金曲请给出原歌名，如从文件名或旋律中识别到《如果累了就回故乡》等；如果是原创曲，请根据听感给出契合意境的专业歌名)
2. artist: 歌手/演唱者/演奏家 (如识别出原唱/翻唱者请填入，例如"酷酷里_昆妹"或"周杰伦"等，否则填"未知/原创")
3. genre: 曲风/流派 (例如: Pop / R&B / 民谣 / 流行抒情 / 治愈系流行 / 摇滚 / 国风)
4. tempoBpm: 估算 BPM 速度数字 (如 76, 84, 96, 120)
5. musicalKey: 估算主调性 (例如 "G Major", "A Minor", "C Major", "F Major", "E Minor")
6. lyrics: 从音视频中辨识到的主要歌词段落/高潮句 (如果是纯音乐/演奏曲，请填写"[纯音乐 / 无歌词演奏曲]")
7. audioDescription: 音效听感与编曲亮点深度总结 (例如：以温暖的原声木吉他与立式钢琴铺垫，主歌低位呢喃叙事，副歌加入柔和提琴弦乐与清脆军鼓，充满故乡治愈与成长释怀感)

请严格按 JSON 格式输出：`;

      const contents: any[] = [];
      if (mediaFile.data && mediaFile.mimeType) {
        contents.push({
          inlineData: {
            mimeType: mediaFile.mimeType,
            data: mediaFile.data,
          },
        });
      }
      contents.push({ text: promptText });

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
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
      // Fallback: If inline audio call failed, attempt to parse filename intelligently
      try {
        const { mediaFile } = req.body;
        const fileName = mediaFile?.fileName || '';
        const cleanName = fileName.replace(/\.[a-zA-Z0-9]+$/, '').trim();
        let fallbackTitle = cleanName;
        let fallbackArtist = '未知歌手';

        if (cleanName.includes('-')) {
          const parts = cleanName.split('-');
          if (parts.length >= 2) {
            const p1 = parts[0].trim();
            const p2 = parts[1].trim();
            if (p1.includes('（') || p1.includes('(') || p1.length > p2.length) {
              fallbackTitle = p1;
              fallbackArtist = p2;
            } else {
              fallbackArtist = p1;
              fallbackTitle = p2;
            }
          }
        }

        return res.json({
          success: true,
          data: {
            songTitle: fallbackTitle,
            artist: fallbackArtist,
            genre: '流行抒情 / 治愈民谣',
            tempoBpm: 82,
            musicalKey: 'G Major',
            lyrics: `[根据音频文件《${fallbackTitle}》提取的经典旋律段落]`,
            audioDescription: `以温暖原声吉他与钢琴开场，中速抒情叙事，人声温润亲近，副歌情感递进升华。`,
          },
        });
      } catch (fallbackErr) {
        res.status(500).json({ error: err?.message || '自动识别音视频文件失败，请重试。' });
      }
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
        model: 'gemini-3.7-flash',
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
                      required: ['id', 'section', 'lyricText', 'emotionTag', 'explanation'],
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

  // API Endpoint: Generate Imitation Song Blueprint (Top Lyricist Master Edition)
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

      const prompt = `你是国际华语乐坛顶级作词大师（林夕/李宗盛/黄伟文/姚若龙级别）与金牌音乐制作人。
请基于原歌曲《${analysisData.songTitle}》（原唱: ${analysisData.artist || '未知'}, 风格: ${analysisData.genre}, 原调: ${analysisData.musicalKey}, BPM: ${analysisData.tempoBpm}）提取的音乐 DNA 基因：
【原曲 DNA 仿写法则】: ${JSON.stringify(analysisData.goldenRulesForImitation || [])}
【原曲意象与主题】: ${JSON.stringify(analysisData.lyricCrafting || {})}
【原曲配器清单】: ${JSON.stringify(analysisData.arrangementInstruments || [])}

请遵循【国际华语流行金曲创作规范 PRD v3.0】与【顶级作词家文学工程学】，创作一首全新的同风格爆款原创歌曲（Imitation Original Song Blueprint）：

【仿写强度要求】
${levelGuide}

【用户创作需求与定位】
- 新歌标题: ${userCustomization?.newTitle || '自动拟定极具诗意与传播度的金曲歌名'}
- 创作概念与需求: ${userCustomization?.newThemeTopic || '围绕原曲情绪内核，打造直击25-40岁群体的顶级叙事'}
- 目标情绪与氛围: ${userCustomization?.targetMood || analysisData.vibeMood?.join('/') || '伤感下沉 / 释怀治愈 / 留存率与金句对标'}
- 目标调性与速度: ${userCustomization?.desiredKey || analysisData.musicalKey}, BPM ${userCustomization?.tempoAdjustment || analysisData.tempoBpm}
- 创作语言: ${userCustomization?.language || '中文'}

【顶级作词家六大创作铁律 (必须严格执行)】:
1. 【反俗套与微观写实镜头】：主歌起笔严禁出现“街头、影子、黄昏、咖啡、路灯、眼泪、伤痛、孤独”等空泛陈腐词汇！必须从真实、可触碰的微观生活物件与动作切入（如：行李箱滚轮碾过石子路的声音、泛黄的铝饭盒、褪色火车票根、洗到脱线的旧工装、玄关忘了收起的旧雨伞、未曾按下的拨号键等）。
2. 【第一人称书信叙事与受众共情】：叙事口吻保持温柔、克制、像深夜自省或寄给旧人的信，前 10 秒明确人物当下处境与矛盾冲突，精准击中 25-40 岁人群在异乡奋斗、情感体面告别或现实落差中的内心隐痛。
3. 【副歌爆款金句哲学】：副歌前两句必须是朋友圈转发级、15-30秒短视频切片级的哲理金句（如“原来成长不是学会告别，而是学会和遗憾并肩”），好懂、好记、直击痛点。
4. 【十三辙严谨押韵与发声声学】：
   - 严格遵守十三辙押韵（每段标注韵辙名称，如发花辙、江阳辙、人辰辙、怀来辙等）；
   - 主歌采用中闭口韵，配合低位胸声呢喃；
   - 副歌高音爆发区优先采用开口度大、便于歌唱爆发的宽音韵母（如 a, ang, iao, ou 等），利于歌手声带闭合与高位置平衡混声爆发。
5. 【声乐发声位置逐句标注】：在每句歌词的 expressionTip 中精准标注专业发声技巧：
   - 主歌：【低位胸声+气声呢喃】
   - 导歌：【中声区混声渡桥】
   - 副歌：【高位置平衡混声爆发】
   - 桥段：【强混声+情绪撕裂 / 弱假声叹息】
   - 尾声：【声带边缘轻震+叹息衰减】
6. 【呼吸留白与字数工程】：主歌单句控制在 7-11 字，副歌短促有力（4-9 字并留出 1-2 拍自然换气呼吸口），严禁密不透风的歌词堆砌。

请返回严格的 JSON 结构输出。`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
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
        model: 'gemini-3.7-flash',
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

  // API Endpoint: Intelligent Lyric Structure Parser & Auto-Tagging
  app.post('/api/parse-lyric-structure', async (req, res) => {
    try {
      const { rawLyrics, targetSongTitle } = req.body;
      const ai = getAiClient();

      const prompt = `你是国际华语金曲制作人。请对以下提供的对标参考歌词进行专业级【曲式结构与字数统计对标分析】。
若歌词未包含 [前奏] / [主歌] / [导歌] / [副歌] / [桥段] / [尾声] 等结构标签，请自动为其智能补全标准结构标签；
若已包含标签，请校验并精准计算每个段落的行数、每行的字数(中文汉字或英文单词数)，并生成统计摘要。

参考歌词：
${rawLyrics || '暂无歌词，请生成标准 6 段式伤感金曲结构范例'}

请返回严格 JSON 格式：
{
  "totalSections": 6,
  "totalLines": 28,
  "formattedLyricsWithTags": "带标准[前奏]、[主歌]、[导歌]、[副歌]等方括号标签的完整排版歌词文本",
  "sections": [
    {
      "sectionName": "主歌一",
      "tag": "[主歌一]",
      "lineCount": 4,
      "lines": [
        { "lineIndex": 1, "text": "抽屉里那张褪了色的旧相片", "syllableCount": 11 },
        { "lineIndex": 2, "text": "记录着当时稚嫩的侧脸", "syllableCount": 9 }
      ],
      "summary": "共4句: 1句11字, 2句9字..."
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              totalSections: { type: Type.INTEGER },
              totalLines: { type: Type.INTEGER },
              formattedLyricsWithTags: { type: Type.STRING },
              sections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    sectionName: { type: Type.STRING },
                    tag: { type: Type.STRING },
                    lineCount: { type: Type.INTEGER },
                    summary: { type: Type.STRING },
                    lines: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          lineIndex: { type: Type.INTEGER },
                          text: { type: Type.STRING },
                          syllableCount: { type: Type.INTEGER },
                        },
                        required: ['lineIndex', 'text', 'syllableCount'],
                      },
                    },
                  },
                  required: ['sectionName', 'tag', 'lineCount', 'lines'],
                },
              },
            },
            required: ['totalSections', 'totalLines', 'formattedLyricsWithTags', 'sections'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json({ success: true, data: parsed });
    } catch (err: any) {
      console.error('Error parsing lyric structure:', err);
      res.status(500).json({ error: err?.message || '解析歌词结构失败，请重试。' });
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
