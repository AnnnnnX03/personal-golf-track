'use client';

import { useState, useRef } from 'react';
import { computeSwingMetrics, analyzeVideoWithPose, type SwingMetrics } from '@/lib/swingAnalysis';
import { Loader2, Zap, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

type Props = { videoUrl: string };

export default function SwingAnalysis({ videoUrl }: Props) {
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [metrics, setMetrics] = useState<SwingMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  async function runAnalysis() {
    if (!videoRef.current) return;
    setAnalyzing(true); setError(null); setProgress(0);
    try {
      const landmarks = await analyzeVideoWithPose(videoRef.current, setProgress);
      setMetrics(computeSwingMetrics(landmarks));
    } catch (err: any) {
      setError('Analysis failed. Make sure your full body is visible in the video, then try again.');
    } finally {
      setAnalyzing(false); setProgress(0);
    }
  }

  const MetricCard = ({ label, labelZh, value, unit }: { label: string; labelZh: string; value: number | null; unit: string }) => (
    <div className="rounded-lg p-3 text-center" style={{ background: 'var(--ink-4)', border: '1px solid rgba(255,255,255,0.05)' }}>
      <p style={{ fontFamily: 'var(--font-condensed)', fontSize: '9px', fontWeight: 700, letterSpacing: '0.14em', color: 'var(--zinc)', textTransform: 'uppercase', marginBottom: '4px' }}>
        {label}
      </p>
      <div className="flex items-baseline justify-center gap-1">
        {value !== null ? (
          <>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--gold)', lineHeight: 1 }}>{value}</span>
            <span style={{ fontSize: '11px', color: 'var(--zinc)', fontFamily: 'var(--font-condensed)' }}>{unit}</span>
          </>
        ) : (
          <span style={{ color: 'var(--zinc)', fontSize: '13px' }}>—</span>
        )}
      </div>
      <p style={{ fontFamily: 'var(--font-condensed)', fontSize: '10px', color: 'var(--zinc)', marginTop: '2px' }}>{labelZh}</p>
    </div>
  );

  return (
    <div className="mt-3 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(201,168,76,0.15)' }}>
      <video ref={videoRef} src={videoUrl} crossOrigin="anonymous" className="hidden" preload="auto" />

      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2.5 cursor-pointer transition-colors"
        style={{ background: 'rgba(201,168,76,0.05)', borderBottom: expanded ? '1px solid rgba(201,168,76,0.1)' : 'none' }}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Zap size={13} style={{ color: 'var(--gold)' }} />
          <span style={{ fontFamily: 'var(--font-condensed)', fontWeight: 700, letterSpacing: '0.1em', fontSize: '12px', textTransform: 'uppercase', color: 'var(--zinc-light)' }}>
            AI Swing Analysis
          </span>
          {metrics && (
            <span className="text-xs px-1.5 py-0.5 rounded-sm" style={{ background: 'rgba(201,168,76,0.15)', color: 'var(--gold)', fontFamily: 'var(--font-condensed)', fontWeight: 700, fontSize: '9px', letterSpacing: '0.1em' }}>
              Done
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!analyzing && !metrics && (
            <button
              onClick={e => { e.stopPropagation(); runAnalysis(); }}
              className="text-xs px-3 py-1 rounded transition-all"
              style={{ background: 'rgba(201,168,76,0.15)', color: 'var(--gold)', fontFamily: 'var(--font-condensed)', fontWeight: 700, letterSpacing: '0.08em', border: '1px solid rgba(201,168,76,0.25)', textTransform: 'uppercase' }}
            >
              Analyze
            </button>
          )}
          {expanded ? <ChevronUp size={13} style={{ color: 'var(--zinc)' }} /> : <ChevronDown size={13} style={{ color: 'var(--zinc)' }} />}
        </div>
      </div>

      {expanded && (
        <div className="p-3" style={{ background: 'rgba(0,0,0,0.3)' }}>
          {/* Analyzing */}
          {analyzing && (
            <div className="py-5 text-center">
              <Loader2 size={18} className="animate-spin mx-auto mb-2" style={{ color: 'var(--gold)' }} />
              <p className="text-sm mb-3" style={{ fontFamily: 'var(--font-condensed)', color: 'var(--zinc-light)', letterSpacing: '0.08em' }}>
                Analyzing… {progress}%
              </p>
              <div className="w-full rounded-full h-1" style={{ background: 'var(--ink-5)' }}>
                <div className="h-1 rounded-full transition-all" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, var(--gold-dim), var(--gold))' }} />
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--zinc)', fontFamily: 'var(--font-condensed)', letterSpacing: '0.06em' }}>
                Processing pose landmarks in-browser
              </p>
            </div>
          )}

          {/* Error */}
          {error && !analyzing && (
            <div className="flex items-start gap-2 rounded-lg p-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertCircle size={13} className="shrink-0 mt-0.5" style={{ color: '#f87171' }} />
              <p className="text-xs" style={{ color: '#fca5a5' }}>{error}</p>
            </div>
          )}

          {/* Results */}
          {metrics && !analyzing && (
            <div className="space-y-3 animate-fadein">
              <div className="grid grid-cols-3 gap-2">
                <MetricCard label="X-Factor" labelZh="Shoulder-Hip" value={metrics.shoulderHipSeparation} unit="°" />
                <MetricCard label="Wrist" labelZh="Wrist Angle" value={metrics.wristAngle} unit="°" />
                <MetricCard label="Balance" labelZh="Finish Balance" value={metrics.finishBalance} unit="/100" />
              </div>

              <div className="space-y-2">
                <p style={{ fontFamily: 'var(--font-condensed)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--zinc)' }}>
                  AI Insights
                </p>
                {metrics.insights.map((insight, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-lg p-2.5" style={{ background: 'var(--ink-4)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ color: 'var(--gold)', fontSize: '12px', marginTop: '1px', fontFamily: 'var(--font-display)' }}>›</span>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--zinc-light)' }}>{insight}</p>
                  </div>
                ))}
              </div>

              <button onClick={runAnalysis} className="text-xs transition-colors" style={{ color: 'var(--zinc)', fontFamily: 'var(--font-condensed)', letterSpacing: '0.08em' }}>
                重新Analyze
              </button>
            </div>
          )}

          {/* Idle */}
          {!analyzing && !metrics && !error && (
            <p className="text-xs text-center py-3" style={{ color: 'var(--zinc)', fontFamily: 'var(--font-condensed)', letterSpacing: '0.06em' }}>
              点击「Analyze」在浏览器中运行 MediaPipe 姿势检测
            </p>
          )}
        </div>
      )}
    </div>
  );
}
