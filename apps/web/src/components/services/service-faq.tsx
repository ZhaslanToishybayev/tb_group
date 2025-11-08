import type { ServiceContent } from '../../lib/api';

export function ServiceFaq({ faqs }: { faqs?: ServiceContent['faqs']; }) {
  if (!faqs || faqs.length === 0) {
    return null;
  }

  return (
    <section className="section bg-slate-900/30" id="service-faq">
      <div className="mx-auto max-w-4xl px-4">
        <h2 className="text-3xl font-semibold text-white sm:text-4xl">Вопросы и ответы</h2>
        <div className="mt-8 space-y-4">
          {faqs.map((faq, index) => (
            <details key={`${faq.question}-${index}`} className="group rounded-2xl border border-white/10 bg-slate-900/60 p-5">
              <summary className="cursor-pointer text-sm font-semibold text-white">
                {faq.question}
              </summary>
              <p className="mt-3 text-sm text-slate-300">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServiceFaq;
