import { useCallback, useEffect, useRef, useState } from 'react';
import { content } from '../data/content';
import { useReveal } from '../hooks/useReveal';
import { SectionHead } from './SectionHead';

interface SharedMeme {
  id: string;
  url: string;
  top: string;
  bottom: string;
  ts: number;
}

interface Pending {
  dataUrl: string;
  blob: Blob;
  mime: string;
  top: string;
  bottom: string;
}

interface Card {
  key: string;
  src: string;
  top?: string;
  bottom?: string;
  shared?: SharedMeme;
}

const TOKENS_KEY = 'guoziyuan.memeTokens.v1';
const PAGE_SIZE = 12;

function loadTokens(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(TOKENS_KEY) || '{}');
  } catch {
    return {};
  }
}
function saveTokens(t: Record<string, string>) {
  try {
    localStorage.setItem(TOKENS_KEY, JSON.stringify(t));
  } catch {
    /* ignore */
  }
}

/* ---------- 图片处理：GIF ≤8MB 原样保留，其余压到 1200px 内 ---------- */
function readAsDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

async function processFile(file: File): Promise<{ blob: Blob; dataUrl: string; mime: string }> {
  if (file.type === 'image/gif') {
    if (file.size > 8 * 1024 * 1024) throw new Error(`「${file.name}」超过 8MB，动图会被压坏，已跳过`);
    return { blob: file, dataUrl: await readAsDataURL(file), mime: 'image/gif' };
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = url;
    });
    const scale = Math.min(1, 1200 / Math.max(img.width, img.height));
    if (scale === 1 && file.size <= 8 * 1024 * 1024) {
      return { blob: file, dataUrl: await readAsDataURL(file), mime: file.type };
    }
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
    const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), mime, 0.87));
    return { blob, dataUrl: await readAsDataURL(blob), mime };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function uploadOne(p: Pending, onProgress: (n: number) => void): Promise<SharedMeme & { deleteToken: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/memes');
    xhr.setRequestHeader('Content-Type', p.mime);
    xhr.setRequestHeader('X-Meme-Top', encodeURIComponent(p.top.trim()));
    xhr.setRequestHeader('X-Meme-Bottom', encodeURIComponent(p.bottom.trim()));
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () => {
      try {
        const j = JSON.parse(xhr.responseText);
        if (xhr.status === 201) resolve(j);
        else reject(new Error(j.error || `HTTP ${xhr.status}`));
      } catch {
        reject(new Error('响应解析失败'));
      }
    };
    xhr.onerror = () => reject(new Error('网络错误'));
    xhr.send(p.blob);
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
      <img src={src} alt={top || bottom ? `表情包：${top || ''}${bottom || ''}` : '果子表情包'} loading="lazy" className="w-full h-full object-cover" />
      {top && <p className="meme-text absolute top-2 inset-x-2 text-center text-lg sm:text-xl">{top}</p>}
      {bottom && <p className="meme-text absolute bottom-2 inset-x-2 text-center text-lg sm:text-xl">{bottom}</p>}
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
  const gridRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [data, setData] = useState<{ items: SharedMeme[]; total: number }>({ items: [], total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<Pending[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [lightbox, setLightbox] = useState<Card | null>(null);
  const [uploading, setUploading] = useState<{ done: number; total: number } | null>(null);
  const [notice, setNotice] = useState('');
  const [tokens, setTokens] = useState<Record<string, string>>(loadTokens);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const r = await fetch(`/api/memes?page=${p}&size=${PAGE_SIZE}`);
      const j = await r.json();
      setData({ items: j.items || [], total: j.total || 0 });
    } catch {
      setData({ items: [], total: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(page);
  }, [page, load]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setLightbox(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setNotice('');
    const images = [...files].filter((f) => f.type.startsWith('image/')).slice(0, 12);
    const results = await Promise.all(
      images.map(async (f) => {
        try {
          const p = await processFile(f);
          return { dataUrl: p.dataUrl, blob: p.blob, mime: p.mime, top: '', bottom: '' } as Pending;
        } catch (e) {
          setNotice((e as Error).message);
          return null;
        }
      }),
    );
    setPending((arr) => [...arr, ...results.filter((x): x is Pending => !!x)]);
  };

  const saveAll = async () => {
    if (!pending.length || uploading) return;
    setUploading({ done: 0, total: pending.length });
    setNotice('');
    const newTokens = { ...tokens };
    try {
      for (const p of pending) {
        const saved = await uploadOne(p, () => {});
        newTokens[saved.id] = saved.deleteToken;
        setUploading((u) => (u ? { ...u, done: u.done + 1 } : u));
      }
      setTokens(newTokens);
      saveTokens(newTokens);
      setPending([]);
      setNotice('上架成功！所有人都能看到了');
      if (page === 1) load(1);
      else setPage(1);
    } catch (e) {
      setNotice((e as Error).message || '上传失败，稍后再试');
    } finally {
      setUploading(null);
    }
  };

  const removeShared = async (id: string) => {
    try {
      await fetch(`/api/memes/${id}`, { method: 'DELETE', headers: { 'X-Delete-Token': tokens[id] || '' } });
      const t = { ...tokens };
      delete t[id];
      setTokens(t);
      saveTokens(t);
      setLightbox(null);
      load(page);
    } catch {
      setNotice('删除失败，稍后再试');
    }
  };

  const totalPages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
  const sharedCards: Card[] = data.items.map((m) => ({
    key: m.id,
    src: m.url,
    top: m.top || undefined,
    bottom: m.bottom || undefined,
    shared: m,
  }));

  return (
    <section id="memes" className="py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-5">
        <SectionHead tag="Meme Plaza" title="表情包广场" sub="果子名场面表情，也欢迎上架你的私藏（公开可见）" accent="#FF6B8A" />

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
            <p className="mt-1 text-xs text-mute">支持多张 · GIF ≤8MB 原样播放 · 上架后所有人可见（限 PNG/JPG/GIF/WebP）</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
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
              <p className="text-sm font-medium mb-4">给表情包配个字幕再上架（可不配）：</p>
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
              <div className="mt-4 flex gap-3 justify-end items-center">
                <button type="button" onClick={() => setPending([])} className="px-5 py-2 rounded-full text-sm text-mute hover:text-ink transition-colors">
                  清空
                </button>
                <button
                  type="button"
                  onClick={saveAll}
                  disabled={!!uploading}
                  className="px-6 py-2 rounded-full bg-pink text-white text-sm font-medium hover:bg-hotpink transition-colors disabled:opacity-60"
                >
                  {uploading ? `上架中 ${uploading.done}/${uploading.total}…` : `公开上架 ${pending.length} 张`}
                </button>
              </div>
            </div>
          )}
          {notice && <p className="mt-4 text-center text-sm text-pink">{notice}</p>}

          {/* 官方表情包（内置素材，横向滑动） */}
          <p className="mt-10 mb-4 text-sm font-medium text-ink/80">
            官方出品
          </p>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-5 px-5">
            {content.memes.map((m, i) => (
              <div key={i} className="shrink-0 w-40">
                <MemeCard src={m.src} top={m.top} bottom={m.bottom} onClick={() => setLightbox({ key: `b${i}`, src: m.src, top: m.top, bottom: m.bottom })} />
              </div>
            ))}
          </div>

          {/* 大家上传的（分页） */}
          <p className="mt-10 mb-4 text-sm font-medium text-ink/80 flex items-center gap-2">
            大家上传的
            <span className="text-xs text-mute font-normal">{data.total > 0 ? `共 ${data.total} 张` : ''}</span>
          </p>
          {loading ? (
            <div className="py-16 text-center text-mute text-sm">加载中…</div>
          ) : sharedCards.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-mute text-sm">还没有人上传，来抢沙发！</p>
            </div>
          ) : (
            <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {sharedCards.map((c) => (
                <MemeCard
                  key={c.key}
                  src={c.src}
                  top={c.top}
                  bottom={c.bottom}
                  mine={!!tokens[c.key]}
                  onClick={() => setLightbox(c)}
                  onDelete={tokens[c.key] ? () => removeShared(c.key) : undefined}
                />
              ))}
            </div>
          )}

          {/* 分页 */}
          {totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label="表情包分页">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3.5 py-1.5 rounded-full text-sm text-ink/70 hover:bg-pink/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                上一页
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                .reduce<(number | '…')[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('…');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '…' ? (
                    <span key={`e${i}`} className="px-1 text-mute">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      aria-current={p === page}
                      className={`w-9 h-9 rounded-full text-sm transition-colors ${
                        p === page ? 'bg-pink text-white font-bold shadow-[0_4px_14px_rgba(255,107,138,0.4)]' : 'text-ink/70 hover:bg-pink/10'
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3.5 py-1.5 rounded-full text-sm text-ink/70 hover:bg-pink/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                下一页
              </button>
            </nav>
          )}
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
                download={`guozi-meme-${lightbox.key}`}
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
