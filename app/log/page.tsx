'use client';

import { useState, useEffect } from 'react';
import { supabase, CLUBS, TRAINING_TYPES } from '@/lib/supabase';
import { format } from 'date-fns';
import { Plus, Trash2, Loader2, Target, Navigation, Activity, StickyNote, Check } from 'lucide-react';

export default function LogPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    clubs: [] as string[],   // multi-select
    type: 'Full Swing',
    note: '',
    distance: '',
    direction: '',
    body_note: '',
  });

  useEffect(() => { fetchSessions(); }, []);

  async function fetchSessions() {
    setLoading(true);
    const { data } = await supabase
      .from('sessions').select('*')
      .order('created_at', { ascending: false }).limit(40);
    setSessions(data || []);
    setLoading(false);
  }

  function toggleClub(club: string) {
    setForm(f => ({
      ...f,
      clubs: f.clubs.includes(club)
        ? f.clubs.filter(c => c !== club)
        : [...f.clubs, club],
    }));
  }

  async function saveSession() {
    if (form.clubs.length === 0) { alert('Select at least one club.'); return; }
    setSaving(true);
    const { error } = await supabase.from('sessions').insert({
      date: new Date().toISOString().split('T')[0],
      club: form.clubs.join(', '),
      type: form.type,
      note: form.note,
      smoothness: 0, contact: 0, body: 0,
      distance: form.distance,
      direction: form.direction,
      body_note: form.body_note,
    });
    setSaving(false);
    if (!error) {
      setForm({ clubs: [], type: 'Full Swing', note: '', distance: '', direction: '', body_note: '' });
      setShowForm(false);
      fetchSessions();
    }
  }

  async function deleteSession(id: string) {
    if (!confirm('Delete this session?')) return;
    await supabase.from('sessions').delete().eq('id', id);
    fetchSessions();
  }

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 animate-fadein">
        <div>
          <h1 className="page-header shimmer-text">LOG</h1>
          <p style={{ color: 'var(--zinc)', fontFamily: 'var(--font-condensed)', letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: '11px' }}>
            Training Sessions
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 mt-1">
          <Plus size={14} />
          New Session
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card mb-6 animate-fadein" style={{ border: '1px solid rgba(201,168,76,0.2)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="section-title mb-0.5">New Session</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--white)', letterSpacing: '0.06em' }}>
                {format(new Date(), 'MMM d, yyyy')}
              </div>
            </div>
            <div style={{ fontFamily: 'var(--font-condensed)', color: 'var(--gold)', fontSize: '13px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {format(new Date(), 'EEEE')}
            </div>
          </div>

          {/* Club multi-select */}
          <div className="mb-5">
            <label className="label flex items-center justify-between mb-2">
              <span>Clubs Used</span>
              {form.clubs.length > 0 && (
                <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{form.clubs.join(' · ')}</span>
              )}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CLUBS.map(club => {
                const selected = form.clubs.includes(club);
                return (
                  <button
                    key={club}
                    type="button"
                    onClick={() => toggleClub(club)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded transition-all duration-150 text-xs"
                    style={{
                      fontFamily: 'var(--font-condensed)',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      background: selected ? 'rgba(201,168,76,0.18)' : 'var(--ink-5)',
                      color: selected ? 'var(--gold)' : 'var(--zinc)',
                      border: selected ? '1px solid rgba(201,168,76,0.4)' : '1px solid rgba(255,255,255,0.06)',
                      transform: selected ? 'scale(1.05)' : 'scale(1)',
                    }}
                  >
                    {selected && <Check size={9} />}
                    {club}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Training type */}
          <div className="mb-5">
            <label className="label mb-2">Training Type</label>
            <div className="flex flex-wrap gap-1.5">
              {TRAINING_TYPES.map(t => {
                const selected = form.type === t;
                return (
                  <button key={t} type="button" onClick={() => setForm({ ...form, type: t })}
                    className="px-3 py-1 rounded text-xs transition-all duration-150"
                    style={{
                      fontFamily: 'var(--font-condensed)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                      background: selected ? 'var(--gold)' : 'var(--ink-5)',
                      color: selected ? 'var(--ink)' : 'var(--zinc)',
                      border: selected ? 'none' : '1px solid rgba(255,255,255,0.06)',
                    }}>
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Result fields */}
          <div className="space-y-3 mb-5">
            {[
              { icon: Target,     key: 'distance',  label: 'Distance',  placeholder: 'e.g. avg 150m, max 165m, ±5m deviation' },
              { icon: Navigation, key: 'direction', label: 'Direction', placeholder: 'e.g. slight fade, ~10yds right' },
              { icon: Activity,   key: 'body_note', label: 'Body',      placeholder: 'e.g. lower back slightly tight, rotation limited' },
              { icon: StickyNote, key: 'note',      label: 'Notes',     placeholder: 'Key focus, observations, things to improve…' },
            ].map(({ icon: Icon, key, label, placeholder }) => (
              <div key={key} className="rounded-lg p-3" style={{ background: 'var(--ink-4)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <label className="label flex items-center gap-1.5 mb-2">
                  <Icon size={10} style={{ color: 'var(--gold)' }} />
                  {label}
                </label>
                {key === 'note' ? (
                  <textarea
                    value={(form as any)[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    rows={2}
                    className="input resize-none text-sm"
                    style={{ background: 'var(--ink-5)' }}
                  />
                ) : (
                  <input
                    type="text"
                    value={(form as any)[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="input text-sm"
                    style={{ background: 'var(--ink-5)' }}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2.5">
            <button onClick={saveSession} disabled={saving} className="btn-primary flex items-center gap-2 flex-1">
              {saving && <Loader2 size={13} className="animate-spin" />}
              {saving ? 'Saving…' : 'Save Session'}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Session list */}
      {loading ? (
        <div className="flex items-center justify-center py-20" style={{ color: 'var(--zinc)' }}>
          <Loader2 size={18} className="animate-spin mr-2" />
          <span style={{ fontFamily: 'var(--font-condensed)', letterSpacing: '0.1em' }}>Loading…</span>
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-20">
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '3.5rem', color: 'rgba(201,168,76,0.12)', letterSpacing: '0.1em' }}>NO DATA</div>
          <p className="mt-2 text-sm" style={{ color: 'var(--zinc)' }}>Hit "New Session" to log your first practice</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s, i) => <SessionCard key={s.id} s={s} index={i} onDelete={() => deleteSession(s.id)} />)}
        </div>
      )}
    </div>
  );
}

function SessionCard({ s, index, onDelete }: { s: any; index: number; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const delayClass = ['animate-fadein', 'animate-fadein-d1', 'animate-fadein-d2', 'animate-fadein-d3'][Math.min(index, 3)];

  const clubs = s.club ? s.club.split(', ') : [];

  return (
    <div className={`card group cursor-pointer transition-all duration-200 ${delayClass}`}
      style={{ border: '1px solid rgba(255,255,255,0.05)' }}
      onClick={() => setExpanded(!expanded)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            {clubs.map((c: string) => <span key={c} className="tag">{c}</span>)}
            <span className="tag-neutral">{s.type}</span>
            <span style={{ fontFamily: 'var(--font-condensed)', fontSize: '11px', color: 'var(--zinc)', marginLeft: 'auto' }}>{s.date}</span>
          </div>
          {s.distance && (
            <div className="flex items-center gap-1.5">
              <Target size={10} style={{ color: 'var(--gold)' }} />
              <span className="text-xs truncate" style={{ color: 'var(--zinc-light)', fontFamily: 'var(--font-condensed)' }}>
                {s.distance.length > 50 ? s.distance.slice(0, 50) + '…' : s.distance}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-5 h-5 rounded flex items-center justify-center"
            style={{ background: 'var(--ink-5)', transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0)' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--zinc)' }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
          <button onClick={e => { e.stopPropagation(); onDelete(); }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
            style={{ color: 'var(--zinc)' }}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 space-y-2.5 animate-fadein" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {[
            { icon: Target,     label: 'Distance', value: s.distance },
            { icon: Navigation, label: 'Direction', value: s.direction },
            { icon: Activity,   label: 'Body',      value: s.body_note },
            { icon: StickyNote, label: 'Notes',     value: s.note },
          ].filter(f => f.value).map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="flex items-center gap-1.5 shrink-0 mt-0.5" style={{ width: '72px' }}>
                <Icon size={10} style={{ color: 'var(--gold)' }} />
                <span style={{ fontFamily: 'var(--font-condensed)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--zinc)', textTransform: 'uppercase' }}>
                  {label}
                </span>
              </div>
              <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--zinc-light)' }}>{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
