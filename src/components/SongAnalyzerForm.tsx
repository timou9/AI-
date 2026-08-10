import React, { useState, useRef } from 'react';
import {
  Search,
  Music,
  FileText,
  Sparkles,
  Loader2,
  Mic,
  Upload,
  FileAudio,
  FileVideo,
  X,
  CheckCircle2,
  Zap,
  Play,
  Volume2,
  Info
} from 'lucide-react';
import { compressAudioOrVideoFile } from '../lib/audioCompressor';

export interface UploadedMediaFile {
  data: string; // base64 string without header prefix
  mimeType: string;
  fileName: string;
  previewUrl: string;
  sizeFormatted: string;
  isVideo: boolean;
  isCompressed?: boolean;
  originalSizeFormatted?: string;
  compressionRatio?: number;
}

interface SongAnalyzerFormProps {
  onAnalyze: (formData: {
    songTitle: string;
    artist: string;
    lyrics: string;
    genre: string;
    audioDescription: string;
    mediaFile?: { data: string; mimeType: string; fileName: string } | null;
  }) => Promise<void>;
  isLoading: boolean;
}

export const SongAnalyzerForm: React.FC<SongAnalyzerFormProps> = ({ onAnalyze, isLoading }) => {
  const [songTitle, setSongTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [audioDescription, setAudioDescription] = useState('');

  // Media file upload & auto-recognition state
  const [mediaFile, setMediaFile] = useState<UploadedMediaFile | null>(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressingStatus, setCompressingStatus] = useState<string>('');
  const [recognitionNotice, setRecognitionNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper: Format file size
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle File Input Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    setFormError(null);
    const allowedTypes = [
      'audio/mp3',
      'audio/mpeg',
      'audio/wav',
      'audio/x-wav',
      'audio/m4a',
      'audio/x-m4a',
      'audio/aac',
      'audio/ogg',
      'audio/webm',
      'audio/flac',
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'video/ogg',
    ];

    const isVideo = file.type.startsWith('video/') || file.name.endsWith('.mp4') || file.name.endsWith('.mov');
    const isAudio = file.type.startsWith('audio/') || file.name.endsWith('.mp3') || file.name.endsWith('.wav') || file.name.endsWith('.m4a');

    if (!isAudio && !isVideo && !allowedTypes.some((t) => file.type.includes(t))) {
      setFormError('请上传有效的音视频文件（支持 MP3, MP4, WAV, M4A, AAC, MOV, WebM 等）');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setFormError('上传的文件大小不能超过 100MB。');
      return;
    }

    setIsCompressing(true);
    setCompressingStatus('准备处理媒体文件...');

    try {
      const previewUrl = URL.createObjectURL(file);
      const res = await compressAudioOrVideoFile(file, (msg) => setCompressingStatus(msg));

      setMediaFile({
        data: res.base64,
        mimeType: res.mimeType,
        fileName: res.fileName,
        previewUrl,
        sizeFormatted: formatBytes(res.compressedSize),
        isVideo,
        isCompressed: res.isCompressed,
        originalSizeFormatted: formatBytes(res.originalSize),
        compressionRatio: res.compressionRatio,
      });

      if (res.isCompressed) {
        setRecognitionNotice(
          `⚡ 已自动提取并压缩《${file.name}》（原 ${formatBytes(res.originalSize)} ➔ 压缩后 ${formatBytes(res.compressedSize)}，节省 ${res.compressionRatio}% 体积），音轨与乐理信息完整保留！`
        );
      } else {
        setRecognitionNotice(`已成功加载媒体文件《${file.name}》，可点击“开启 AI 自动识别”自动填充歌曲信息。`);
      }
    } catch (err: any) {
      console.error('Process media error:', err);
      setFormError('读取或压制媒体文件失败，请检查文件格式。');
    } finally {
      setIsCompressing(false);
      setCompressingStatus('');
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemoveFile = () => {
    if (mediaFile?.previewUrl) {
      URL.revokeObjectURL(mediaFile.previewUrl);
    }
    setMediaFile(null);
    setRecognitionNotice(null);
    setFormError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Trigger AI Auto Recognition for Uploaded Media
  const handleAutoRecognize = async () => {
    if (!mediaFile) return;

    setIsRecognizing(true);
    setRecognitionNotice(null);
    setFormError(null);

    try {
      const response = await fetch('/api/recognize-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaFile: {
            data: mediaFile.data,
            mimeType: mediaFile.mimeType,
            fileName: mediaFile.fileName,
          },
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
            errText = `识别失败 (${response.status})，音视频文件可能过大或响应超时。`;
          }
        } catch (e) {}
        throw new Error(errText);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '自动识别音视频失败');
      }

      const data = result.data;
      if (data.songTitle) setSongTitle(data.songTitle);
      if (data.artist) setArtist(data.artist);
      if (data.genre) setGenre(data.genre);
      if (data.lyrics && data.lyrics !== '[纯音乐 / 无歌词演奏曲]') setLyrics(data.lyrics);
      if (data.audioDescription) setAudioDescription(data.audioDescription);

      setRecognitionNotice(`🎉 AI 自动识别完成！已智能填入歌名《${data.songTitle || '未命名'}》、歌手《${data.artist || '未知'}》及风格《${data.genre || '未标注'}》。`);
    } catch (err: any) {
      console.error('Media recognition error:', err);
      setFormError(err?.message || '音视频识别异常，请检查文件后重试。');
    } finally {
      setIsRecognizing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!songTitle.trim() && !lyrics.trim() && !audioDescription.trim() && !mediaFile) {
      setFormError('请至少输入歌曲名称、歌词文本、描述，或上传 MP3/MP4 文件！');
      return;
    }
    onAnalyze({
      songTitle,
      artist,
      lyrics,
      genre,
      audioDescription,
      mediaFile: mediaFile
        ? {
            data: mediaFile.data,
            mimeType: mediaFile.mimeType,
            fileName: mediaFile.fileName,
          }
        : null,
    });
  };

  const handleQuickFill = (exampleTitle: string, exampleArtist: string, exampleGenre: string) => {
    setSongTitle(exampleTitle);
    setArtist(exampleArtist);
    setGenre(exampleGenre);
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Search className="w-5 h-5 text-indigo-400" />
            <span>分析任意目标歌曲 / 上传音视频拆解</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            支持输入歌名/歌词，或直接上传 MP3、MP4 音视频文件开启 AI 听觉乐理大模型全维度解构
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: MP3 / MP4 Upload & Recognition Zone */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <Upload className="w-4 h-4 text-amber-400" />
              <span>上传 MP3 / MP4 音视频文件 (开启 AI 自动识别与音频直解析)</span>
            </span>
            <span className="text-[11px] text-slate-400">支持 MP3, MP4, WAV, M4A, MOV 等</span>
          </label>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="audio/*,video/*,.mp3,.mp4,.wav,.m4a,.aac,.ogg,.webm,.mov"
            className="hidden"
          />

          {!mediaFile ? (
            isCompressing ? (
              <div className="border-2 border-indigo-500/40 rounded-2xl p-8 text-center bg-indigo-950/20 space-y-3 animate-pulse">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                <div className="text-sm font-bold text-slate-100">
                  {compressingStatus || '正在自动智能压缩与提取音轨...'}
                </div>
                <p className="text-xs text-amber-300/80 max-w-sm mx-auto">
                  💡 系统正在自动过滤冗余数据，并降采样转换为高保真 16-bit 音轨数据包，传输速度提升 90% 以上，乐理分析精度不受影响。
                </p>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-indigo-400 bg-indigo-500/10'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/60 hover:bg-slate-950'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className="p-3 rounded-full bg-slate-800/80 text-amber-400 border border-slate-700/80 shadow-md">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-semibold text-slate-200">
                    点击或将 MP3 / MP4 音视频文件拖拽至此处
                  </div>
                  <p className="text-xs text-slate-400 max-w-md">
                    上传歌曲音频或音乐视频，AI 自动听辨和声、BPM、主调性及编曲（支持最大 100MB，大文件将自动高效压缩）
                  </p>
                </div>
              </div>
            )
          ) : (
            <div className="bg-slate-950 border border-indigo-500/30 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    {mediaFile.isVideo ? <FileVideo className="w-6 h-6" /> : <FileAudio className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                      <span>{mediaFile.fileName}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-amber-300 border border-slate-700">
                        {mediaFile.sizeFormatted}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center space-x-2">
                      <span>{mediaFile.isVideo ? '视频文件 (MP4/MOV)' : '音频文件 (MP3/WAV/M4A)'}</span>
                      {mediaFile.isCompressed && (
                        <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                          <Zap className="w-3 h-3 text-amber-400" />
                          <span>已极速压缩 {mediaFile.compressionRatio}%</span>
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                  title="移除此文件"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Compression Notice Badge if file was auto-compressed */}
              {mediaFile.isCompressed && (
                <div className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    系统已自动将文件进行高保真重采样压制（原 {mediaFile.originalSizeFormatted} ➔ 极速音轨 {mediaFile.sizeFormatted}，节省 {mediaFile.compressionRatio}% 体积），无损保留歌词与乐理听感分析结果。
                  </span>
                </div>
              )}

              {/* Media Player Preview */}
              <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-xs text-amber-400 font-semibold mb-1">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>媒体试听/预览:</span>
                </div>
                {mediaFile.isVideo ? (
                  <video
                    controls
                    src={mediaFile.previewUrl}
                    className="max-h-52 w-full rounded-lg bg-black object-contain"
                  />
                ) : (
                  <audio controls src={mediaFile.previewUrl} className="w-full accent-indigo-500 h-10" />
                )}
              </div>

              {/* Auto Recognition Action Controls */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleAutoRecognize}
                  disabled={isRecognizing}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-bold text-xs transition-all flex items-center space-x-2 shadow-md disabled:opacity-50"
                >
                  {isRecognizing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>AI 正在聆听音视频识别歌名与和声...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>开启 AI 自动识别并填充表单</span>
                    </>
                  )}
                </button>

                <span className="text-xs text-slate-400 flex items-center space-x-1">
                  <Info className="w-3.5 h-3.5 text-indigo-400" />
                  <span>自动提取歌名、歌手、曲风、歌词及听感描述</span>
                </span>
              </div>
            </div>
          )}

          {/* Recognition Feedback Alert */}
          {recognitionNotice && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{recognitionNotice}</span>
            </div>
          )}

          {/* Error Alert */}
          {formError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between space-x-2 animate-fadeIn">
              <div className="flex items-center space-x-2">
                <X className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{formError}</span>
              </div>
              <button
                type="button"
                onClick={() => setFormError(null)}
                className="text-slate-400 hover:text-slate-200 text-xs font-bold"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Section 2: Song Text Metadata Fields */}
        <div className="border-t border-slate-800/80 pt-5 space-y-4">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Music className="w-4 h-4 text-indigo-400" />
            <span>歌曲基础属性 (自动识别或手动填入)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                歌曲名称 <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={songTitle}
                onChange={(e) => setSongTitle(e.target.value)}
                placeholder="例如: 稻香 / 花海 / Anti-Hero"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                歌手 / 艺术家 (选填)
              </label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="例如: 周杰伦 / Taylor Swift"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                音乐流派 / 风格 (选填)
              </label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="例如: 流行民谣 / Synth-Pop"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Quick Example Chips */}
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span className="font-medium">经典示例快速填入:</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('稻香', '周杰伦', '华语民谣嘻哈')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                周杰伦《稻香》
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('Flowers', 'Miley Cyrus', 'Disco Pop')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Miley Cyrus《Flowers》
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('七里香', '周杰伦', '诗意摇滚')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                周杰伦《七里香》
              </button>
            </div>
          </div>

          {/* Optional Lyrics Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>歌词文本或和弦谱 (自动识别或粘贴)</span>
              </span>
              <span className="text-[11px] text-slate-500">粘贴主歌/副歌效果更佳</span>
            </label>
            <textarea
              rows={4}
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder="粘贴歌词段落或由上文 AI 自动听写识别出来..."
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 placeholder-slate-600 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed"
            />
          </div>

          {/* Optional Musical Feel Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
              <Mic className="w-4 h-4 text-emerald-400" />
              <span>听感描述 / 编曲特色补充 (可选)</span>
            </label>
            <input
              type="text"
              value={audioDescription}
              onChange={(e) => setAudioDescription(e.target.value)}
              placeholder="例如: 前奏是复古八十年代合成器，副歌鼓点很密集，有强烈的切分音和呼应和声"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || isRecognizing}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-600 hover:from-indigo-500 hover:to-amber-500 text-slate-100 font-bold text-sm transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>乐理 AI 正在深度解构音视频与歌曲和声 Blueprint...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>
                {mediaFile
                  ? '开始全维度音视频听觉 + 乐理 Blueprint 拆解分析'
                  : '开始全维度乐理拆解与仿写分析'}
              </span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
