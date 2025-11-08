import React from 'react';
import { Outlet } from 'react-router-dom';

import { SidebarNav } from './sidebar-nav';
import { TopBar } from './top-bar';

export const AppLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-slate-950">
      <SidebarNav />
      <div className="flex flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto bg-slate-950/80 px-8 pb-12 pt-6">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
