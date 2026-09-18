import type { Branch } from "../types";

export const branches: Branch[] = [
  {
    id: "abeokuta-main",
    name: "Dave Techs — Abeokuta Main Campus",
    location: "Abeokuta, Ogun State",
    address: "Plot 12, Tech Innovation Corridor, Oke-Mosan, Abeokuta, Ogun State",
    phone: "09070925508",
    email: "abeokuta@davetechs.ng",
    openingHours: "Mon – Fri: 8:30 AM – 5:30 PM | Sat: 9:00 AM – 3:00 PM",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80",
    facilities: [
      "50+ Modern High-Spec Workstations",
      "High-Speed Fiber & Starlink Wi-Fi",
      "24/7 Solar Inverter & Generator Power",
      "Interactive Smartboards & Presentation Lab",
      "Student Collaboration Lounge & Library",
    ],
    transportInfo: "Located 5 minutes from Ogun State Secretariat, Oke-Mosan. Easily accessible by public transport and private ride hailing.",
    courseIds: [
      "ui-ux-design",
      "frontend-development",
      "backend-development",
      "full-stack-development",
      "graphics-design",
      "app-development",
      "data-analysis",
      "video-editing",
      "cybersecurity",
      "python-programming",
    ],
    availableCohorts: [
      "Morning Cohort (Mon/Wed/Fri 9:00 AM - 1:00 PM)",
      "Afternoon Cohort (Mon/Wed/Fri 2:00 PM - 6:00 PM)",
      "Weekend Intensive (Sat 10:00 AM - 4:00 PM)",
    ],
    mapUrl: "https://maps.google.com/?q=Oke-Mosan+Abeokuta+Ogun+State",
    active: true,
  },
  {
    id: "lagos-island",
    name: "Dave Techs — Victoria Island Campus",
    location: "Victoria Island, Lagos State",
    address: "45 Adeola Odeku Street, Victoria Island, Lagos State",
    phone: "08110913672",
    email: "vi.lagos@davetechs.ng",
    openingHours: "Mon – Fri: 8:00 AM – 6:00 PM | Sat: 9:00 AM – 4:00 PM",
    image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&auto=format&fit=crop&q=80",
    facilities: [
      "Executive Tech Suites & Workstations",
      "Dedicated AI & Cloud Computing Sandbox",
      "Gigabit Enterprise Dual-ISP Internet",
      "Uninterrupted 24/7 Power Infrastructure",
      "Executive Meeting & Interview Rooms",
    ],
    transportInfo: "Situated on Adeola Odeku Street, central Victoria Island. Ample secured parking space available on premises.",
    courseIds: [
      "ui-ux-design",
      "frontend-development",
      "backend-development",
      "full-stack-development",
      "data-analysis",
      "data-science",
      "ai-machine-learning",
      "devops-cloud-computing",
      "cybersecurity",
      "product-design",
    ],
    availableCohorts: [
      "Executive Morning (Tue/Thu 9:00 AM - 1:00 PM)",
      "Evening Cohort (Mon-Thu 6:00 PM - 8:30 PM)",
      "Saturday Executive (Sat 9:30 AM - 4:30 PM)",
    ],
    mapUrl: "https://maps.google.com/?q=Adeola+Odeku+Street+Victoria+Island+Lagos",
    active: true,
  },
  {
    id: "ikeja-hub",
    name: "Dave Techs — Ikeja Tech Hub",
    location: "Ikeja, Lagos State",
    address: "18 Allen Avenue, Ikeja, Lagos State",
    phone: "09070925508",
    email: "ikeja@davetechs.ng",
    openingHours: "Mon – Fri: 8:30 AM – 5:30 PM | Sat: 9:00 AM – 3:30 PM",
    image: "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=800&auto=format&fit=crop&q=80",
    facilities: [
      "Creative Design & Media Editing Lab",
      "Mobile App Testing & Hardware Bench",
      "High-Speed Wi-Fi & Gigabit Local LAN",
      "Continuous Hybrid Solar Power",
      "Hackathon Collaboration Arena",
    ],
    transportInfo: "Located on Allen Avenue near Ikeja Under-bridge. 10 minutes from Lagos Murtala Muhammed Airport.",
    courseIds: [
      "ui-ux-design",
      "frontend-development",
      "backend-development",
      "full-stack-development",
      "app-development",
      "graphics-design",
      "video-editing",
      "digital-marketing",
      "wordpress-no-code-development",
      "robotics",
    ],
    availableCohorts: [
      "Weekday Regular (Mon/Wed/Fri 10:00 AM - 2:00 PM)",
      "Weekend Mastery (Sat/Sun 12:00 PM - 4:00 PM)",
    ],
    mapUrl: "https://maps.google.com/?q=Allen+Avenue+Ikeja+Lagos",
    active: true,
  },
  {
    id: "ibadan-campus",
    name: "Dave Techs — Ibadan Innovation Center",
    location: "Ibadan, Oyo State",
    address: "24 Ring Road, Opposite High Court, Ibadan, Oyo State",
    phone: "08110913672",
    email: "ibadan@davetechs.ng",
    openingHours: "Mon – Fri: 9:00 AM – 5:00 PM | Sat: 10:00 AM – 2:00 PM",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80",
    facilities: [
      "40+ Dedicated Coding Stations",
      "Cybersecurity Defense Sandbox",
      "Uncapped High-Speed Internet",
      "Reliable Solar Power Infrastructure",
      "Open Seminar & Mentorship Hall",
    ],
    transportInfo: "Located along Ring Road, opposite Oyo State High Court. Convenient drop-off and bus stops directly in front of the campus.",
    courseIds: [
      "ui-ux-design",
      "frontend-development",
      "backend-development",
      "full-stack-development",
      "data-analysis",
      "cybersecurity",
      "ethical-hacking",
      "python-programming",
    ],
    availableCohorts: [
      "Morning Batch (Mon/Wed/Fri 9:30 AM - 1:30 PM)",
      "Weekend Batch (Sat 9:00 AM - 3:00 PM)",
    ],
    mapUrl: "https://maps.google.com/?q=Ring+Road+Ibadan+Oyo+State",
    active: true,
  },
];

export const BRANCHES_STORAGE_KEY = "devtechs_branches_store";

export function getStoredBranches(): Branch[] {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(BRANCHES_STORAGE_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error("Failed to read stored branches", err);
  }
  return branches;
}

export function saveBranch(branch: Branch): void {
  try {
    const all = getStoredBranches();
    const idx = all.findIndex((b) => b.id === branch.id);
    if (idx !== -1) {
      all[idx] = branch;
    } else {
      all.push(branch);
    }
    if (typeof window !== "undefined") {
      localStorage.setItem(BRANCHES_STORAGE_KEY, JSON.stringify(all));
    }
  } catch (err) {
    console.error("Failed to save branch", err);
  }
}

export function deleteBranch(id: string): void {
  try {
    const all = getStoredBranches().filter((b) => b.id !== id);
    if (typeof window !== "undefined") {
      localStorage.setItem(BRANCHES_STORAGE_KEY, JSON.stringify(all));
    }
  } catch (err) {
    console.error("Failed to delete branch", err);
  }
}

export function toggleBranchActive(id: string): void {
  const all = getStoredBranches();
  const target = all.find((b) => b.id === id);
  if (target) {
    target.active = !target.active;
    if (typeof window !== "undefined") {
      localStorage.setItem(BRANCHES_STORAGE_KEY, JSON.stringify(all));
    }
  }
}

export function getBranchById(id: string): Branch | undefined {
  return getStoredBranches().find((b) => b.id === id);
}

export function getBranchesForCourse(courseId: string): Branch[] {
  return getStoredBranches().filter((b) => b.active && b.courseIds.includes(courseId));
}
