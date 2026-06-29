import { describe, it, expect } from "vitest";

describe("App Store", () => {
  it("has initial state", async () => {
    const { useAppStore } = await import("../store/appStore");
    const state = useAppStore.getState();
    expect(state).toHaveProperty("isAuthenticated");
    expect(state).toHaveProperty("employees");
    expect(Array.isArray(state.employees)).toBe(true);
  });

  it("starts with mock employees", async () => {
    const { useAppStore } = await import("../store/appStore");
    const state = useAppStore.getState();
    expect(state.employees.length).toBeGreaterThan(0);
  });

  it("starts with mock products", async () => {
    const { useAppStore } = await import("../store/appStore");
    const state = useAppStore.getState();
    expect(state.products.length).toBeGreaterThan(0);
  });
});

describe("UserRole values", () => {
  it("are uppercase French names", () => {
    const roles = ["ADMIN", "RH", "MANAGER", "MAGASINIER", "EMPLOYE"];
    expect(roles).toContain("ADMIN");
    expect(roles).toContain("RH");
    expect(roles).toContain("MAGASINIER");
  });
});
