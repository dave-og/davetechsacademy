import { describe, it, expect } from "vitest";
import {
  branches,
  getBranchById,
  getStoredBranches,
  getBranchesForCourse,
} from "../data/branches";

describe("Branch Roster & Selection Edge Cases", () => {
  it("should have valid campus branches with required attributes", () => {
    expect(branches.length).toBeGreaterThan(0);
    branches.forEach((b) => {
      expect(b.id).toBeTruthy();
      expect(b.name).toBeTruthy();
      expect(b.location).toBeTruthy();
      expect(b.address).toBeTruthy();
      expect(b.facilities?.length).toBeGreaterThan(0);
      expect(b.active).toBe(true);
    });
  });

  it("should retrieve stored active branches correctly", () => {
    const active = getStoredBranches().filter((b) => b.active);
    expect(active.length).toBeGreaterThan(0);
    active.forEach((b) => expect(b.active).toBe(true));
  });

  it("should retrieve branch by ID", () => {
    const branch = getBranchById("abeokuta-main");
    expect(branch).toBeDefined();
    expect(branch?.name).toContain("Abeokuta");
  });

  it("should return undefined for invalid branch ID (Edge Case: Branch unavailable)", () => {
    const branch = getBranchById("non-existent-campus-branch");
    expect(branch).toBeUndefined();
  });

  it("should filter branches that support a specific course", () => {
    const supported = getBranchesForCourse("frontend-development");
    expect(supported.length).toBeGreaterThan(0);
    supported.forEach((b) => {
      expect(b.courseIds).toContain("frontend-development");
    });
  });
});
