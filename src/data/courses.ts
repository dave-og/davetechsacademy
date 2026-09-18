import type { Course } from "../types";

const IMG = (name: string) => `/img/${name}`;

export const courses: Course[] = [
  {
    id: "ui-ux-design",
    title: "UI/UX Design",
    slug: "ui-ux-design",
    description:
      "Learn to design intuitive, user-centred digital experiences. Master wireframing, prototyping, usability testing and modern design tools used in the industry.",
    fullDescription:
      "This comprehensive UI/UX Design course equips you with the complete end-to-end design thinking process. From user research, personas, and information architecture to high-fidelity interactive Figma prototypes and design systems, you will learn to build digital interfaces that delight users and drive real business metrics.",
    category: "Design",
    level: "Beginner",
    durationWeeks: 8,
    price: 46_000,
    image: IMG("2e6ffc7bb424ef561c1001111f222474.jpg"),
    rating: 4.8,
    reviewCount: 330,
    learningModes: ["online", "physical"],
    instructorIds: ["inst-2"],
    featured: true,
    active: true,
    certificateIncluded: true,
    learningOutcomes: [
      "Master Figma from fundamentals to advanced auto-layout and components",
      "Conduct qualitative and quantitative user research and usability tests",
      "Create wireframes, user flows, and high-fidelity interactive prototypes",
      "Build scalable, accessible design systems matching industry tokens",
      "Design mobile and web experiences following UX heuristics and WCAG guidelines",
    ],
    curriculum: [
      {
        title: "Module 1: Fundamentals of UX & Design Thinking",
        duration: "Weeks 1-2",
        topics: [
          "Introduction to UX vs UI",
          "Empathize & Define: User Research & Personas",
          "Information Architecture & User Journeys",
          "Low-fidelity Wireframing with FigJam",
        ],
      },
      {
        title: "Module 2: Visual UI Design & Typography",
        duration: "Weeks 3-4",
        topics: [
          "Color Theory, Contrast & Visual Hierarchy",
          "Typography Scales & Responsive Grids",
          "Figma Essentials: Frames, Auto-layout, Constraints",
          "Creating Component Libraries & Variants",
        ],
      },
      {
        title: "Module 3: Prototyping & Interaction Design",
        duration: "Weeks 5-6",
        topics: [
          "Smart Animate & Interactive Micro-interactions",
          "Usability Testing & Feedback Synthesis",
          "Building Design Systems & Style Guides",
          "Design Handoff with Dev Mode",
        ],
      },
      {
        title: "Module 4: Portfolio Capstone Project",
        duration: "Weeks 7-8",
        topics: [
          "Full End-to-End Fintech / E-commerce App Redesign",
          "Case Study Storytelling & Presentation",
          "Behance & Dribbble Portfolio Preparation",
        ],
      },
    ],
    requirements: [
      "A laptop or desktop computer (Windows, Mac, or Linux)",
      "Stable internet connection for live online sessions or physical class attendance",
      "Free Figma account (no prior design background required)",
    ],
    projects: [
      {
        title: "Digital Banking Mobile App",
        description: "Design a complete neo-banking iOS/Android mobile application featuring money transfers, card controls, and biometric authentication.",
        tools: ["Figma", "FigJam", "Maze"],
      },
      {
        title: "SaaS Analytics Web Dashboard",
        description: "Create an adaptive multi-view web dashboard for an e-commerce platform with real-time data visualisations.",
        tools: ["Figma", "Design System Tokens"],
      },
    ],
    faqs: [
      {
        question: "Do I need drawing or graphic design skills before enrolling?",
        answer: "No prior experience is necessary. We start from foundational design principles and progressively build up your skills.",
      },
      {
        question: "Will I get feedback on my design assignments?",
        answer: "Yes, every weekly milestone includes personalised critique sessions with our senior design mentors.",
      },
    ],
  },
  {
    id: "frontend-development",
    title: "Frontend Development",
    slug: "frontend-development",
    description:
      "Build modern, responsive websites with HTML, CSS, JavaScript and React. Learn component architecture, state management and real-world deployment.",
    fullDescription:
      "Become a job-ready frontend engineer. Learn how modern web applications are engineered using HTML5, CSS3, modern JavaScript (ES6+), and React. You'll master component composition, REST API consumption, state management, CSS layouts (Flexbox/Grid), and performance optimization.",
    category: "Software Development",
    level: "Beginner",
    durationWeeks: 10,
    price: 46_000,
    image: IMG("6bc5985439df332a6857b552a3d72135 (1).jpg"),
    rating: 4.9,
    reviewCount: 420,
    learningModes: ["online", "physical"],
    instructorIds: ["inst-1"],
    featured: true,
    active: true,
    certificateIncluded: true,
    learningOutcomes: [
      "Build responsive, modern web interfaces with HTML5 & modern CSS",
      "Master JavaScript algorithms, DOM manipulation, and asynchronous programming",
      "Develop single-page applications using React, Hooks, and Router",
      "Integrate third-party RESTful APIs and handle async state",
      "Deploy production web applications with Vercel and Netlify",
    ],
    curriculum: [
      {
        title: "Module 1: Web Foundations & Semantic HTML5",
        duration: "Weeks 1-2",
        topics: ["HTML5 Semantics & Accessibility", "CSS3 Selectors, Box Model & Flexbox", "CSS Grid & Mobile-First Responsive Design", "Git & GitHub Basics"],
      },
      {
        title: "Module 2: Modern JavaScript (ES6+)",
        duration: "Weeks 3-5",
        topics: ["Data Types, Functions & Scope", "DOM Manipulation & Events", "ES6 Features: Destructuring, Modules, Promises", "Fetch API & Async/Await"],
      },
      {
        title: "Module 3: React Fundamentals & Hooks",
        duration: "Weeks 6-8",
        topics: ["JSX, Components & Props", "State Management with useState & useEffect", "Client-side Routing with React Router", "Custom Hooks & Context API"],
      },
      {
        title: "Module 4: Real-world Applications & Capstone",
        duration: "Weeks 9-10",
        topics: ["Performance Optimization & Code Splitting", "Production Build & Deployment", "Final Capstone Project & Code Review"],
      },
    ],
    requirements: [
      "A laptop with at least 4GB RAM (8GB recommended)",
      "VS Code installed",
      "Eagerness to write code and solve problems (no previous coding experience required)",
    ],
    projects: [
      {
        title: "Interactive E-Commerce Storefront",
        description: "Build a dynamic online store featuring product filtering, cart state management, checkout simulation, and live API fetching.",
        tools: ["React", "JavaScript", "CSS Modules"],
      },
      {
        title: "Real-time Weather & Forecast Web App",
        description: "Create an adaptive weather forecasting app using Geolocation and OpenWeather API with search and dark mode.",
        tools: ["React", "REST API", "LocalStorage"],
      },
    ],
    faqs: [
      {
        question: "Is this course beginner-friendly?",
        answer: "Yes, we teach from the ground up, starting with basic HTML/CSS before advancing into JavaScript and React.",
      },
      {
        question: "Are certificates issued upon completion?",
        answer: "Yes, upon successfully completing the course assignments and capstone project, you receive a verified certificate.",
      },
    ],
  },
  {
    id: "backend-development",
    title: "Backend Development",
    slug: "backend-development",
    description:
      "Master server-side programming, APIs, databases and authentication. Build scalable backend systems using Node.js, Express and modern database technologies.",
    fullDescription:
      "Take your coding skills to the server side. Learn to design robust RESTful APIs, manage databases with PostgreSQL and MongoDB, implement secure JWT authentication, handle file uploads, and deploy scalable cloud microservices with Node.js and Express.",
    category: "Software Development",
    level: "Intermediate",
    durationWeeks: 12,
    price: 46_000,
    image: IMG("ef544043c6bdfc113da43d0aaee4e354.jpg"),
    rating: 4.7,
    reviewCount: 280,
    learningModes: ["online", "physical"],
    instructorIds: ["inst-1"],
    featured: true,
    active: true,
    certificateIncluded: true,
    learningOutcomes: [
      "Architect scalable backend architectures with Node.js and Express",
      "Design relational (PostgreSQL) and NoSQL (MongoDB) database schemas",
      "Implement secure authentication, authorization, and password hashing",
      "Build and document production REST APIs with Swagger/Postman",
      "Deploy backend servers to cloud platforms with CI/CD",
    ],
    curriculum: [
      {
        title: "Module 1: Node.js & Server Architecture",
        duration: "Weeks 1-3",
        topics: ["Node.js Event Loop & Modules", "Building HTTP Servers with Express", "Middleware, Routing & Error Handling", "Environment Variables & Configuration"],
      },
      {
        title: "Module 2: Databases & ORM/ODM",
        duration: "Weeks 4-7",
        topics: ["Relational Database Design with PostgreSQL", "NoSQL with MongoDB & Mongoose", "Data Modeling, Indexing & Transactions", "Prisma & SQL Query Optimization"],
      },
      {
        title: "Module 3: Authentication & Security",
        duration: "Weeks 8-10",
        topics: ["JWT & Session-based Auth", "Role-based Access Control (RBAC)", "Input Validation & Sanitization", "Rate Limiting, CORS & Helmet"],
      },
      {
        title: "Module 4: API Deployment & Final Capstone",
        duration: "Weeks 11-12",
        topics: ["Testing with Jest & Supertest", "Dockerizing Backend Services", "Deploying to Render / AWS", "Final Project Defense"],
      },
    ],
    requirements: [
      "Basic understanding of JavaScript / programming fundamentals",
      "Laptop with minimum 8GB RAM",
      "Node.js and Postman installed",
    ],
    projects: [
      {
        title: "Multi-tenant E-Commerce Backend API",
        description: "A complete backend with product management, shopping carts, order processing, Paystack webhook integration, and admin dashboards.",
        tools: ["Node.js", "Express", "PostgreSQL", "JWT"],
      },
    ],
    faqs: [
      {
        question: "Should I know Frontend before taking this course?",
        answer: "Basic JavaScript syntax knowledge is recommended, but full frontend expertise is not required.",
      },
    ],
  },
  {
    id: "full-stack-development",
    title: "Full-Stack Development",
    slug: "full-stack-development",
    description:
      "Become a complete developer. Learn frontend and backend technologies, databases, deployment and how to build production-ready applications from scratch.",
    fullDescription:
      "The all-in-one track for aspiring full-stack engineers. Cover the full web stack: React on the client, Node.js & Express on the server, MongoDB/PostgreSQL for databases, authentication, state management, Paystack payment integration, and cloud deployment.",
    category: "Software Development",
    level: "Beginner",
    durationWeeks: 12,
    price: 46_000,
    image: IMG("6dbf8210e2ab66dc0d411478a008bc27.jpg"),
    rating: 4.8,
    reviewCount: 350,
    learningModes: ["online", "physical"],
    instructorIds: ["inst-1"],
    featured: true,
    active: true,
    certificateIncluded: true,
    learningOutcomes: [
      "Build full-stack web applications from idea to live deployment",
      "Develop responsive user interfaces with React and Tailwind/CSS",
      "Create robust REST APIs and database models",
      "Integrate payments, authentication, and cloud storage",
    ],
    curriculum: [
      {
        title: "Module 1: Frontend Engineering (React)",
        duration: "Weeks 1-4",
        topics: ["HTML/CSS/JS Deep Dive", "React Components & State", "Routing & Context API"],
      },
      {
        title: "Module 2: Server & Database Architecture",
        duration: "Weeks 5-8",
        topics: ["Node.js, Express & REST APIs", "Databases: PostgreSQL & MongoDB", "Authentication & Security"],
      },
      {
        title: "Module 3: Full-Stack Integration & Payments",
        duration: "Weeks 9-10",
        topics: ["Connecting Frontend to Backend", "Paystack Payment Gateway Integration", "File Uploads & Email Services"],
      },
      {
        title: "Module 4: Deployment & Capstone",
        duration: "Weeks 11-12",
        topics: ["Docker & Cloud Hosting", "Full-Stack Capstone Project", "Job Readiness & Portfolio Review"],
      },
    ],
    requirements: ["A laptop with at least 8GB RAM", "Dedication of 8-10 study hours per week"],
    projects: [
      {
        title: "Dave Techs Course Enrollment Platform",
        description: "Build an end-to-end academy application with user accounts, course browsing, and Paystack payments.",
        tools: ["React", "Node.js", "Express", "PostgreSQL", "Paystack"],
      },
    ],
    faqs: [
      {
        question: "Is this course suitable for total beginners?",
        answer: "Yes, our curriculum starts with foundational concepts and guides you step-by-step through full-stack development.",
      },
    ],
  },
  {
    id: "graphics-design",
    title: "Graphics Design",
    slug: "graphics-design",
    description:
      "Create stunning visuals for brands, social media and print. Master Adobe Photoshop, Illustrator, CorelDraw and modern graphic design principles.",
    fullDescription:
      "Master the art of visual communication. Learn professional graphic design using Adobe Photoshop, Illustrator, and CorelDraw. Master typography, branding identities, logo design, flyer design, social media assets, and print preparation.",
    category: "Design",
    level: "Beginner",
    durationWeeks: 6,
    price: 60_000,
    image: IMG("e35399dbe95e346a7aa038108d48f7ca.jpg"),
    rating: 4.6,
    reviewCount: 210,
    learningModes: ["online", "physical"],
    instructorIds: ["inst-2"],
    featured: false,
    active: true,
    certificateIncluded: true,
    learningOutcomes: [
      "Master Adobe Photoshop and Illustrator toolsets",
      "Create high-impact brand identities and vector logos",
      "Design compelling social media graphics and marketing banners",
      "Prepare print-ready artwork with accurate color profiles (CMYK)",
    ],
    curriculum: [
      {
        title: "Module 1: Design Principles & Adobe Photoshop",
        duration: "Weeks 1-2",
        topics: ["Design Elements & Composition", "Photo Manipulation & Retouching", "Layer Masks, Selections & Color Grading"],
      },
      {
        title: "Module 2: Vector Art & Adobe Illustrator",
        duration: "Weeks 3-4",
        topics: ["Pen Tool & Vector Shapes", "Logo Design & Brand Identity Systems", "Typography & Layout"],
      },
      {
        title: "Module 3: Marketing Visuals & Portfolio",
        duration: "Weeks 5-6",
        topics: ["Social Media Ads & Flyers", "Print Design & Packaging", "Client Portfolio Showcase"],
      },
    ],
    requirements: ["Laptop capable of running Adobe Creative Cloud"],
    projects: [
      {
        title: "Corporate Brand Identity Package",
        description: "Create a complete visual identity kit including logo, typography guide, stationery, and social media templates.",
        tools: ["Adobe Photoshop", "Adobe Illustrator"],
      },
    ],
  },
  {
    id: "app-development",
    title: "App Development",
    slug: "app-development",
    description:
      "Build mobile applications for iOS and Android. Learn React Native or Flutter, state management, API integration and publishing to app stores.",
    fullDescription:
      "Step into mobile software engineering. Learn to build cross-platform mobile apps using React Native. Master native device features (camera, location, storage), push notifications, state management, and app store deployment.",
    category: "Mobile Development",
    level: "Beginner",
    durationWeeks: 6,
    price: 90_000,
    image: IMG("ef544043c6bdfc113da43d0aaee4e354.jpg"),
    rating: 4.7,
    reviewCount: 190,
    learningModes: ["online", "physical"],
    instructorIds: ["inst-1"],
    featured: false,
    active: true,
    certificateIncluded: true,
    learningOutcomes: [
      "Build native cross-platform iOS & Android apps with React Native",
      "Implement smooth gesture navigation and animations",
      "Integrate device hardware APIs (camera, geolocation, push notifications)",
      "Publish apps to Google Play Store and Apple App Store",
    ],
  },
  {
    id: "data-analysis",
    title: "Data Analysis",
    slug: "data-analysis",
    description:
      "Turn raw data into actionable insights. Learn Excel, SQL, Python for data analysis, data visualisation with Power BI and Tableau, and statistical methods.",
    fullDescription:
      "Unlock the power of data. Master advanced Microsoft Excel, SQL for querying enterprise databases, Python for exploratory data analysis (Pandas/NumPy), and interactive dashboard creation using Microsoft Power BI.",
    category: "Data & AI",
    level: "Beginner",
    durationWeeks: 6,
    price: 90_000,
    image: IMG("f77536e67a7c398b844aa2abdcbbf5ab.jpg"),
    rating: 4.8,
    reviewCount: 260,
    learningModes: ["online", "physical"],
    instructorIds: ["inst-3"],
    featured: false,
    active: true,
    certificateIncluded: true,
    learningOutcomes: [
      "Perform advanced data cleaning and pivot modeling in Excel",
      "Query complex relational databases using SQL",
      "Analyze data sets using Python (Pandas, Matplotlib, Seaborn)",
      "Build interactive business intelligence dashboards in Power BI",
    ],
  },
  {
    id: "video-editing",
    title: "Video Editing",
    slug: "video-editing",
    description:
      "Master professional video editing with Adobe Premiere Pro, After Effects and DaVinci Resolve. Learn colour grading, motion graphics and content creation.",
    fullDescription:
      "Create high-retention video content for YouTube, TikTok, commercial ads, and film. Learn cutting techniques, audio syncing, color grading, visual effects, and motion graphics in Premiere Pro and After Effects.",
    category: "Digital Skills",
    level: "Beginner",
    durationWeeks: 6,
    price: 60_000,
    image: IMG("d7e0d280728e0a201b7139334b09920b.jpg"),
    rating: 4.5,
    reviewCount: 150,
    learningModes: ["online", "physical"],
    instructorIds: ["inst-2"],
    featured: false,
    active: true,
    certificateIncluded: true,
  },
  {
    id: "devops-cloud-computing",
    title: "DevOps & Cloud Computing",
    slug: "devops-cloud-computing",
    description:
      "Learn CI/CD pipelines, containerisation with Docker, Kubernetes, AWS/Azure cloud services and infrastructure as code for modern software delivery.",
    fullDescription:
      "Bridge software development and IT operations. Master Linux administration, Git workflows, Docker containerization, Kubernetes cluster orchestration, AWS cloud infrastructure, and automated GitHub Actions CI/CD pipelines.",
    category: "Cloud & DevOps",
    level: "Beginner",
    durationWeeks: 6,
    price: 35_000,
    image: IMG("efb8c4cce59c07d8dbb69667529f77b9.jpg"),
    rating: 4.6,
    reviewCount: 180,
    learningModes: ["online", "physical"],
    instructorIds: ["inst-4"],
    featured: false,
    active: true,
    certificateIncluded: true,
  },
  {
    id: "cybersecurity",
    title: "Cybersecurity",
    slug: "cybersecurity",
    description:
      "Protect systems and networks from cyber threats. Learn network security, penetration testing, cryptography, incident response and security best practices.",
    fullDescription:
      "Learn how to defend computer systems, networks, and applications from cyber attacks. Master security fundamentals, vulnerability scanning, ethical exploitation, Wireshark traffic analysis, firewalls, and incident mitigation.",
    category: "Cybersecurity",
    level: "Intermediate",
    durationWeeks: 12,
    price: 50_000,
    image: IMG("f8222a7f53cae026bb4553cb7f9b8c0a.jpg"),
    rating: 4.8,
    reviewCount: 310,
    learningModes: ["online", "physical"],
    instructorIds: ["inst-4"],
    featured: true,
    active: true,
    certificateIncluded: true,
  },
  {
    id: "ai-machine-learning",
    title: "AI & Machine Learning",
    slug: "ai-machine-learning",
    description:
      "Build intelligent applications with machine learning and deep learning. Learn Python, Scikit-learn, TensorFlow, neural networks and generative AI.",
    fullDescription:
      "Master the foundations of Artificial Intelligence. Learn predictive modeling, classification, natural language processing, neural networks with TensorFlow/PyTorch, and how to integrate LLMs into software products.",
    category: "Data & AI",
    level: "Intermediate",
    durationWeeks: 12,
    price: 85_000,
    image: IMG("2e6ffc7bb424ef561c1001111f222474.jpg"),
    rating: 4.9,
    reviewCount: 220,
    learningModes: ["online", "physical"],
    instructorIds: ["inst-3"],
    featured: false,
    active: true,
    certificateIncluded: true,
  },
  {
    id: "data-science",
    title: "Data Science",
    slug: "data-science",
    description:
      "Extract knowledge from complex data. Learn statistical modeling, Python data pipelines, big data tools, machine learning and data storytelling.",
    fullDescription:
      "Transform complex data into predictive intelligence. Master statistical analysis, hypothesis testing, machine learning pipelines, feature engineering, and model deployment.",
    category: "Data & AI",
    level: "Intermediate",
    durationWeeks: 12,
    price: 90_000,
    image: IMG("f77536e67a7c398b844aa2abdcbbf5ab.jpg"),
    rating: 4.7,
    reviewCount: 175,
    learningModes: ["online", "physical"],
    instructorIds: ["inst-3"],
    featured: false,
    active: true,
    certificateIncluded: true,
  },
  {
    id: "robotics",
    title: "Robotics",
    slug: "robotics",
    description:
      "Design and program robots using sensors, actuators and microcontrollers. Learn Arduino, Raspberry Pi and robotics engineering fundamentals.",
    fullDescription:
      "Build intelligent hardware systems. Combine electronics, mechanical design, and embedded programming with Arduino and Raspberry Pi to build autonomous robotic units.",
    category: "Emerging Technology",
    level: "Beginner/Intermediate",
    durationWeeks: 10,
    price: 85_000,
    image: IMG("6dbf8210e2ab66dc0d411478a008bc27.jpg"),
    rating: 4.6,
    reviewCount: 130,
    learningModes: ["physical"],
    instructorIds: ["inst-4"],
    featured: false,
    active: true,
    certificateIncluded: true,
  },
  {
    id: "python-programming",
    title: "Python Programming",
    slug: "python-programming",
    description:
      "Master one of the world's most popular programming languages. Learn syntax, OOP, data structures, automation scripting and web scraping.",
    fullDescription:
      "Start coding with Python. Learn programming fundamentals, object-oriented programming (OOP), file automation, web scraping with Beautiful Soup, and building command-line utilities.",
    category: "Software Development",
    level: "Beginner",
    durationWeeks: 8,
    price: 55_000,
    image: IMG("6bc5985439df332a6857b552a3d72135 (1).jpg"),
    rating: 4.8,
    reviewCount: 390,
    learningModes: ["online", "physical"],
    instructorIds: ["inst-3"],
    featured: false,
    active: true,
    certificateIncluded: true,
  },
  {
    id: "product-design",
    title: "Product Design",
    slug: "product-design",
    description:
      "Design digital products from concept to launch. Learn user research, product thinking, Figma, design systems and cross-functional collaboration.",
    fullDescription:
      "Master the full digital product design lifecycle. Learn how to identify business opportunities, run design sprints, build design systems, prototype complex web/mobile products, and collaborate with engineering teams.",
    category: "Design",
    level: "Beginner",
    durationWeeks: 8,
    price: 60_000,
    image: IMG("2e6ffc7bb424ef561c1001111f222474.jpg"),
    rating: 4.7,
    reviewCount: 160,
    learningModes: ["online", "physical"],
    instructorIds: ["inst-2"],
    featured: false,
    active: true,
    certificateIncluded: true,
  },
  {
    id: "ethical-hacking",
    title: "Ethical Hacking",
    slug: "ethical-hacking",
    description:
      "Learn offensive security techniques to find and fix vulnerabilities. Master Kali Linux, Metasploit, web application security and penetration testing.",
    fullDescription:
      "Think like an attacker to build unbreakable defenses. Master Kali Linux tools, network reconnaissance, Metasploit exploitation, OWASP Top 10 web vulnerabilities, and penetration testing reporting.",
    category: "Cybersecurity",
    level: "Intermediate",
    durationWeeks: 10,
    price: 60_000,
    image: IMG("f8222a7f53cae026bb4553cb7f9b8c0a.jpg"),
    rating: 4.8,
    reviewCount: 240,
    learningModes: ["online", "physical"],
    instructorIds: ["inst-4"],
    featured: false,
    active: true,
    certificateIncluded: true,
  },
  {
    id: "computer-networking",
    title: "Computer Networking",
    slug: "computer-networking",
    description:
      "Understand how data travels across networks. Learn IP addressing, routing, switching, DNS, DHCP, network security and troubleshooting.",
    fullDescription:
      "Build and troubleshoot enterprise computer networks. Learn the OSI model, TCP/IP, subnetting, Cisco router/switch configuration, VPNs, and wireless networking.",
    category: "Cybersecurity",
    level: "Beginner",
    durationWeeks: 8,
    price: 50_000,
    image: IMG("efb8c4cce59c07d8dbb69667529f77b9.jpg"),
    rating: 4.5,
    reviewCount: 140,
    learningModes: ["physical", "online"],
    instructorIds: ["inst-4"],
    featured: false,
    active: true,
    certificateIncluded: true,
  },
  {
    id: "software-testing-qa",
    title: "Software Testing / QA",
    slug: "software-testing-qa",
    description:
      "Ensure software quality through manual and automated testing. Learn test planning, bug tracking, Selenium, Cypress and QA methodologies.",
    fullDescription:
      "Master software quality assurance. Learn to write test cases, execute functional/regression testing, automate browser tests with Cypress/Selenium, and report issues using Jira.",
    category: "Software Development",
    level: "Beginner",
    durationWeeks: 8,
    price: 50_000,
    image: IMG("ef544043c6bdfc113da43d0aaee4e354.jpg"),
    rating: 4.6,
    reviewCount: 120,
    learningModes: ["online", "physical"],
    instructorIds: ["inst-1"],
    featured: false,
    active: true,
    certificateIncluded: true,
  },
  {
    id: "digital-marketing",
    title: "Digital Marketing",
    slug: "digital-marketing",
    description:
      "Grow brands and drive sales through digital channels. Learn SEO, social media marketing, Google Ads, content strategy, email marketing and analytics.",
    fullDescription:
      "Master modern digital marketing. Learn search engine optimization (SEO), Meta & Google paid advertising, conversion rate optimization, email automation, and marketing analytics.",
    category: "Digital Skills",
    level: "Beginner",
    durationWeeks: 6,
    price: 50_000,
    image: IMG("d7e0d280728e0a201b7139334b09920b.jpg"),
    rating: 4.6,
    reviewCount: 205,
    learningModes: ["online", "physical"],
    instructorIds: ["inst-2"],
    featured: false,
    active: true,
    certificateIncluded: true,
  },
  {
    id: "wordpress-nocode-development",
    title: "WordPress & No-Code Development",
    slug: "wordpress-nocode-development",
    description:
      "Build professional websites without writing code. Learn WordPress, Elementor, Webflow and no-code tools to create business websites and landing pages.",
    fullDescription:
      "Launch professional websites in hours, not weeks. Master WordPress CMS, Elementor Pro page building, WooCommerce e-commerce stores, Webflow visual development, and domain/hosting deployment.",
    category: "Digital Skills",
    level: "Beginner",
    durationWeeks: 6,
    price: 40_000,
    image: IMG("6dbf8210e2ab66dc0d411478a008bc27.jpg"),
    rating: 4.4,
    reviewCount: 110,
    learningModes: ["online", "physical"],
    instructorIds: ["inst-1"],
    featured: false,
    active: true,
    certificateIncluded: true,
  },
];

export const featuredCourses = courses.filter((c) => c.featured);

export function getFeaturedCourses(): Course[] {
  return getStoredCourses().filter((c) => c.featured && c.active);
}

export const courseCategories = [
  "Software Development",
  "Data & AI",
  "Cybersecurity",
  "Design",
  "Cloud & DevOps",
  "Mobile Development",
  "Emerging Technology",
  "Digital Skills",
] as const;

export const COURSES_STORAGE_KEY = "devtechs_courses_store";

export function getStoredCourses(): Course[] {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(COURSES_STORAGE_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error("Failed to read stored courses", err);
  }
  return courses;
}

export function saveCourse(course: Course): void {
  try {
    const allCourses = getStoredCourses();
    const existingIndex = allCourses.findIndex((c) => c.id === course.id);
    if (existingIndex !== -1) {
      allCourses[existingIndex] = course;
    } else {
      allCourses.unshift(course);
    }
    if (typeof window !== "undefined") {
      localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(allCourses));
    }
  } catch (err) {
    console.error("Failed to save course to storage", err);
  }
}

export function deleteCourse(id: string): void {
  try {
    const allCourses = getStoredCourses().filter((c) => c.id !== id);
    if (typeof window !== "undefined") {
      localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(allCourses));
    }
  } catch (err) {
    console.error("Failed to delete course", err);
  }
}

export function toggleCourseActive(id: string): void {
  const allCourses = getStoredCourses();
  const target = allCourses.find((c) => c.id === id);
  if (target) {
    target.active = !target.active;
    if (typeof window !== "undefined") {
      localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(allCourses));
    }
  }
}

export function getCourseById(id: string): Course | undefined {
  return getStoredCourses().find((c) => c.id === id);
}

export function getCourseBySlug(slug: string): Course | undefined {
  return getStoredCourses().find((c) => c.slug === slug);
}

export function getCoursesByCategory(category: string): Course[] {
  return getStoredCourses().filter((c) => c.category === category);
}

export function getRelatedCourses(currentCourseId: string, category: string, limit = 3): Course[] {
  const all = getStoredCourses();
  return all
    .filter((c) => c.id !== currentCourseId && c.category === category)
    .concat(all.filter((c) => c.id !== currentCourseId && c.category !== category))
    .slice(0, limit);
}

