'use client';

import './globals.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/', label: 'Tasks', labelZh: '任务' },
  { href: '/memory', label: 'Memory', labelZh: '记忆' },
  { href: '/users', label: 'Users', labelZh: '用户' },
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
      <body className="bg-slate-950 text-slate-100 min-h-screen">
        <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
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
                  className="px-3 py-1 text-xs rounded border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
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
      </body>
    </html>
  );
}
