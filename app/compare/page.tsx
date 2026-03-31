'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase, type Video } from '@/lib/supabase';
import { Loader2, ChevronDown, Play, Pause, RotateCcw } from 'lucide-react';

export default function ComparePage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [leftId, setLeftId] = useState('');
  const [rightId, setRightId] = useState('');
  const [playing, setPlaying] = useState(false);
  const leftRef = useRef<HTMLVideoElement>(null);
  const rightRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    supabase.from('videos').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setVideos(data || []);
      if (data && data.length >= 2) { setLeftId(data[0].id); setRightId(data[1].id); }
      else if (data?.length === 1) setLeftId(data[0].id);
      setLoading(false);
    });
  }, []);

  const leftVideo = videos.find(v => v.id === leftId);
  const rightVideo = videos.find(v => v.id === rightId);

  function syncPlay() { leftRef.current?.play(); rightRef.current?.play(); setPlaying(true); }
  function syncPause() { leftRef.current?.pause(); rightRef.current?.pause(); setPlaying(false); }
  function syncReset() {
    if (leftRef.current) leftRef.current.currentTime = 0;
    if (rightRef.current) rightRef.current.currentTime = 0;
    leftRef.current?.pause(); rightRef.current?.pause(); setPlaying(false);
  }

  if (loading) return (
    <div className="flex items-center justify-center py-32" style={{ color: 'var(--zinc)' }}>
      <Loader2 size={18} className="animate-spin mr-2" />
      <span style={{ fontFamily: 'var(--font-condensed)', letterSpacing: '0.1em' }}>Loading…</span>
    </div>
  );

  if (videos.length < 2) return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <h1 className="page-header shimmer-text mb-2">COMPARE</h1>
      <div className="text-center py-20">
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '5rem', color: 'rgba(201,168,76,0.08)', letterSpacing: '0.1em' }}>VS</div>
        <p className="mt-2 text-sm" style={{ color: 'var(--zinc)' }}>Upload at least 2 videos to compare</p>
      </div>
    </div>
  );

  return (
    <div className="px-4 py-6 max-w-4xl mx-auto">
      <div className="mb-8 animate-fadein">
        <h1 className="page-header shimmer-text">COMPARE</h1>
        <p style={{ fontFamily: 'var(--font-condensed)', color: 'var(--zinc)', letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: '11px' }}>
          Side-by-Side Analysis
        </p>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-2 gap-3 mb-5 animate-fadein-d1">
        {[{ id: leftId, setId: setLeftId, label: 'Video A — Left' }, { id: rightId, setId: setRightId, label: 'Video B — Right' }].map(({ id, setId, label }) => (
          <div key={label}>
            <label className="label">{label}</label>
            <div className="relative">
              <select value={id} onChange={e => setId(e.target.value)} className="input pr-8 text-sm">
                <option value="">— Select —</option>
                {videos.map(v => <option key={v.id} value={v.id}>{v.club} · {v.type} · {v.date}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-3 pointer-events-none" style={{ color: 'var(--zinc)' }} />
            </div>
          </div>
        ))}
      </div>

      {leftVideo && rightVideo && (
        <div className="animate-fadein-d2">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.3))' }} />
            <span style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', fontSize: '1.2rem', letterSpacing: '0.2em' }}>VS</span>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(201,168,76,0.3), transparent)' }} />
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[{ v: leftVideo, ref: leftRef, label: 'A' }, { v: rightVideo, ref: rightRef, label: 'B' }].map(({ v, ref, label }) => (
              <div key={v.id} className="rounded-xl overflow-hidden" style={{ background: 'var(--ink-3)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', fontSize: '13px', letterSpacing: '0.1em' }}>{label}</span>
                  <span className="tag text-xs">{v.club}</span>
                  <span className="tag-neutral text-xs">{v.type}</span>
                  <span style={{ fontFamily: 'var(--font-condensed)', fontSize: '10px', color: 'var(--zinc)', marginLeft: 'auto' }}>{v.date}</span>
                </div>
                <video ref={ref} src={v.url} className="w-full aspect-video" style={{ background: '#000' }} playsInline onEnded={() => setPlaying(false)} />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-3 rounded-xl p-3"
            style={{ background: 'var(--ink-3)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <button onClick={syncReset} className="btn-secondary flex items-center gap-1.5 text-xs"><RotateCcw size={12} /> Reset</button>
            {playing
              ? <button onClick={syncPause} className="btn-primary flex items-center gap-2 px-6 text-xs"><Pause size={12} /> Pause Both</button>
              : <button onClick={syncPlay}  className="btn-primary flex items-center gap-2 px-6 text-xs"><Play  size={12} /> Play Both</button>
            }
            <span style={{ fontFamily: 'var(--font-condensed)', fontSize: '11px', color: 'var(--zinc)', letterSpacing: '0.06em' }}>Synced</span>
          </div>
        </div>
      )}
    </div>
  );
}
