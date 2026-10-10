-- ============================================================================
-- DAVE TECHS ACADEMY — AUTHORITATIVE SEED DATA (seed.sql)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. COURSE CATEGORIES
-- ----------------------------------------------------------------------------
INSERT INTO public.course_categories (id, name, slug, icon, description, sort_order)
VALUES
  ('software-engineering', 'Software Engineering', 'software-engineering', 'Code', 'Modern frontend, backend, and full-stack software development.', 1),
  ('data-ai', 'Data & Artificial Intelligence', 'data-ai', 'Database', 'Data science, analytics, machine learning, and AI application engineering.', 2),
  ('design-product', 'Design & Product', 'design-product', 'Layout', 'User experience, product design, wireframing, and design systems.', 3),
  ('cybersecurity-cloud', 'Cybersecurity & Cloud', 'cybersecurity-cloud', 'Shield', 'Cloud architecture, infrastructure security, and penetration testing.', 4)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description;

-- ----------------------------------------------------------------------------
-- 2. BRANCHES / CAMPUSES
-- ----------------------------------------------------------------------------
INSERT INTO public.branches (id, name, slug, city, state, address, phone, email, capacity, facilities)
VALUES
  (
    'branch-abeokuta-main',
    'Abeokuta Main Campus',
    'abeokuta-main',
    'Abeokuta',
    'Ogun State',
    'Plot 14, Tech Innovation Boulevard, Ibara, Abeokuta',
    '+234 812 345 6789',
    'abeokuta@davetechs.com',
    120,
    '["High-Speed Fiber Internet", "Air-Conditioned Labs", "24/7 Solar Power Backup", "Collaborative Lounge", "Hardware Sandbox"]'::jsonb
  ),
  (
    'branch-vi-executive',
    'Victoria Island Executive Campus',
    'vi-executive',
    'Lagos',
    'Lagos State',
    'Suite 400, Bishop Aboyade Cole Street, Victoria Island, Lagos',
    '+234 809 111 2233',
    'vi@davetechs.com',
    80,
    '["Executive Boardroom Labs", "Ultra-Fast Starlink Uplink", "Catering & Coffee Lounge", "Private Podcasting Studio"]'::jsonb
  ),
  (
    'branch-ikeja-hub',
    'Ikeja Tech Hub',
    'ikeja-hub',
    'Ikeja',
    'Lagos State',
    '28 Allen Avenue, Ikeja, Lagos',
    '+234 802 333 4455',
    'ikeja@davetechs.com',
    100,
    '["Dual-Monitor Coding Stations", "Testing Device Lab", "Quiet Study Zone", "Auditorium"]'::jsonb
  ),
  (
    'branch-ibadan-innovation',
    'Ibadan Innovation Center',
    'ibadan-innovation',
    'Ibadan',
    'Oyo State',
    '5 Ring Road, Opposite High Court, Ibadan',
    '+234 803 777 8899',
    'ibadan@davetechs.com',
    90,
    '["Fiber WiFi", "Maker Space", "Dedicated Mentorship Rooms", "Recreational Zone"]'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  capacity = EXCLUDED.capacity,
  facilities = EXCLUDED.facilities;

-- ----------------------------------------------------------------------------
-- 3. INSTRUCTORS
-- ----------------------------------------------------------------------------
INSERT INTO public.instructors (id, name, role, bio, image, rating, students_count, courses_count, experience_years, credentials, specialties)
VALUES
  (
    'inst-david-og',
    'David Ogundepo',
    'Lead Solutions Architect & Founder',
    'Principal architect with 12+ years building enterprise fintech, cloud solutions, and training 5,000+ engineers across Africa.',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600',
    4.98,
    2840,
    4,
    12,
    '["AWS Certified Solutions Architect", "Google Cloud Fellow", "MSc Computer Science"]'::jsonb,
    '["Distributed Systems", "Full-Stack Architecture", "PostgreSQL", "Cloud Security"]'::jsonb
  ),
  (
    'inst-sarah-adebayo',
    'Sarah Adebayo',
    'Senior Frontend Engineer',
    'Ex-Paystack UI engineer specialized in React, TypeScript, design systems, and web performance optimization.',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600',
    4.95,
    1920,
    2,
    8,
    '["Meta Certified Frontend Developer", "Design Systems Specialist"]'::jsonb,
    '["React", "TypeScript", "TailwindCSS & Modern CSS", "State Management", "Micro-frontends"]'::jsonb
  ),
  (
    'inst-michael-chukwu',
    'Michael Chukwu',
    'Head of Data Science & AI',
    'Machine learning researcher and consultant with extensive experience deploying predictive models for African financial institutions.',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
    4.92,
    1450,
    2,
    9,
    '["TensorFlow Certified Developer", "PhD Applied Statistics"]'::jsonb,
    '["Python", "Pandas", "Scikit-Learn", "Deep Learning", "LLMs & GenAI"]'::jsonb
  ),
  (
    'inst-grace-ekong',
    'Grace Ekong',
    'Product Design Lead',
    'Senior UI/UX designer and product strategist crafting delightful digital products for international tech startups.',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=600',
    4.97,
    1780,
    2,
    7,
    '["NN/g UX Master Certified", "Figma Design Advocate"]'::jsonb,
    '["User Research", "Wireframing & Prototyping", "Design Systems", "Usability Testing"]'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  bio = EXCLUDED.bio,
  rating = EXCLUDED.rating,
  students_count = EXCLUDED.students_count;

-- ----------------------------------------------------------------------------
-- 4. COURSES
-- ----------------------------------------------------------------------------
INSERT INTO public.courses (
  id, slug, title, tagline, description, full_description, category_id,
  level, duration, format, badge, popular, featured, price, original_price,
  rating, reviews_count, instructor_id, syllabus, weekly_objectives, capstone_projects, prerequisites, faqs, learning_outcomes
)
VALUES
  (
    'course-frontend-dev',
    'frontend-development',
    'Frontend Web Development (React & TypeScript)',
    'Master modern web engineering from semantic UI to production React applications.',
    'Comprehensive hands-on training in HTML5, CSS3, modern JavaScript (ES6+), TypeScript, React 18, State Management, and Next.js foundations.',
    'Master the art of building responsive, production-ready frontend web applications. In this course, you will learn HTML5, CSS3, modern JavaScript (ES6+), TypeScript, React, state management, and modern component architecture with rigorous real-world capstone projects.',
    'software-engineering',
    'Beginner to Intermediate',
    '12 Weeks',
    'Online & Physical',
    'Most Popular',
    true,
    true,
    120000.00,
    180000.00,
    4.95,
    342,
    'inst-sarah-adebayo',
    '[
      {"week": 1, "title": "Modern HTML5 & Semantic Web Architecture", "topics": ["Semantic elements", "Accessibility (a11y)", "SEO meta standards", "DOM structures"]},
      {"week": 2, "title": "Advanced CSS3, Flexbox & Grid Systems", "topics": ["CSS Grid layout", "Flexbox mastery", "Responsive design", "CSS custom properties"]},
      {"week": 3, "title": "Modern JavaScript (ES6+) Fundamentals", "topics": ["Scoping & closures", "Async/Await & Promises", "Array methods", "DOM manipulation"]},
      {"week": 4, "title": "TypeScript for Web Developers", "topics": ["Type annotations & interfaces", "Generics", "Type narrowing", "Strict mode tooling"]},
      {"week": 5, "title": "React 18 Core & Component Lifecycles", "topics": ["JSX syntax", "Props & state", "Hooks (useState, useEffect, useMemo)", "Custom hooks"]},
      {"week": 6, "title": "State Management & React Router DOM", "topics": ["Context API", "Client-side routing", "Data loaders", "Zustand"]},
      {"week": 7, "title": "API Integration, TanStack Query & Supabase", "topics": ["REST APIs", "Supabase Client", "Real-time subscriptions", "Optimistic updates"]},
      {"week": 8, "title": "Frontend Testing & CI/CD Pipelines", "topics": ["Vitest & React Testing Library", "Unit tests", "Vercel deployments", "Lighthouse audits"]}
    ]'::jsonb,
    '[
      "Build complex, accessible responsive UIs from Figma specs",
      "Write robust, type-safe code using TypeScript and modern ES standards",
      "Architect clean React component hierarchies with custom hooks",
      "Deploy production applications with continuous integration and automated testing"
    ]'::jsonb,
    '[
      {"title": "Multi-Vendor Marketplace SPA", "description": "Interactive commerce store with filtering, cart state, and real-time checkout simulation."},
      {"title": "Academy LMS Student Dashboard", "description": "Full-featured learning portal with lesson tracking, video progress, and dark/light themes."}
    ]'::jsonb,
    '["Basic computer literacy", "Dedication of 10-15 hours per week", "Personal laptop (Windows/Mac/Linux with min. 8GB RAM)"]'::jsonb,
    '[
      {"question": "Is this course beginner-friendly?", "answer": "Yes! We start from absolute web fundamentals before advancing into React and TypeScript."},
      {"question": "Do I receive a certificate upon completion?", "answer": "Yes, all students who complete assignments and their capstone project receive a cryptographically verifiable certificate."}
    ]'::jsonb,
    '["Semantic HTML5 & responsive CSS", "TypeScript & modern JavaScript", "React 18 & Hook ecosystem", "Production build optimization"]'::jsonb
  ),
  (
    'course-backend-eng',
    'backend-engineering',
    'Backend Engineering & Cloud Architecture',
    'Build high-throughput APIs, scalable databases, and cloud infrastructure.',
    'Master server-side development with Node.js/TypeScript, PostgreSQL, Redis caching, Supabase Edge Functions, RESTful design, and containerization with Docker.',
    'Dive deep into backend engineering. Master relational database modeling with PostgreSQL, high-concurrency microservices, JWT authentication, caching with Redis, Edge Functions, automated CI/CD, and Docker containerization.',
    'software-engineering',
    'Intermediate to Advanced',
    '14 Weeks',
    'Online & Physical',
    'High Demand',
    true,
    true,
    140000.00,
    200000.00,
    4.98,
    215,
    'inst-david-og',
    '[
      {"week": 1, "title": "Server Architecture & Protocol Fundamentals", "topics": ["HTTP/2 & HTTP/3", "RESTful patterns", "Node.js runtime", "TypeScript server setup"]},
      {"week": 2, "title": "Relational Databases & PostgreSQL Mastery", "topics": ["Schema design & normalization", "Foreign keys & indexes", "Triggers & stored procedures", "Query planning"]},
      {"week": 3, "title": "Row Level Security (RLS) & Supabase Backend", "topics": ["Supabase architecture", "RLS policies", "Edge Functions (Deno)", "Webhooks"]},
      {"week": 4, "title": "Authentication, JWT & Cryptographic Security", "topics": ["OAuth2 & Supabase Auth", "Bcrypt & Argon2", "Session handling", "RBAC authorization"]},
      {"week": 5, "title": "Financial Gateways & Paystack Integration", "topics": ["Server-side checkout", "HMAC verification", "Idempotency keys", "Ledger accounting"]},
      {"week": 6, "title": "Caching with Redis & Background Queues", "topics": ["In-memory caching", "Rate limiting", "BullMQ / Job queues", "Pub/Sub messaging"]},
      {"week": 7, "title": "Containerization & Docker Orchestration", "topics": ["Dockerfile optimization", "Docker Compose", "Multi-stage builds", "Volume management"]},
      {"week": 8, "title": "Production Deployment, CI/CD & Monitoring", "topics": ["GitHub Actions", "Prometheus & Grafana", "Logging & Sentry", "Zero-downtime rollouts"]}
    ]'::jsonb,
    '[
      "Design normalized PostgreSQL relational databases with strict RLS policies",
      "Build high-throughput REST APIs and serverless Edge Functions",
      "Integrate Paystack checkout and idempotent payment verification webhooks",
      "Deploy containerized microservices to cloud environments"
    ]'::jsonb,
    '[
      {"title": "Core Banking Ledger & Payment Engine", "description": "High-concurrency financial service with double-entry accounting and Paystack integration."},
      {"title": "Distributed Cloud File Storage Service", "description": "S3-compatible file storage engine with chunked uploads and signed access URLs."}
    ]'::jsonb,
    '["Basic programming knowledge in JavaScript or Python", "Understanding of terminal / command line", "Laptop with 8GB+ RAM"]'::jsonb,
    '[
      {"question": "Will we learn Paystack payment integration?", "answer": "Yes, full server-side initialization, webhook signature verification, and atomic fulfillment are covered in depth."}
    ]'::jsonb,
    '["PostgreSQL modeling & optimization", "Node.js & Supabase Edge Functions", "Paystack payment processing", "Docker containerization"]'::jsonb
  ),
  (
    'course-fullstack-dev',
    'fullstack-software-engineering',
    'Full-Stack Software Engineering Bootcamp',
    'The complete end-to-end software engineering program from UI to database and cloud deployment.',
    'Transform into an elite full-stack engineer. Master React, TypeScript, PostgreSQL, Supabase, Node.js, Cloud Deployment, and DevOps in one comprehensive immersive program.',
    'The premier comprehensive software engineering bootcamp in Africa. Designed to take dedicated learners from fundamentals to production-grade full-stack software architects capable of building scalable web platforms.',
    'software-engineering',
    'Beginner to Advanced',
    '24 Weeks',
    'Online & Physical',
    'Flagship Program',
    true,
    true,
    220000.00,
    320000.00,
    4.99,
    512,
    'inst-david-og',
    '[
      {"week": 1, "title": "Frontend Engineering Foundations", "topics": ["HTML5/CSS3", "JavaScript ES6+", "TypeScript", "Modern tooling"]},
      {"week": 2, "title": "React 18 & Advanced Web UIs", "topics": ["Hooks", "Context", "Routing", "Design systems"]},
      {"week": 3, "title": "Server Engineering & PostgreSQL", "topics": ["Relational architecture", "SQL performance", "Supabase", "Edge Functions"]},
      {"week": 4, "title": "Full-Stack Integrations & Payment Gateways", "topics": ["Paystack API", "Webhooks", "Auth lifecycle", "File storage"]},
      {"week": 5, "title": "DevOps, Testing & Cloud Deployments", "topics": ["Docker", "CI/CD", "Cloud infrastructure", "Production hardening"]}
    ]'::jsonb,
    '[
      "Build and deploy full-stack commercial web applications independently",
      "Implement secure authentication, role-based access control, and PostgreSQL RLS",
      "Integrate online payments and real-time data pipelines",
      "Lead technical engineering teams and ace senior developer interviews"
    ]'::jsonb,
    '[
      {"title": "Enterprise Academy Management Platform", "description": "Complete multi-campus school management SaaS with student admissions, payments, and LMS."}
    ]'::jsonb,
    '["Commitment to 15-20 hours weekly", "Laptop with minimum 8GB RAM", "Passionate problem-solving mindset"]'::jsonb,
    '[
      {"question": "Is job placement support included?", "answer": "Yes! We offer CV reviews, portfolio workshops, mock technical interviews, and hiring partner referrals."}
    ]'::jsonb,
    '["Full-stack React & TypeScript", "PostgreSQL database mastery", "Payment gateway engineering", "Cloud deployment & CI/CD"]'::jsonb
  ),
  (
    'course-ui-ux-design',
    'ui-ux-product-design',
    'UI/UX & Digital Product Design',
    'Design intuitive, stunning digital products and industry-standard design systems.',
    'Learn user research, wireframing, interactive prototyping in Figma, visual design hierarchy, accessibility (a11y), and design system architecture.',
    'Master user-centered product design. Learn how to conduct user interviews, translate user insights into user journeys, create high-fidelity responsive UI mockups in Figma, and build scalable design systems.',
    'design-product',
    'Beginner to Intermediate',
    '10 Weeks',
    'Online & Physical',
    'Trending',
    true,
    false,
    95000.00,
    150000.00,
    4.96,
    188,
    'inst-grace-ekong',
    '[
      {"week": 1, "title": "Design Thinking & User Research", "topics": ["User interviews", "Personas", "Empathy maps", "Competitive analysis"]},
      {"week": 2, "title": "Information Architecture & Wireframing", "topics": ["Site maps", "User flows", "Low-fidelity wireframes", "Figma shortcuts"]},
      {"week": 3, "title": "Visual Design Principles & Typography", "topics": ["Color theory", "Typography hierarchy", "Spacing grids", "Visual balance"]},
      {"week": 4, "title": "Figma Mastery & Component Libraries", "topics": ["Auto-layout", "Variants & component properties", "Interactive components", "Design tokens"]},
      {"week": 5, "title": "Design Systems & Developer Handoff", "topics": ["Design system architecture", "Figma variables", "Handoff specs", "Token export"]}
    ]'::jsonb,
    '[
      "Create high-fidelity interactive prototypes in Figma",
      "Construct comprehensive design systems with auto-layout and component variants",
      "Conduct usability tests and iterate based on data",
      "Prepare professional design portfolios for top tech roles"
    ]'::jsonb,
    '[
      {"title": "Fintech Mobile Banking App UX", "description": "End-to-end mobile design with onboarding, KYC, and transfer flows."},
      {"title": "Multi-Brand Design System", "description": "Atomic design system with Figma variables and light/dark theme tokens."}
    ]'::jsonb,
    '["Creative interest in digital interfaces", "Figma account (Free)", "Laptop with 8GB+ RAM"]'::jsonb,
    '[
      {"question": "Do I need coding skills?", "answer": "No coding required! This course is 100% focused on product design, research, and Figma."}
    ]'::jsonb,
    '["Figma mastery & Auto-layout", "Design system construction", "User research methodologies", "Interactive prototyping"]'::jsonb
  ),
  (
    'course-data-science',
    'data-science-machine-learning',
    'Data Science, Analytics & Machine Learning',
    'Analyze data, uncover strategic insights, and deploy predictive ML models.',
    'Hands-on training in Python, Pandas, NumPy, SQL, data visualization with Seaborn/Plotly, machine learning with Scikit-Learn, and introductory Deep Learning.',
    'Unlock the power of data. From data wrangling and statistical analysis to predictive machine learning models and data storytelling, this course equips you with the skills to solve business problems with data.',
    'data-ai',
    'Beginner to Intermediate',
    '14 Weeks',
    'Online & Physical',
    'Featured',
    false,
    true,
    160000.00,
    240000.00,
    4.94,
    165,
    'inst-michael-chukwu',
    '[
      {"week": 1, "title": "Python for Data Analysis", "topics": ["Python syntax", "Data structures", "NumPy arrays", "Vectorized calculations"]},
      {"week": 2, "title": "Data Wrangling with Pandas", "topics": ["DataFrames", "Cleaning & imputing", "Grouping & aggregations", "Merging datasets"]},
      {"week": 3, "title": "SQL for Analytics & PostgreSQL", "topics": ["Complex queries", "Window functions", "Common Table Expressions (CTEs)", "Database indexing"]},
      {"week": 4, "title": "Data Visualization & Storytelling", "topics": ["Matplotlib & Seaborn", "Plotly interactive charts", "Dashboarding with Streamlit"]},
      {"week": 5, "title": "Machine Learning Fundamentals", "topics": ["Regression models", "Classification algorithms", "Model evaluation metrics", "Feature engineering"]}
    ]'::jsonb,
    '[
      "Clean, transform, and analyze complex datasets with Python and Pandas",
      "Write advanced SQL queries for business intelligence and reporting",
      "Train, evaluate, and fine-tune supervised machine learning algorithms",
      "Deploy interactive ML dashboards with Streamlit and cloud APIs"
    ]'::jsonb,
    '[
      {"title": "Customer Churn Prediction Engine", "description": "Machine learning model predicting customer turnover with 92% precision."},
      {"title": "Real Estate Valuation Predictor", "description": "Regression pipeline estimating housing prices across Nigerian metropolitan areas."}
    ]'::jsonb,
    '["Basic math and algebra comprehension", "Laptop with 8GB+ RAM", "Interest in analytical problem solving"]'::jsonb,
    '[
      {"question": "Do we work with real datasets?", "answer": "Yes, you will analyze real African fintech, e-commerce, and logistics datasets."}
    ]'::jsonb,
    '["Python data ecosystem", "Advanced SQL queries", "Machine learning modeling", "Business data visualization"]'::jsonb
  ),
  (
    'course-cybersecurity-cloud',
    'cybersecurity-cloud-engineering',
    'Cybersecurity & Cloud Security Engineering',
    'Protect digital assets, configure secure networks, and defend cloud infrastructure.',
    'Comprehensive training in network security, Linux administration, ethical hacking, vulnerability assessments, AWS security, and incident response.',
    'Learn to defend against cyber threats and build resilient cloud systems. Covers network defense, Linux server hardening, penetration testing, SIEM monitoring, and cloud security architecture.',
    'cybersecurity-cloud',
    'Intermediate',
    '12 Weeks',
    'Online & Physical',
    'Critical Skill',
    false,
    false,
    180000.00,
    250000.00,
    4.97,
    140,
    'inst-david-og',
    '[
      {"week": 1, "title": "Networking & Linux Administration", "topics": ["TCP/IP protocols", "Subnetting", "Linux commands", "Permissions & SSH hardening"]},
      {"week": 2, "title": "Vulnerability Assessment & Penetration Testing", "topics": ["Nmap scanning", "OWASP Top 10", "Burp Suite", "Web app security testing"]},
      {"week": 3, "title": "Cloud Security Architecture (AWS)", "topics": ["IAM policies", "VPC security groups", "Encryption at rest/transit", "AWS GuardDuty"]},
      {"week": 4, "title": "Incident Response & SIEM Monitoring", "topics": ["Log analysis", "Splunk / Elastic SIEM", "Threat detection", "Incident mitigation"]}
    ]'::jsonb,
    '[
      "Identify and patch critical vulnerabilities across web and server applications",
      "Architect secure virtual private clouds (VPCs) on AWS",
      "Implement multi-layer defense mechanisms and continuous security monitoring",
      "Prepare for industry certifications including CompTIA Security+ and AWS Security Specialty"
    ]'::jsonb,
    '[
      {"title": "Automated Cloud Vulnerability Scanner", "description": "Custom security scanning suite auditing AWS infrastructure configurations."}
    ]'::jsonb,
    '["Basic networking fundamentals", "Familiarity with terminal commands", "Laptop with 8GB+ RAM"]'::jsonb,
    '[
      {"question": "Is ethical hacking taught responsibly?", "answer": "Yes, all offensive security labs are strictly performed inside controlled, isolated environments."}
    ]'::jsonb,
    '["Linux server hardening", "OWASP Top 10 mitigation", "Cloud IAM & VPC architecture", "Incident response operations"]'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  syllabus = EXCLUDED.syllabus;

-- ----------------------------------------------------------------------------
-- 5. COURSE MODULES & LESSONS (LMS)
-- ----------------------------------------------------------------------------
INSERT INTO public.course_modules (id, course_id, title, description, sort_order, duration)
VALUES
  ('mod-fe-1', 'course-frontend-dev', 'Module 1: Web Architecture & HTML5 Semantic Standards', 'Deep dive into web standards, DOM trees, semantic markup, and accessibility.', 1, '2 Weeks'),
  ('mod-fe-2', 'course-frontend-dev', 'Module 2: Advanced CSS3, Flexbox & Grid Systems', 'Building modern responsive layouts from scratch with vanilla CSS and design tokens.', 2, '2 Weeks'),
  ('mod-fe-3', 'course-frontend-dev', 'Module 3: JavaScript ES6+ & TypeScript', 'Modern JavaScript mastery, closures, asynchronous programming, and strict TypeScript types.', 3, '3 Weeks'),
  ('mod-fe-4', 'course-frontend-dev', 'Module 4: React 18 & State Management', 'Component hierarchies, Hooks, Context, React Router DOM, and production deployment.', 4, '5 Weeks')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  sort_order = EXCLUDED.sort_order;

INSERT INTO public.course_lessons (id, module_id, course_id, title, duration, video_url, content, sort_order, is_free_preview)
VALUES
  ('les-fe-101', 'mod-fe-1', 'course-frontend-dev', 'Welcome to Dave Techs Academy & Frontend Orientation', '15 mins', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ', 'Overview of the frontend curriculum, development environment setup (VS Code, Git, Node.js), and community guidelines.', 1, true),
  ('les-fe-102', 'mod-fe-1', 'course-frontend-dev', 'Semantic HTML5 & Accessibility Best Practices', '45 mins', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ', 'Structuring pages using header, nav, main, section, article, aside, and footer tags with proper ARIA attributes.', 2, true),
  ('les-fe-201', 'mod-fe-2', 'course-frontend-dev', 'Mastering CSS Flexbox for UI Components', '60 mins', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ', 'Main axis, cross axis, justify-content, align-items, flex-grow, and responsive card lists.', 3, false),
  ('les-fe-202', 'mod-fe-2', 'course-frontend-dev', 'Building Complex Grid Systems & Responsive Breakpoints', '75 mins', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ', 'CSS Grid template areas, repeat(), minmax(), autofill, and fluid typography.', 4, false),
  ('les-fe-301', 'mod-fe-3', 'course-frontend-dev', 'Async JavaScript: Promises, Fetch API & Async/Await', '90 mins', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ', 'Handling network latency, error boundaries, try/catch, and parsing REST JSON responses.', 5, false),
  ('les-fe-401', 'mod-fe-4', 'course-frontend-dev', 'React 18 Component Thinking & Custom Hooks', '90 mins', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ', 'Building atomic React components, lifting state up, and creating reusable custom hooks.', 6, false)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  duration = EXCLUDED.duration;

-- ----------------------------------------------------------------------------
-- 6. COHORTS
-- ----------------------------------------------------------------------------
INSERT INTO public.cohorts (id, course_id, branch_id, name, code, start_date, end_date, schedule_type, capacity, enrolled_count, status)
VALUES
  ('cohort-fe-abk-2026-q4', 'course-frontend-dev', 'branch-abeokuta-main', 'Abeokuta Q4 Weekend Cohort', 'DTA-FE-ABK-2026-Q4', '2026-10-15', '2027-01-15', 'Saturdays & Sundays (10:00 AM - 3:00 PM)', 35, 12, 'open'),
  ('cohort-fe-vi-2026-q4', 'course-frontend-dev', 'branch-vi-executive', 'VI Executive Evening Cohort', 'DTA-FE-VI-2026-Q4', '2026-10-20', '2027-01-20', 'Tuesdays & Thursdays (6:00 PM - 9:00 PM)', 25, 8, 'open'),
  ('cohort-fe-online-2026-q4', 'course-frontend-dev', NULL, 'Global Online Interactive Cohort', 'DTA-FE-ONL-2026-Q4', '2026-10-15', '2027-01-15', 'Flexible Live Streams + Mentor Office Hours', 150, 48, 'open'),
  ('cohort-be-abk-2026-q4', 'course-backend-eng', 'branch-abeokuta-main', 'Abeokuta Backend Intensive', 'DTA-BE-ABK-2026-Q4', '2026-10-20', '2027-01-30', 'Mondays & Wednesdays (10:00 AM - 2:00 PM)', 30, 9, 'open'),
  ('cohort-be-online-2026-q4', 'course-backend-eng', NULL, 'Online Backend Engineering Cohort', 'DTA-BE-ONL-2026-Q4', '2026-10-20', '2027-01-30', 'Mondays & Thursdays (7:00 PM - 9:30 PM)', 100, 31, 'open'),
  ('cohort-fs-ikeja-2026-q4', 'course-fullstack-dev', 'branch-ikeja-hub', 'Ikeja Full-Stack Immersion', 'DTA-FS-IKJ-2026-Q4', '2026-11-01', '2027-04-30', 'Weekdays Full-Time (9:00 AM - 4:00 PM)', 40, 18, 'open'),
  ('cohort-ui-ibd-2026-q4', 'course-ui-ux-design', 'branch-ibadan-innovation', 'Ibadan Product Design Cohort', 'DTA-UI-IBD-2026-Q4', '2026-10-25', '2027-01-05', 'Fridays & Saturdays (11:00 AM - 3:00 PM)', 30, 14, 'open')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  schedule_type = EXCLUDED.schedule_type,
  capacity = EXCLUDED.capacity;
