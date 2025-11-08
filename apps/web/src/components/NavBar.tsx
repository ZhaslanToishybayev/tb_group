'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const links = [
  { href: '/', label: 'Главная' },
  { href: '/services', label: 'Услуги' },
  { href: '/cases', label: 'Кейсы' },
  { href: '/reviews', label: 'Отзывы' },
  { href: '/about', label: 'О компании' },
  { href: '/contact', label: 'Контакты' },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur border-b border-white/10">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          TB Group
        </Link>
        <div className="hidden items-center gap-6 md:flex">
          {links.map(({ href, label }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className="relative text-sm font-medium text-slate-300 hover:text-white">
                {label}
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute left-0 -bottom-1 h-[2px] w-full rounded bg-blue-500"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}

export default NavBar;
