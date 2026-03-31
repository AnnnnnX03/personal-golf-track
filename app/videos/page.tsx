'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase, CLUBS, TRAINING_TYPES, type Video } from '@/lib/supabase';
import { Upload, Loader2, Play, Trash2, ChevronDown, Film } from 'lucide-react';
import dynamic from 'next/dynamic';

const SwingAnalysis = dynamic(() => import('@/components/SwingAnalysis'), { ssr: false });

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadMeta, setUploadMeta] = useState({ club: '7i', type: 'Full Swing' });

  useEffect(() => { fetchVideos(); }, []);

  async function fetchVideos() {
    setLoading(true);
    const { data } = await supabase.from('videos').select('*').order('created_at', { ascending: false });
    setVideos(data || []);
    setLoading(false);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setUploadProgress(10);
    const ext = file.name.split('.').pop();
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('swing-videos').upload(filename, file, { upsert: false });
    setUploadProgress(70);
    if (error) { alert('Upload failed: ' + error.message); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from('swing-videos').getPublicUrl(filename);
    setUploadProgress(90);
    await supabase.from('videos').insert({ date: new Date().toISOString().split('T')[0], club: uploadMeta.club, type: uploadMeta.type, url: urlData.publicUrl, filename });
    setUploadProgress(100);
    setTimeout(() => { setUploading(false); setUploadProgress(0); }, 500);
    fetchVideos();
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function deleteVideo(video: Video) {
    if (!confirm('Delete this video?')) return;
    await supabase.storage.from('swing-videos').remove([video.filename]);
    await supabase.from('videos').delete().eq('id', video.id);
    fetchVideos();
  }

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <div className="mb-8 animate-fadein">
        <h1 className="page-header shimmer-text">VIDEOS</h1>
        <p style={{ fontFamily: 'var(--font-condensed)', color: 'var(--zinc)', letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: '11px' }}>
          Swing Library · AI Analysis
        </p>
      </div>

      {/* Upload */}
      <div className="card mb-6 animate-fadein-d1" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
        <input ref={fileInputRef} type="file" accept="video/*" onChange={handleUpload} className="hidden" id="video-upload" />
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <select value={uploadMeta.club} onChange={e => setUploadMeta({ ...uploadMeta, club: e.target.value })}
              className="input pr-7 text-sm" style={{ width: '110px' }}>
              {CLUBS.map(c => <option key={c}>{c}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-3 pointer-events-none" style={{ color: 'var(--zinc)' }} />
          </div>
          <div className="relative flex-1">
            <select value={uploadMeta.type} onChange={e => setUploadMeta({ ...uploadMeta, type: e.target.value })}
              className="input pr-7 text-sm">
              {TRAINING_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-3 pointer-events-none" style={{ color: 'var(--zinc)' }} />
          </div>
        </div>
        {uploading ? (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Loader2 size={13} className="animate-spin" style={{ color: 'var(--gold)' }} />
              <span style={{ fontFamily: 'var(--font-condensed)', color: 'var(--zinc-light)', letterSpacing: '0.08em', fontSize: '13px' }}>
                Uploading… {uploadProgress}%
              </span>
            </div>
            <div className="w-full rounded-full h-1" style={{ background: 'var(--ink-5)' }}>
              <div className="h-1 rounded-full transition-all" style={{ width: `${uploadProgress}%`, background: 'linear-gradient(90deg, var(--gold-dim), var(--gold))' }} />
            </div>
          </div>
        ) : (
          <label htmlFor="video-upload"
            className="flex flex-col items-center justify-center gap-3 py-8 rounded-lg cursor-pointer transition-all group"
            style={{ border: '1px dashed rgba(255,255,255,0.1)' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center transition-all group-hover:scale-110"
              style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}>
              <Upload size={16} style={{ color: 'var(--gold)' }} />
            </div>
            <div className="text-center">
              <div style={{ fontFamily: 'var(--font-condensed)', fontWeight: 700, color: 'var(--zinc-light)', letterSpacing: '0.08em', fontSize: '13px', textTransform: 'uppercase' }}>
                Tap to Upload Video
              </div>
              <div style={{ fontSize: '11px', color: 'var(--zinc)', fontFamily: 'var(--font-condensed)' }}>MP4 · MOV · WebM</div>
            </div>
          </label>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20" style={{ color: 'var(--zinc)' }}>
          <Loader2 size={18} className="animate-spin mr-2" />
          <span style={{ fontFamily: 'var(--font-condensed)', letterSpacing: '0.1em' }}>Loading…</span>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20">
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '3.5rem', color: 'rgba(201,168,76,0.1)', letterSpacing: '0.1em' }}>NO VIDEOS</div>
          <p className="mt-2 text-sm" style={{ color: 'var(--zinc)' }}>Upload your first swing video above</p>
        </div>
      ) : (
        <div className="space-y-3">
          {videos.map((v, i) => (
            <div key={v.id} className={`card group transition-all duration-200 animate-fadein-d${Math.min(i + 1, 4)}`}
              style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.15)' }}>
                    <Film size={14} style={{ color: 'var(--gold)' }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="tag">{v.club}</span>
                      <span className="tag-neutral">{v.type}</span>
                    </div>
                    <p style={{ fontFamily: 'var(--font-condensed)', fontSize: '11px', color: 'var(--zinc)', marginTop: '3px' }}>{v.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setActiveVideo(activeVideo === v.id ? null : v.id)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
                    style={{
                      fontFamily: 'var(--font-condensed)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                      background: activeVideo === v.id ? 'rgba(201,168,76,0.15)' : 'var(--ink-5)',
                      color: activeVideo === v.id ? 'var(--gold)' : 'var(--zinc-light)',
                      border: `1px solid ${activeVideo === v.id ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.05)'}`,
                    }}>
                    <Play size={11} />
                    {activeVideo === v.id ? 'Hide' : 'Play'}
                  </button>
                  <button onClick={() => deleteVideo(v)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5" style={{ color: 'var(--zinc)' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              {activeVideo === v.id && (
                <div className="animate-fadein">
                  <video src={v.url} controls className="w-full rounded-lg" style={{ maxHeight: '300px', background: '#000' }} playsInline />
                  <SwingAnalysis videoUrl={v.url} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
