'use client';

import './globals.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/', label: 'Tasks', labelZh: '任务', icon: '📋' },
  { href: '/memory', label: 'Memory', labelZh: '记忆', icon: '🧠' },
  { href: '/users', label: 'Users', labelZh: '用户', icon: '👤' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [lang, setLang] = useState<'en' | 'zh'>('zh');
  const [now, setNow] = useState('');

  useEffect(() => {
    const update = () => {
      setNow(new Date().toLocaleString('zh-TW', {
        month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false,
      }));
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <html lang={lang === 'zh' ? 'zh-TW' : 'en'}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="bg-slate-950 text-slate-100 min-h-screen pb-20 lg:pb-0">
        {/* Desktop Top Nav */}
        <nav className="hidden lg:block bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center gap-1">
                {navItems.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        active
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {lang === 'zh' ? item.labelZh : item.label}
                    </Link>
                  );
                })}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-500 font-mono">{now}</span>
                <button
                  onClick={() => setLang(l => l === 'en' ? 'zh' : 'en')}
                  className="i18n-badge"
                >
                  {lang === 'zh' ? 'EN' : '中'}
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 py-6">
          {children}
        </main>

        {/* Mobile Bottom Tab Bar — with blur backdrop */}
        <nav className="bottom-nav fixed bottom-0 left-0 right-0 lg:hidden bg-slate-900/90 border-t border-slate-800/80 flex justify-around py-2 z-50 safe-area-bottom">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`bottom-nav-tab flex flex-col items-center gap-0.5 px-4 py-1 text-xs transition-colors ${
                  active ? 'bottom-nav-tab-active text-indigo-400' : 'text-slate-500'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{lang === 'zh' ? item.labelZh : item.label}</span>
              </Link>
            );
          })}
        </nav>
      </body>
    </html>
  );
}
