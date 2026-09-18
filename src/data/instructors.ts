import type { Instructor } from "../types";

export const instructors: Instructor[] = [
  {
    id: "inst-1",
    name: "Adebayo Johnson",
    role: "Lead Software Engineering Instructor",
    expertise: ["React", "TypeScript", "Node.js", "System Design", "Next.js"],
    experience: "8+ years in Full-Stack Web Architecture",
    courseIds: ["frontend-development", "backend-development", "full-stack-development"],
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
    bio: "Adebayo is a Senior Full-Stack Engineer who has built high-scale web platforms for top African and global fintechs. Passionate about clean code, component architecture, and modern JavaScript, he has mentored over 1,200 junior and mid-level developers into high-paying engineering roles.",
    qualifications: [
      "B.Sc. Computer Science (University of Lagos)",
      "AWS Certified Solutions Architect",
      "Meta Certified Front-End Developer",
    ],
    rating: 4.9,
    studentsTrained: 1250,
    socials: {
      linkedin: "https://linkedin.com",
      github: "https://github.com",
      twitter: "https://twitter.com",
    },
  },
  {
    id: "inst-2",
    name: "Kemi Adeleke",
    role: "Principal Product Design Mentor",
    expertise: ["Figma", "Design Systems", "User Research", "Wireframing", "Interaction Design"],
    experience: "6+ years leading UX at international tech scaleups",
    courseIds: ["ui-ux-design", "product-design", "graphics-design"],
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80",
    bio: "Kemi is an award-winning Product Designer with extensive experience crafting user-centric digital experiences across Africa and Europe. Her workshops emphasize end-to-end design thinking, accessibility, interactive prototyping, and building robust design systems in Figma.",
    qualifications: [
      "B.A. Creative Arts",
      "Nielsen Norman Group UX Master Certified",
      "Google UX Design Professional Certificate",
    ],
    rating: 4.95,
    studentsTrained: 980,
    socials: {
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
      website: "https://dribbble.com",
    },
  },
  {
    id: "inst-3",
    name: "Dr. Emeka Nwosu",
    role: "Head of AI & Data Science",
    expertise: ["Python", "Machine Learning", "SQL", "Deep Learning", "Data Analytics"],
    experience: "10+ years in Data Science and Quantitative Modeling",
    courseIds: ["data-analysis", "data-science", "ai-machine-learning", "python-programming", "robotics"],
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80",
    bio: "Dr. Emeka holds a Ph.D. in Computational Intelligence and has served as Lead Data Scientist for prominent financial institutions. He specializes in practical machine learning, predictive analytics, deep neural networks, and Python-powered automation.",
    qualifications: [
      "Ph.D. Computer Engineering (Artificial Intelligence)",
      "M.Sc. Information Technology",
      "TensorFlow Certified Developer",
    ],
    rating: 4.92,
    studentsTrained: 1400,
    socials: {
      linkedin: "https://linkedin.com",
      github: "https://github.com",
    },
  },
  {
    id: "inst-4",
    name: "Farouk Al-Hassan",
    role: "Senior Cybersecurity & Cloud Architect",
    expertise: ["Network Defense", "Ethical Hacking", "AWS Cloud", "Kubernetes", "DevOps CI/CD"],
    experience: "7+ years securing enterprise financial networks",
    courseIds: ["cybersecurity", "ethical-hacking", "devops-cloud-computing", "computer-networking"],
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80",
    bio: "Farouk is a Certified Ethical Hacker (CEH) and Cloud Infrastructure specialist who consults for leading telecom and banking networks. He teaches students how to conduct vulnerability assessments, harden Linux servers, and orchestrate modern CI/CD pipelines.",
    qualifications: [
      "Certified Ethical Hacker (CEH v12)",
      "CompTIA Security+ & Network+",
      "Certified Kubernetes Administrator (CKA)",
    ],
    rating: 4.88,
    studentsTrained: 820,
    socials: {
      linkedin: "https://linkedin.com",
      github: "https://github.com",
      twitter: "https://twitter.com",
    },
  },
  {
    id: "inst-5",
    name: "Chidinma Okoro",
    role: "Lead Mobile App Engineering Mentor",
    expertise: ["Flutter", "React Native", "Dart", "iOS Swift", "State Management"],
    experience: "6+ years publishing top-chart mobile applications",
    courseIds: ["app-development"],
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&auto=format&fit=crop&q=80",
    bio: "Chidinma has engineered cross-platform mobile apps with over 2M+ active downloads on iOS App Store and Google Play Store. She guides students through clean architecture, offline-first syncing, native module integration, and publishing to app stores.",
    qualifications: [
      "B.Sc. Software Engineering",
      "Google Associate Android Developer",
      "Flutter Certified Professional",
    ],
    rating: 4.9,
    studentsTrained: 650,
    socials: {
      linkedin: "https://linkedin.com",
      github: "https://github.com",
    },
  },
  {
    id: "inst-6",
    name: "Tunde Bakare",
    role: "Creative Director & Motion Design Lead",
    expertise: ["Video Editing", "Adobe Premiere Pro", "After Effects", "Color Grading", "Sound Design"],
    experience: "7+ years directing commercial campaigns and digital media",
    courseIds: ["video-editing", "graphics-design"],
    image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=500&auto=format&fit=crop&q=80",
    bio: "Tunde is a seasoned visual storyteller and motion graphics artist who has directed commercial videos for multinational consumer brands and music labels. He teaches practical editing workflows, pacing, multi-camera syncing, and 3D visual effects.",
    qualifications: [
      "B.A. Mass Communication",
      "Adobe Certified Expert (Premiere Pro & After Effects)",
      "DaVinci Resolve Certified Colorist",
    ],
    rating: 4.86,
    studentsTrained: 730,
    socials: {
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
      website: "https://vimeo.com",
    },
  },
  {
    id: "inst-7",
    name: "Blessing Oladipo",
    role: "Senior QA Engineering & Automation Specialist",
    expertise: ["Manual QA", "Cypress", "Selenium", "API Testing", "Postman", "Performance Testing"],
    experience: "5+ years in Enterprise Quality Assurance",
    courseIds: ["software-testing-qa"],
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop&q=80",
    bio: "Blessing helps tech organizations maintain zero-defect software releases. She trains students in end-to-end automated testing, writing robust test plans, continuous integration testing, and bug lifecycle management.",
    qualifications: [
      "ISTQB Certified Tester (Advanced Level)",
      "B.Sc. Computer Information Systems",
      "Postman Certified API Tester",
    ],
    rating: 4.89,
    studentsTrained: 540,
    socials: {
      linkedin: "https://linkedin.com",
      github: "https://github.com",
    },
  },
  {
    id: "inst-8",
    name: "Samuel Adeleke",
    role: "Digital Growth & No-Code Web Specialist",
    expertise: ["WordPress", "Webflow", "Digital Marketing", "SEO Strategy", "Conversion Funnels"],
    experience: "6+ years scaling digital presence for modern brands",
    courseIds: ["digital-marketing", "wordpress-no-code-development"],
    image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500&auto=format&fit=crop&q=80",
    bio: "Samuel is a growth strategist and web consultant specializing in rapid no-code development and high-converting performance marketing. He empowers non-coders and entrepreneurs to build client-ready websites and profitable marketing engines.",
    qualifications: [
      "Google Digital Marketing & E-Commerce Professional",
      "HubSpot Certified Inbound Marketer",
      "Webflow Certified Expert",
    ],
    rating: 4.87,
    studentsTrained: 890,
    socials: {
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
    },
  },
];

export function getInstructorById(id: string): Instructor | undefined {
  return instructors.find((inst) => inst.id === id);
}

export function getInstructorsByCourseId(courseId: string): Instructor[] {
  return instructors.filter((inst) => inst.courseIds.includes(courseId));
}
