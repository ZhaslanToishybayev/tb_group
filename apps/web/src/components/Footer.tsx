const links = [
  { href: 'mailto:info@tbgroup.kz', label: 'info@tbgroup.kz' },
  { href: 'tel:+77001234567', label: '+7 (700) 123-45-67' },
  { href: 'https://t.me/tbgroup', label: 'Telegram' },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-400">© {new Date().getFullYear()} TB Group. Все права защищены.</div>
        <div className="flex gap-4 text-sm text-slate-300">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-white"
              target={link.href.startsWith('http') ? '_blank' : undefined}
              rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
