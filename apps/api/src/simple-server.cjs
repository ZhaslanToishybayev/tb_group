// Simple API Server - No imports, just basic functionality
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 4001;

// Basic middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
}));

// Basic routes
app.get('/', (req, res) => {
  res.json({
    message: 'TB Group API Server',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/contact', (req, res) => {
  res.json({
    message: 'Contact endpoint - ready for form submissions',
    method: 'POST',
    fields: ['name', 'email', 'phone', 'company', 'message']
  });
});

app.post('/api/contact', (req, res) => {
  console.log('📨 New contact form submission:', {
    timestamp: new Date().toISOString(),
    data: req.body
  });

  const { name, email, phone, company, message } = req.body;

  // Validation
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'Пожалуйста, заполните обязательные поля: имя, email и сообщение'
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Пожалуйста, введите корректный email адрес'
    });
  }

  // Simulate saving to database (would integrate with Bitrix24 here)
  const contactData = {
    id: Date.now(),
    name,
    email,
    phone: phone || '',
    company: company || '',
    message,
    timestamp: new Date().toISOString(),
    status: 'new'
  };

  console.log('✅ Contact data processed:', contactData);

  // Success response
  res.status(200).json({
    success: true,
    message: 'Сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.',
    data: {
      id: contactData.id,
      status: 'received'
    }
  });
});

// Cases endpoints
app.get('/api/cases', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        title: "Разработка корпоративного портала для TechVision",
        client: "TechVision Solutions",
        category: "Веб-разработка",
        industry: "IT консалтинг",
        tags: ["React", "Node.js", "PostgreSQL", "Docker"],
        image: "/api/cases/techvision-hero.jpg",
        overview: "Создание современного корпоративного портала с интеграцией CRM и автоматизацией бизнес-процессов.",
        challenge: "Клиенту требовался обновленный корпоративный сайт с улучшенной производительностью и интеграцией с существующей CRM системой.",
        solution: "Разработали full-stack приложение на React и Node.js, оптимизировали производительность и интегрировали с Bitrix24.",
        results: {
          trafficIncrease: "+180%",
          conversionRate: "3.2%",
          loadingSpeed: "1.2 секунды",
          userSatisfaction: "95%"
        },
        technologies: ["React 18", "Next.js 14", "TypeScript", "Node.js", "PostgreSQL", "Docker", "Bitrix24"],
        duration: "4 месяца",
        teamSize: "5 человек",
        status: "completed",
        completedAt: "2024-10-15",
        testimonial: {
          quote: "TB Group создали потрясающий портал, который значительно улучшил наши бизнес-процессы.",
          author: "Анна Петрова",
          position: "CEO",
          photo: "/api/cases/techvision-ceo.jpg"
        }
      },
      {
        id: 2,
        title: "Мобильное приложение для delivery сервиса FoodExpress",
        client: "FoodExpress Kazakhstan",
        category: "Мобильные приложения",
        industry: "Еда и доставка",
        tags: ["React Native", "iOS", "Android", "Payment Gateway"],
        image: "/api/cases/foodexpress-hero.jpg",
        overview: "Разработка кроссплатформенного мобильного приложения для заказа и доставки еды с интеграцией платежных систем.",
        challenge: "Необходимо было создать удобное мобильное приложение с поддержкой iOS и Android, интеграцией с ресторанами и системами оплаты.",
        solution: "Разработали React Native приложение с нативными модулями, интегрировали с 50+ ресторанами и системами онлайн-оплаты.",
        results: {
          appRating: "4.8/5",
          dailyOrders: "2,000+",
          partnerIncrease: "+65%",
          userRetention: "85%"
        },
        technologies: ["React Native", "Redux", "TypeScript", "Stripe", "Apple Pay", "Google Pay", "Firebase"],
        duration: "6 месяцев",
        teamSize: "7 человек",
        status: "completed",
        completedAt: "2024-09-01",
        testimonial: {
          quote: "Приложение изменило наш бизнес! Заказы выросли в 3 раза за первые 3 месяца.",
          author: "Александр Иванов",
          position: "Operations Director",
          photo: "/api/cases/foodexpress-director.jpg"
        }
      },
      {
        id: 3,
        title: "E-commerce платформа для FashionBrand",
        client: "FashionBrand Central Asia",
        category: "E-commerce",
        industry: "Fashion и ритейл",
        tags: ["Shopify", "Custom Development", "Payment", "Logistics"],
        image: "/api/cases/fashionbrand-hero.jpg",
        overview: "Создание современной e-commerce платформы с кастомными функциями и интеграцией с логистическими системами.",
        challenge: "Клиент требовал гибкую платформу для онлайн-продажи одежды с возможностью кастомизации и интеграцией с системами доставки.",
        solution: "Разработали кастомное e-commerce решение на основе Shopify с расширенными функциями управления товаром и интеграцией с 10+ логистическими компаниями.",
        results: {
          onlineRevenue: "+250%",
          conversionRate: "4.1%",
          cartAbandonment: "25%",
          averageOrder: "$85"
        },
        technologies: ["Shopify Plus", "React", "Node.js", "MongoDB", "Stripe", "GraphQL", "Docker"],
        duration: "5 месяцев",
        teamSize: "6 человек",
        status: "completed",
        completedAt: "2024-08-20",
        testimonial: {
          quote: "Платформа превзошла все наши ожидания! Отличная работа команды TB Group.",
          author: "Мария Сидорова",
          position: "Marketing Director",
          photo: "/api/cases/fashionbrand-marketing.jpg"
        }
      },
      {
        id: 4,
        title: "Digital-маркетинговая стратегия для StartupHub",
        client: "StartupHub Almaty",
        category: "Digital-маркетинг",
        industry: "Стартапы и инновации",
        tags: ["SEO", "SMM", "Content", "Analytics"],
        image: "/api/cases/startuphub-hero.jpg",
        overview: "Разработка и реализация комплексной digital-маркетинговой стратегии для продвижения стартап-акселератора.",
        challenge: "Стартап-акселератор нуждался в повышении узнаваемости и привлечении качественных стартап-проектов.",
        solution: "Разработали комплексную стратегию включающую SEO-оптимизацию, SMM, контент-маркетинг и настройку аналитики.",
        results: {
          organicTraffic: "+450%",
          socialEngagement: "+320%",
          applicationIncrease: "+180%",
          brandAwareness: "3х рост"
        },
        technologies: ["Google Analytics 4", "SEMrush", "Meta Business Suite", "HubSpot", "Contentful"],
        duration: "3 месяца",
        teamSize: "4 человека",
        status: "ongoing",
        testimonial: {
          quote: "Результаты превзошли наши ожидания! Качество applicants значительно улучшилось.",
          author: "Елена Козлова",
          position: "Program Manager",
          photo: "/api/cases/startuphub-manager.jpg"
        }
      },
      {
        id: 5,
        title: "Облачная CRM система для IndustrialTech",
        client: "IndustrialTech Solutions",
        category: "Разработка ПО",
        industry: "Промышленные технологии",
        tags: ["Cloud", "SaaS", "React", "Node.js", "AWS"],
        image: "/api/cases/industrialtech-hero.jpg",
        overview: "Разработка облачной CRM-системы для управления взаимоотношениями с клиентами в B2B секторе.",
        challenge: "Индустриальной компании требовалась кастомная CRM для управления сложными B2B циклами продаж и интеграции с ERP системами.",
        solution: "Разработали SaaS платформу на React и Node.js с микросервисной архитектурой и интеграцией с существующими ERP системами.",
        results: {
          salesEfficiency: "+210%",
          dataAccuracy: "99.8%",
          userAdoption: "92%",
          supportTickets: "-40%"
        },
        technologies: ["React", "Node.js", "PostgreSQL", "Redis", "AWS", "Docker", "Kubernetes", "MongoDB"],
        duration: "8 месяцев",
        teamSize: "9 человек",
        status: "completed",
        completedAt: "2024-11-01",
        testimonial: {
          quote: "CRM-система оптимизировала наши процессы и значительно повысила эффективность отдела продаж.",
          author: "Дмитрий Михайлов",
          position: "Sales Director",
          photo: "/api/cases/industrialtech-director.jpg"
        }
      },
      {
        id: 6,
        title: "FinTech приложение для BankTech",
        client: "BankTech Innovations",
        category: "FinTech",
        industry: "Финансовые технологии",
        tags: ["Mobile Banking", "Security", "API", "Compliance"],
        image: "/api/cases/banktech-hero.jpg",
        overview: "Разработка безопасного мобильного банковского приложения с поддержкой биометрической аутентификации.",
        challenge: "Банку требовалось современное мобильное приложение с высоким уровнем безопасности и соответствием финансовым регуляциям.",
        solution: "Разработали мобильное приложение с биометрической аутентификацией, шифрованием данных и интеграцией с банковскими API.",
        results: {
          userSatisfaction: "96%",
          transactionSecurity: "100%",
          appStoreRating: "4.9/5",
          dailyTransactions: "15,000+"
        },
        technologies: ["React Native", "TypeScript", "Node.js", "JWT", "Biometric SDK", "HSM", "PostgreSQL"],
        duration: "7 месяцев",
        teamSize: "8 человек",
        status: "completed",
        completedAt: "2024-07-15",
        testimonial: {
          quote: "Приложение установило новые стандарты безопасности и удобства для наших клиентов.",
          author: "Виктор Романов",
          position: "CTO",
          photo: "/api/cases/banktech-cto.jpg"
        }
      }
    ]
  });
});

app.get('/api/cases/:id', (req, res) => {
  const caseId = parseInt(req.params.id);

  const mockCases = [
    {
      id: 1,
      title: "Разработка корпоративного портала для TechVision",
      client: "TechVision Solutions",
      category: "Веб-разработка",
      industry: "IT консалтинг",
      tags: ["React", "Node.js", "PostgreSQL", "Docker"],
      image: "/api/cases/techvision-hero.jpg",
      overview: "Создание современного корпоративного портала с интеграцией CRM и автоматизацией бизнес-процессов.",
      challenge: "Клиенту требовался обновленный корпоративный сайт с улучшенной производительностью и интеграцией с существующей CRM системой.",
      solution: "Разработали full-stack приложение на React и Node.js, оптимизировали производительность и интегрировали с Bitrix24.",
      results: {
        trafficIncrease: "+180%",
        conversionRate: "3.2%",
        loadingSpeed: "1.2 секунды",
        userSatisfaction: "95%"
      },
      technologies: ["React 18", "Next.js 14", "TypeScript", "Node.js", "PostgreSQL", "Docker", "Bitrix24"],
      duration: "4 месяца",
      teamSize: "5 человек",
      status: "completed",
      completedAt: "2024-10-15",
      testimonial: {
        quote: "TB Group создали потрясающий портал, который значительно улучшил наши бизнес-процессы.",
        author: "Анна Петрова",
        position: "CEO",
        photo: "/api/cases/techvision-ceo.jpg"
      }
    }
  ];

  const caseItem = mockCases.find(c => c.id === caseId);

  if (!caseItem) {
    return res.status(404).json({
      success: false,
      message: 'Кейс не найден'
    });
  }

  res.json({
    success: true,
    data: caseItem
  });
});

// Get cases by category
app.get('/api/cases/category/:category', (req, res) => {
  const category = req.params.category;

  // Filter cases by category (in real app, this would query database)
  const filteredCases = [
    {
      id: 1,
      title: "Разработка корпоративного портала для TechVision",
      category: "Веб-разработка"
    }
  ].filter(c => c.category.toLowerCase() === category.toLowerCase());

  res.json({
    success: true,
    data: filteredCases
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 TB Group API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📝 Contact endpoint: http://localhost:${PORT}/api/contact`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down API server...');
  server.close(() => {
    console.log('✅ API server stopped');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down API server...');
  server.close(() => {
    console.log('✅ API server stopped');
    process.exit(0);
  });
});