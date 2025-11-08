export function ContactMap() {
  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden">
      <div className="aspect-[4/3] overflow-hidden">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2906.301351727823!2d76.91292331544531!3d43.2389499791335!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3883692b0b4b4b4b%3A0x1234567890abcdef!2sAlmaty!5e0!3m2!1sen!2sk!4v1234567890"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="TB Group Office Location"
          className="w-full h-full"
        />
      </div>
      <div className="p-4 bg-slate-900/60">
        <p className="text-sm text-slate-300">
          <strong>Адрес:</strong> г. Алматы, ул. Примерная 1
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Пн-Пт: 9:00-18:00, Сб: 10:00-15:00
        </p>
      </div>
    </div>
  );
}