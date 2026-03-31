'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { Loader2, TrendingUp, Activity, Target, Navigation } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg p-3 text-xs shadow-xl" style={{ background: 'var(--ink-3)', border: '1px solid rgba(201,168,76,0.25)' }}>
      <p className="mb-1.5" style={{ color: 'var(--zinc)', fontFamily: 'var(--font-condensed)', letterSpacing: '0.08em' }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span style={{ color: 'var(--zinc-light)' }}>{p.name}:</span>
          <span className="font-semibold" style={{ color: 'var(--white)', fontFamily: 'var(--font-condensed)' }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [clubFilter, setClubFilter] = useState('All');

  useEffect(() => {
    supabase.from('sessions').select('*').order('date', { ascending: true })
      .then(({ data }) => { setSessions(data || []); setLoading(false); });
  }, []);

  // Explode multi-club sessions for filter
  const allClubs = Array.from(new Set(
    sessions.flatMap(s => s.club ? s.club.split(', ') : [])
  ));
  const clubs = ['All', ...allClubs];

  const filtered = clubFilter === 'All'
    ? sessions
    : sessions.filter(s => s.club && s.club.split(', ').includes(clubFilter));

  const chartData = filtered.map((s, i) => ({
    date: format(parseISO(s.date), 'M/d'),
    index: i + 1,
  }));

  const last7 = filtered.filter(s => {
    const d = new Date(s.date);
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7);
    return d >= cutoff;
  }).length;

  if (loading) return (
    <div className="flex items-center justify-center py-32" style={{ color: 'var(--zinc)' }}>
      <Loader2 size={18} className="animate-spin mr-2" />
      <span style={{ fontFamily: 'var(--font-condensed)', letterSpacing: '0.1em' }}>Loading…</span>
    </div>
  );

  return (
    <div className="px-4 py-6 max-w-3xl mx-auto">
      <div className="mb-8 animate-fadein">
        <h1 className="page-header shimmer-text">DASHBOARD</h1>
        <p style={{ fontFamily: 'var(--font-condensed)', color: 'var(--zinc)', letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: '11px' }}>
          Progress Overview
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4">
        {[
          { label: 'Total Sessions', value: sessions.length, icon: Activity, color: 'var(--gold)' },
          { label: 'This Week',      value: last7,           icon: TrendingUp, color: '#60a5fa' },
          { label: 'Clubs Logged',   value: allClubs.length, icon: Target,    color: '#a78bfa' },
          { label: 'Last Club',      value: sessions.slice(-1)[0]?.club?.split(', ')[0] || '—', icon: Navigation, color: '#34d399' },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <div key={label} className={`card animate-fadein-d${i + 1}`}>
            <div className="flex items-start justify-between mb-2">
              <span className="section-title">{label}</span>
              <Icon size={13} style={{ color }} />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color, lineHeight: 1, letterSpacing: '0.04em' }}>{value}</div>
          </div>
        ))}
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-20">
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', color: 'rgba(201,168,76,0.1)', letterSpacing: '0.1em' }}>NO DATA</div>
          <p className="mt-2 text-sm" style={{ color: 'var(--zinc)' }}>Log some sessions to see your progress here</p>
        </div>
      ) : (
        <>
          {/* Club filter */}
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            <span className="section-title mr-1">Filter:</span>
            {clubs.map(c => (
              <button key={c} onClick={() => setClubFilter(c)}
                className="text-xs px-3 py-1 rounded-sm transition-all duration-150"
                style={{
                  fontFamily: 'var(--font-condensed)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                  background: clubFilter === c ? 'var(--gold)' : 'var(--ink-4)',
                  color: clubFilter === c ? 'var(--ink)' : 'var(--zinc)',
                  border: clubFilter === c ? 'none' : '1px solid rgba(255,255,255,0.06)',
                }}>
                {c}
              </button>
            ))}
          </div>

          {/* Sessions chart */}
          <div className="card mb-4 animate-fadein-d2">
            <div className="section-title mb-4">Session Frequency</div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c9a84c" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#c9a84c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 10, fontFamily: 'var(--font-condensed)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="index" name="Session #" stroke="#c9a84c" strokeWidth={2}
                  fill="url(#goldGrad)" dot={{ fill: '#c9a84c', r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Recent log */}
          <div className="card animate-fadein-d3">
            <div className="section-title mb-4">Recent Sessions</div>
            <div className="space-y-1.5">
              {filtered.slice(-10).reverse().map((s, i) => (
                <div key={s.id} className="flex items-start gap-3 py-2.5 px-3 rounded-lg transition-colors"
                  style={{ background: i === 0 ? 'rgba(201,168,76,0.05)' : 'transparent', border: `1px solid ${i === 0 ? 'rgba(201,168,76,0.1)' : 'transparent'}` }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--ink-5)' }}>
                    <span style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', fontSize: '11px', letterSpacing: '0.04em' }}>
                      {s.club?.split(', ')[0]?.slice(0, 2) || '??'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span style={{ fontFamily: 'var(--font-condensed)', fontWeight: 700, color: 'var(--white)', fontSize: '13px' }}>{s.club}</span>
                      <span style={{ fontFamily: 'var(--font-condensed)', fontSize: '11px', color: 'var(--zinc)' }}>{s.type}</span>
                      <span style={{ fontFamily: 'var(--font-condensed)', fontSize: '10px', color: 'var(--zinc)', marginLeft: 'auto' }}>{s.date}</span>
                    </div>
                    {s.distance && <p className="text-xs truncate" style={{ color: 'var(--zinc-light)' }}>↔ {s.distance}</p>}
                    {s.direction && <p className="text-xs truncate" style={{ color: 'var(--zinc-light)' }}>↗ {s.direction}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
