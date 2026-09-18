import { describe, it, expect } from "vitest";
import {
  courses,
  courseCategories,
  getCourseById,
  getCourseBySlug,
  getRelatedCourses,
  getCoursesByCategory,
} from "../data/courses";
import type { LearningMode } from "../types";

describe("Course Catalog & Search / Filter Edge Cases", () => {
  describe("Course Data Integrity", () => {
    it("should have valid courses list with complete attributes", () => {
      expect(courses.length).toBeGreaterThan(0);
      courses.forEach((c) => {
        expect(c.id).toBeTruthy();
        expect(c.title).toBeTruthy();
        expect(c.slug).toBeTruthy();
        expect(c.price).toBeGreaterThan(0);
        expect(c.durationWeeks).toBeGreaterThan(0);
        expect(c.category).toBeTruthy();
        expect(c.learningModes.length).toBeGreaterThan(0);
        if (c.curriculum) {
          expect(c.curriculum.length).toBeGreaterThan(0);
        }
      });
    });

    it("should contain all expected course categories", () => {
      expect(courseCategories).toContain("Software Development");
      expect(courseCategories).toContain("Design");
      expect(courseCategories).toContain("Data & AI");
      expect(courseCategories).toContain("Cybersecurity");
    });
  });

  describe("Course Retrieval & Slug Lookup", () => {
    it("should retrieve course by exact ID", () => {
      const course = getCourseById("frontend-development");
      expect(course).toBeDefined();
      expect(course?.title).toContain("Frontend");
    });

    it("should retrieve course by exact Slug", () => {
      const course = getCourseBySlug("ui-ux-design");
      expect(course).toBeDefined();
      expect(course?.slug).toBe("ui-ux-design");
    });

    it("should return undefined for non-existent course slug (Edge Case: Course unavailable)", () => {
      const course = getCourseBySlug("non-existent-course-slug-12345");
      expect(course).toBeUndefined();
    });
  });

  describe("Course Search Functionality", () => {
    it("should search courses by keyword in title or description", () => {
      const query = "python";
      const results = courses.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query) ||
          c.category.toLowerCase().includes(query)
      );
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((c) => c.title.toLowerCase().includes("python"))).toBe(true);
    });

    it("should return empty array for non-matching query (Edge Case: Empty search results)", () => {
      const query = "xyz987quantumsupercomputing";
      const results = courses.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query) ||
          c.category.toLowerCase().includes(query)
      );
      expect(results.length).toBe(0);
    });
  });

  describe("Course Filtering Logic", () => {
    it("should filter courses by category correctly", () => {
      const designCourses = getCoursesByCategory("Design");
      expect(designCourses.length).toBeGreaterThan(0);
      designCourses.forEach((c) => expect(c.category).toBe("Design"));
    });

    it("should filter by learning mode (online vs physical)", () => {
      const onlineCourses = courses.filter((c) => c.learningModes.includes("online" as LearningMode));
      const physicalCourses = courses.filter((c) => c.learningModes.includes("physical" as LearningMode));

      expect(onlineCourses.length).toBeGreaterThan(0);
      expect(physicalCourses.length).toBeGreaterThan(0);
    });

    it("should correctly partition by price ranges", () => {
      const under50k = courses.filter((c) => c.price < 50_000);
      const between50and75k = courses.filter((c) => c.price >= 50_000 && c.price <= 75_000);
      const above75k = courses.filter((c) => c.price > 75_000);

      const total = under50k.length + between50and75k.length + above75k.length;
      expect(total).toBe(courses.length);
    });

    it("should correctly partition by duration ranges", () => {
      const shortCourses = courses.filter((c) => c.durationWeeks <= 6);
      const mediumCourses = courses.filter((c) => c.durationWeeks >= 7 && c.durationWeeks <= 10);
      const longCourses = courses.filter((c) => c.durationWeeks >= 11);

      expect(shortCourses.length + mediumCourses.length + longCourses.length).toBe(courses.length);
    });
  });

  describe("Related Courses Recommendation", () => {
    it("should return related courses in same category excluding current course", () => {
      const target = courses[0];
      const related = getRelatedCourses(target.id, target.category, 3);
      expect(related.length).toBeLessThanOrEqual(3);
      expect(related.some((c) => c.id === target.id)).toBe(false);
    });
  });
});
