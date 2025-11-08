import type { Metadata } from 'next';
import { motion } from 'framer-motion';

import { CompanyStory, TeamGrid, type StoryParagraph, type Milestone, type TeamMember } from '../../../components/content';

export const metadata: Metadata = {
  title: 'О компании — TB Group',
};

// Временные данные до подключения API
const storyParagraphs: StoryParagraph[] = [
  {
    id: '1',
    text: 'TB Group — команда экспертов по цифровой трансформации бизнеса. Мы помогаем компаниям автоматизировать процессы, управлять данными и повышать эффективность через современные облачные решения.',
  },
  {
    id: '2',
    text: 'Наша миссия — делать сложные технологии простыми и понятными. Мы не просто внедряем системы, а создаём целостные экосистемы, которые работают на ваш бизнес.',
    highlight: true,
  },
  {
    id: '3',
    text: 'За годы работы мы накопили уникальную экспертизу в области интеграций и автоматизации. Каждый наш проект — это инвестиция в будущее вашей компании.',
  },
];

const milestones: Milestone[] = [
  {
    id: '1',
    year: '2018',
    title: 'Основание компании',
    description: 'Начало деятельности в области автоматизации складских операций и учёта',
  },
  {
    id: '2',
    year: '2020',
    title: 'Расширение услуг',
    description: 'Запуск интеграционных проектов с Мой Склад и Битрикс24',
  },
  {
    id: '3',
    year: '2022',
    title: 'Развитие экспертизы',
    description: 'Создание собственной команды разработчиков и аналитиков',
  },
  {
    id: '4',
    year: '2024',
    title: 'Новые горизонты',
    description: 'Выход на рынок корпоративных решений и внедрение AI-инструментов',
  },
];

const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Александр Петров',
    position: 'CEO',
    bio: '15 лет в сфере автоматизации бизнес-процессов. Эксперт по интеграции ERP и CRM систем.',
    email: 'a.petrov@tbgroup.kz',
  },
  {
    id: '2',
    name: 'Мария Иванова',
    position: 'CTO',
    bio: 'Технический лидер с опытом архитектурного проектирования сложных систем.',
    email: 'm.ivanova@tbgroup.kz',
  },
  {
    id: '3',
    name: 'Дмитрий Сидоров',
    position: 'Lead Developer',
    bio: 'Ведущий разработчик, специалист по Node.js и React. Руководит командой разработки.',
    email: 'd.sidorov@tbgroup.kz',
  },
  {
    id: '4',
    name: 'Елена Козлова',
    position: 'Project Manager',
    bio: 'Сертифицированный PM с опытом управления проектами в IT более 8 лет.',
    email: 'e.kozlova@tbgroup.kz',
  },
];

export default function AboutPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="section"
    >
      <div className="mx-auto max-w-6xl px-4">
        <motion.h1
          className="text-4xl md:text-5xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          О компании TB Group
        </motion.h1>

        <motion.p
          className="text-xl text-slate-300 mb-16 max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Команда экспертов по цифровой трансформации бизнеса
        </motion.p>

        {/* Company Story */}
        <CompanyStory
          title="Наша история"
          subtitle="С 2018 года мы помогаем компаниям автоматизировать процессы и повышать эффективность"
          paragraphs={storyParagraphs}
          milestones={milestones}
        />

        {/* Team Section */}
        <motion.div
          className="mt-32"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
            Наша команда
          </h2>
          <p className="text-lg text-slate-300 mb-12 text-center max-w-2xl mx-auto">
            Эксперты с многолетним опытом в области автоматизации и интеграции
          </p>
          <TeamGrid members={teamMembers} />
        </motion.div>

        {/* CTA */}
        <motion.section
          className="mt-32 text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Готовы помочь вашему бизнесу
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Свяжитесь с нами для консультации и обсуждения вашего проекта
          </p>
          <motion.a
            href="/contact"
            className="inline-block rounded-xl bg-gradient-to-r from-blue-500 to-blue-400 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-blue-500/40 hover:from-blue-400 hover:to-blue-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Связаться с нами
          </motion.a>
        </motion.section>
      </div>
    </motion.div>
  );
}
