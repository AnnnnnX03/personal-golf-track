'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { BookOpen, Video, BarChart2, Columns } from 'lucide-react';

const links = [
  { href: '/log',       label: 'Log',       sub: 'Training Log',  icon: BookOpen  },
  { href: '/videos',    label: 'Videos',    sub: 'Library',       icon: Video     },
  { href: '/compare',   label: 'Compare',   sub: 'Side by Side',  icon: Columns   },
  { href: '/dashboard', label: 'Dashboard', sub: 'Progress',      icon: BarChart2 },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <>
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-56 flex-col z-50"
        style={{ background: 'var(--ink-2)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>

        {/* Logo */}
        <div className="px-5 py-5 flex flex-col items-start"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="relative mb-1" style={{ width: '110px', height: '38px' }}>
            <Image
              src="/MiaXu_Logo_white.png"
              alt="Mia Xu"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
          <span style={{
            fontFamily: 'var(--font-condensed)',
            color: 'var(--zinc)',
            fontSize: '9px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
          }}>
            Golf Training
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {links.map(({ href, label, sub, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link key={href} href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group relative"
                style={{
                  background: active ? 'rgba(201,168,76,0.08)' : 'transparent',
                  borderLeft: active ? '2px solid var(--gold)' : '2px solid transparent',
                }}>
                <Icon size={15} style={{ color: active ? 'var(--gold)' : 'var(--zinc)' }} />
                <div>
                  <div style={{ fontFamily: 'var(--font-condensed)', fontWeight: 700, letterSpacing: '0.06em', fontSize: '13px', color: active ? 'var(--white)' : 'var(--zinc-light)', textTransform: 'uppercase' }}>
                    {label}
                  </div>
                  <div style={{ color: 'var(--zinc)', fontSize: '10px', fontFamily: 'var(--font-condensed)' }}>{sub}</div>
                </div>
                {active && <div className="absolute right-3 w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: 'var(--gold)' }} />}
              </Link>
            );
          })}
        </nav>

        <div className="px-5 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ color: 'var(--zinc)', fontFamily: 'var(--font-condensed)', fontSize: '10px', letterSpacing: '0.08em' }}>Personal MVP</p>
        </div>
      </aside>

      {/* Bottom tab bar — mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex"
        style={{ background: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link key={href} href={href}
              className="flex-1 flex flex-col items-center gap-1 py-3 transition-colors"
              style={{ color: active ? 'var(--gold)' : 'var(--zinc)' }}>
              <Icon size={17} />
              <span style={{ fontFamily: 'var(--font-condensed)', fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
