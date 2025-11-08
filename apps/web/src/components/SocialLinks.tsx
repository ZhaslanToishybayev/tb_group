import type { SocialLink } from '../types/contact';

type SocialLinksProps = {
  links: SocialLink[];
};

export function SocialLinks({ links }: SocialLinksProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
      <h3 className="text-sm font-semibold text-white mb-4">Мы в социальных сетях</h3>
      <div className="grid grid-cols-2 gap-3">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 p-2 rounded-lg border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all duration-200"
          >
            <div 
              className={`w-4 h-4 rounded ${link.color || 'bg-blue-500'}`}
              style={{ backgroundColor: link.color }}
            />
            <span className="text-xs text-slate-300">{link.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}