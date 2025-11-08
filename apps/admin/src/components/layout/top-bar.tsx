import React from 'react';
import { LogOut } from 'lucide-react';

import { useAuth } from '../../providers/auth-provider';
import { Avatar, Button, Card } from '@tb/ui';

export const TopBar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-slate-950/80 backdrop-blur">
      <div className="flex items-center justify-between px-8 py-4">
        <div>
          <h1 className="text-lg font-semibold text-white">Панель управления</h1>
          <p className="text-sm text-slate-400">
            Управляйте контентом сайта TB Group, модерацией и аналитикой.
          </p>
        </div>
        <Card className="flex items-center gap-4 border border-white/10 bg-slate-900/80 px-4 py-3">
          <Avatar name={user?.displayName ?? user?.email ?? 'Администратор'} />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white">{user?.displayName ?? 'Администратор'}</span>
            <span className="text-xs text-slate-400">{user?.email}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              void logout();
            }}
            title="Выйти"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </Card>
      </div>
    </header>
  );
};

export default TopBar;
