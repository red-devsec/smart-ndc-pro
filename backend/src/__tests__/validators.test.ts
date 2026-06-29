import {
  loginSchema,
  employeeSchema,
  leaveSchema,
  productSchema,
  movementSchema,
} from "../validators";

describe("Validators", () => {
  describe("loginSchema", () => {
    it("accepts valid login data", () => {
      const result = loginSchema.parse({ email: "test@test.com", password: "1234" });
      expect(result.email).toBe("test@test.com");
    });

    it("rejects invalid email", () => {
      expect(() => loginSchema.parse({ email: "bad", password: "1234" })).toThrow();
    });

    it("rejects short password", () => {
      expect(() => loginSchema.parse({ email: "a@b.com", password: "12" })).toThrow();
    });
  });

  describe("employeeSchema", () => {
    it("accepts valid employee data", () => {
      const data = {
        firstName: "Test",
        lastName: "User",
        email: "test@test.com",
        position: "Dev",
        departmentId: "d1",
        hireDate: "2024-01-01",
        salary: 5000,
      };
      expect(() => employeeSchema.parse(data)).not.toThrow();
    });

    it("rejects missing required fields", () => {
      expect(() => employeeSchema.parse({})).toThrow();
    });

    it("rejects zero salary", () => {
      expect(() =>
        employeeSchema.parse({
          firstName: "T",
          lastName: "U",
          email: "a@b.com",
          position: "P",
          departmentId: "d1",
          hireDate: "2024-01-01",
          salary: 0,
        })
      ).toThrow();
    });
  });

  describe("leaveSchema", () => {
    it("accepts valid leave data", () => {
      const data = {
        employeeId: "emp1",
        type: "annual",
        startDate: "2024-06-01",
        endDate: "2024-06-05",
        reason: "Vacances",
      };
      expect(() => leaveSchema.parse(data)).not.toThrow();
    });

    it("rejects invalid leave type", () => {
      expect(() =>
        leaveSchema.parse({
          employeeId: "emp1",
          type: "invalid",
          startDate: "2024-06-01",
          endDate: "2024-06-05",
          reason: "Test",
        })
      ).toThrow();
    });
  });

  describe("productSchema", () => {
    it("accepts valid product data", () => {
      const data = {
        name: "Test Product",
        categoryId: "cat1",
        barcode: "1234567890123",
        price: 100,
      };
      expect(() => productSchema.parse(data)).not.toThrow();
    });

    it("applies defaults", () => {
      const result = productSchema.parse({
        name: "P",
        categoryId: "c1",
        barcode: "123",
        price: 50,
      });
      expect(result.quantity).toBe(0);
      expect(result.minThreshold).toBe(5);
    });
  });

  describe("movementSchema", () => {
    it("accepts valid movement", () => {
      const data = {
        productId: "p1",
        type: "in",
        reason: "replenishment",
        quantity: 10,
        employeeId: "e1",
      };
      expect(() => movementSchema.parse(data)).not.toThrow();
    });

    it("rejects negative quantity", () => {
      expect(() =>
        movementSchema.parse({
          productId: "p1",
          type: "out",
          reason: "sale",
          quantity: -1,
          employeeId: "e1",
        })
      ).toThrow();
    });
  });
});
