import type { Application } from "../types";

const APPLICATIONS_STORAGE_KEY = "devtechs_applications_store";

export function getStoredApplications(): Application[] {
  try {
    const raw = localStorage.getItem(APPLICATIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Failed to load applications", err);
    return [];
  }
}

export function saveApplication(app: Application): void {
  try {
    const apps = getStoredApplications();
    const existingIndex = apps.findIndex((a) => a.id === app.id);
    if (existingIndex !== -1) {
      apps[existingIndex] = app;
    } else {
      apps.unshift(app);
    }
    localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(apps));
  } catch (err) {
    console.error("Failed to save application", err);
  }
}

export function getApplicationById(id: string): Application | undefined {
  const apps = getStoredApplications();
  return apps.find((a) => a.id === id);
}

export function getApplicationsByStudentId(studentId: string): Application[] {
  const apps = getStoredApplications();
  return apps.filter((a) => a.studentId === studentId);
}

export function generateApplicationNumber(): string {
  const year = new Date().getFullYear();
  const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `DTA-${year}-${randomHex}`;
}
