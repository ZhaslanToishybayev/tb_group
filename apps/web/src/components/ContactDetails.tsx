import type { ContactInfo } from '../types/contact';

type ContactDetailsProps = {
  contacts: ContactInfo[];
};

export function ContactDetails({ contacts }: ContactDetailsProps) {
  return (
    <aside className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/60 p-6 text-sm text-slate-200">
      {contacts.map((item) => (
        <div key={item.label}>
          <div className="text-xs uppercase tracking-wide text-blue-400">{item.label}</div>
          {item.href ? (
            <a 
              href={item.href} 
              className="hover:text-white transition-colors"
              {...(item.href.startsWith('http') ? { rel: 'noreferrer', target: '_blank' } : {})}
            >
              {item.value}
            </a>
          ) : (
            <p>{item.value}</p>
          )}
        </div>
      ))}
    </aside>
  );
}