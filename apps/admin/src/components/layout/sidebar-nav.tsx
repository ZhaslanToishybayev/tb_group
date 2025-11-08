import React from 'react';
import {
  BarChartHorizontal,
  BookCopy,
  Boxes,
  FileImage,
  Layers,
  Settings,
  Sparkles,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { cn } from '@tb/ui';

const NAV_ITEMS = [
  { label: 'Дэшборд', to: '/', icon: Sparkles },
  { label: 'Услуги', to: '/services', icon: Layers },
  { label: 'Кейсы', to: '/cases', icon: BookCopy },
  { label: 'Отзывы', to: '/reviews', icon: BarChartHorizontal },
  { label: 'Баннеры', to: '/banners', icon: Boxes },
  { label: 'Настройки', to: '/settings', icon: Settings },
  { label: 'Медиа', to: '/media', icon: FileImage },
] as const;

export const SidebarNav: React.FC = () => (
  <aside className="flex w-64 flex-col border-r border-white/5 bg-slate-950/90 px-5 py-6">
    <div className="flex items-center gap-3 px-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-lg font-bold">
        TB
      </div>
      <div>
        <p className="text-sm font-semibold text-white">TB Group Admin</p>
        <p className="text-xs text-slate-400">Управление контентом</p>
      </div>
    </div>
    <nav className="mt-8 space-y-2">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition',
              isActive
                ? 'bg-brand-500/15 text-brand-100'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white',
            )
          }
        >
          <item.icon className="h-4 w-4" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  </aside>
);

export default SidebarNav;
