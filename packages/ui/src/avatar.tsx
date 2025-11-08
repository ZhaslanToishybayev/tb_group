import * as React from 'react';
import * as RadixAvatar from '@radix-ui/react-avatar';

import { cn } from './utils.js';

export type AvatarProps = {
  name: string;
  src?: string | null;
  className?: string;
};

export const Avatar: React.FC<AvatarProps> = ({ name, src, className }) => {
  const initials = React.useMemo(() => {
    if (!name.trim()) {
      return 'A';
    }
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  }, [name]);

  return (
    <RadixAvatar.Root
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-full border border-white/5 bg-slate-900 text-sm font-semibold uppercase text-white',
        className,
      )}
    >
      {src ? (
        <RadixAvatar.Image src={src} alt={name} className="h-full w-full rounded-full object-cover" />
      ) : null}
      <RadixAvatar.Fallback delayMs={100}>{initials}</RadixAvatar.Fallback>
    </RadixAvatar.Root>
  );
};

export default Avatar;
