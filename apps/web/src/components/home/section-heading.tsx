import React from 'react';

export function SectionHeading({ title, subtitle, align = 'center' }: { title: string; subtitle?: string; align?: 'left' | 'center'; }) {
  return (
    <div className={`mb-12 ${align === 'center' ? 'text-center' : 'text-left'}`}>
      <h2 className="text-3xl font-semibold text-white sm:text-4xl">{title}</h2>
      {subtitle ? <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">{subtitle}</p> : null}
    </div>
  );
}

export default SectionHeading;
