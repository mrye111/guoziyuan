import { useCallback, useEffect, useRef, useState } from 'react';
import { content } from '../data/content';
import { useReveal } from '../hooks/useReveal';
import { SectionHead } from './SectionHead';
import { addMemes, deleteMeme, listMemes, type StoredMeme } from '../utils/memeStore';

interface Pending {
  dataUrl: string;
  top: string;
  bottom: string;
}

interface Card {
  key: string;
  src: string;
  top?: string;
  bottom?: string;
  mine?: StoredMeme;
}

/* ---------- 图片处理：小 GIF 原样保留动图，其余缩到 800px 内 ---------- */
function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function processFile(file: File): Promise<string> {
  if (file.type === 'image/gif' && file.size < 2.5 * 1024 * 1024) {
    return readAsDataURL(file);
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 800 / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      resolve(canvas.toDataURL(mime, 0.86));
    };
    img.onerror = reject;
    img.src = url;
  });
}

/* ---------- 单张表情卡片 ---------- */
function MemeCard({
  src, top, bottom, mine, onClick, onDelete,
}: {
  src: string; top?: string; bottom?: string; mine?: boolean;
  onClick: () => void; onDelete?: () => void;
}) {
  return (
    <div
      className="group relative aspect-square rounded-2xl overflow-hidden border border-ink/8 bg-card cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-pink/40 hover:shadow-[0_14px_36px_rgba(255,107,138,0.25)]"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-label={top || bottom ? `表情包：${top || ''} ${bottom || ''}` : '表情包'}
    >
      <img src={src} alt={top || bottom ? `果子表情包：${top || ''}${bottom || ''}` : '果子表情包'} loading="lazy" className="w-full h-full object-cover" />
      {top && (
        <p className="meme-text absolute top-2 inset-x-2 text-center text-lg sm:text-xl">{top}</p>
      )}
      {bottom && (
        <p className="meme-text absolute bottom-2 inset-x-2 text-center text-lg sm:text-xl">{bottom}</p>
      )}
      {mine && (
        <span className="absolute top-2 left-2 rounded-full bg-pink text-white text-[10px] font-bold px-2 py-0.5 shadow">
          我的
        </span>
      )}
      {onDelete && (
        <button
          type="button"
          aria-label="删除这张表情包"
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-ink/60 text-cream text-sm leading-none opacity-0 group-hover:opacity-100 transition-opacity hover:bg-hotpink"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}

/* ---------- 主版块 ---------- */
export function MemePlaza() {
  const wrapRef = useReveal<HTMLDivElement>();
  const fileRef = useRef<HTMLInputElement>(null);
  const [userMemes, setUserMemes] = useState<StoredMeme[]>([]);
  const [pending, setPending] = useState<Pending[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [lightbox, setLightbox] = useState<Card | null>(null);
  const [saving, setSaving] = useState(false);

  const reload = useCallback(async () => {
    try {
      setUserMemes(await listMemes());
    } catch {
      /* IndexedDB 不可用就当作没有 */
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setLightbox(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const images = [...files].filter((f) => f.type.startsWith('image/')).slice(0, 12);
    const processed = await Promise.all(images.map((f) => processFile(f).catch(() => null)));
    setPending((p) => [
      ...p,
      ...processed.filter((d): d is string => !!d).map((dataUrl) => ({ dataUrl, top: '', bottom: '' })),
    ]);
  };

  const saveAll = async () => {
    if (!pending.length || saving) return;
    setSaving(true);
    try {
      await addMemes(pending.map((p) => ({ dataUrl: p.dataUrl, top: p.top.trim(), bottom: p.bottom.trim(), ts: Date.now() })));
      setPending([]);
      await reload();
    } finally {
      setSaving(false);
    }
  };

  const removeUserMeme = async (id: number) => {
    await deleteMeme(id);
    setLightbox(null);
    await reload();
  };

  const cards: Card[] = [
    ...userMemes.map((m): Card => ({ key: `u${m.id}`, src: m.dataUrl, top: m.top || undefined, bottom: m.bottom || undefined, mine: m })),
    ...content.memes.map((m, i): Card => ({ key: `b${i}`, src: m.src, top: m.top, bottom: m.bottom })),
  ];

  return (
    <section id="memes" className="py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-5">
        <SectionHead tag="Meme Plaza" title="表情包广场" sub="果子名场面表情，也可以上架你自己的私藏" accent="#FF6B8A" />

        <div ref={wrapRef} className="reveal">
          {/* 上传区 */}
          <div
            className={`rounded-3xl border-2 border-dashed p-6 sm:p-8 text-center transition-colors cursor-pointer ${
              dragOver ? 'border-pink bg-pink/8' : 'border-ink/15 bg-card hover:border-pink/50 hover:bg-pink/4'
            }`}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              onFiles(e.dataTransfer.files);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
            aria-label="上传表情包"
          >
            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-pink" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p className="mt-2 font-medium">点击选择或拖拽图片到这里</p>
            <p className="mt-1 text-xs text-mute">支持多张 · GIF 动图原样保留 · 大图自动压缩 · 存在你的浏览器里，仅自己可见</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                onFiles(e.target.files);
                e.target.value = '';
              }}
            />
          </div>

          {/* 待上架编辑 */}
          {pending.length > 0 && (
            <div className="mt-6 rounded-3xl bg-card border border-ink/8 p-5">
              <p className="text-sm font-medium mb-4">
                给表情包配个字幕再上架（可不配）：
              </p>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {pending.map((p, i) => (
                  <div key={i} className="shrink-0 w-36">
                    <div className="relative aspect-square rounded-xl overflow-hidden border border-ink/8">
                      <img src={p.dataUrl} alt={`待上架 ${i + 1}`} className="w-full h-full object-cover" />
                      {p.top && <p className="meme-text absolute top-1.5 inset-x-1 text-center text-sm">{p.top}</p>}
                      {p.bottom && <p className="meme-text absolute bottom-1.5 inset-x-1 text-center text-sm">{p.bottom}</p>}
                      <button
                        type="button"
                        aria-label="移除"
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-ink/60 text-cream text-xs hover:bg-hotpink"
                        onClick={() => setPending((arr) => arr.filter((_, j) => j !== i))}
                      >
                        ×
                      </button>
                    </div>
                    <input
                      type="text"
                      value={p.top}
                      maxLength={12}
                      placeholder="上方字幕"
                      onChange={(e) => setPending((arr) => arr.map((x, j) => (j === i ? { ...x, top: e.target.value } : x)))}
                      className="mt-2 w-full rounded-lg bg-cream border border-ink/10 px-2.5 py-1.5 text-xs focus:outline-none focus:border-pink/60"
                    />
                    <input
                      type="text"
                      value={p.bottom}
                      maxLength={12}
                      placeholder="下方字幕"
                      onChange={(e) => setPending((arr) => arr.map((x, j) => (j === i ? { ...x, bottom: e.target.value } : x)))}
                      className="mt-1.5 w-full rounded-lg bg-cream border border-ink/10 px-2.5 py-1.5 text-xs focus:outline-none focus:border-pink/60"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-3 justify-end">
                <button type="button" onClick={() => setPending([])} className="px-5 py-2 rounded-full text-sm text-mute hover:text-ink transition-colors">
                  清空
                </button>
                <button
                  type="button"
                  onClick={saveAll}
                  disabled={saving}
                  className="px-6 py-2 rounded-full bg-pink text-white text-sm font-medium hover:bg-hotpink transition-colors disabled:opacity-60"
                >
                  {saving ? '上架中…' : `上架 ${pending.length} 张`}
                </button>
              </div>
            </div>
          )}

          {/* 表情网格 */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {cards.map((c) => (
              <MemeCard
                key={c.key}
                src={c.src}
                top={c.top}
                bottom={c.bottom}
                mine={!!c.mine}
                onClick={() => setLightbox(c)}
                onDelete={c.mine ? () => removeUserMeme(c.mine!.id!) : undefined}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 灯箱 */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[80] bg-ink/70 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label="查看表情包"
        >
          <div className="relative max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="relative rounded-3xl overflow-hidden border-4 border-white shadow-2xl">
              <img src={lightbox.src} alt="表情包大图" className="w-full object-cover" />
              {lightbox.top && <p className="meme-text absolute top-3 inset-x-3 text-center text-2xl">{lightbox.top}</p>}
              {lightbox.bottom && <p className="meme-text absolute bottom-3 inset-x-3 text-center text-2xl">{lightbox.bottom}</p>}
            </div>
            <div className="mt-4 flex justify-center gap-3">
              <a
                href={lightbox.src}
                download={`guozi-meme-${lightbox.key}.jpg`}
                className="px-6 py-2.5 rounded-full bg-pink text-white text-sm font-medium hover:bg-hotpink transition-colors"
              >
                保存到本地
              </a>
              <button type="button" onClick={() => setLightbox(null)} className="px-6 py-2.5 rounded-full bg-white/15 text-cream text-sm hover:bg-white/25 transition-colors">
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
