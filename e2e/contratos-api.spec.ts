import { test, expect } from "@playwright/test";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

test.describe("Contratos de API REST - Centro Educativo Transformar para educar", () => {
  test("RNF_M02: el endpoint protegido /auth/me/ debe rechazar peticiones sin token Bearer", async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/auth/me/`);
    expect(response.status()).toBe(401);
  });

  test("HU_M01: el endpoint de autenticación debe rechazar credenciales vacías con 400", async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/auth/login/`, {
      data: { identifier: "", password: "" },
    });
    expect([400, 401]).toContain(response.status());
  });

  test("HU_M01: login exitoso con credenciales de tutor devuelve token Bearer y usuario con rol", async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/auth/login/`, {
      data: { identifier: "rperez", password: "pass1234" },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty("access");
    expect(body).toHaveProperty("token_type", "Bearer");
    expect(body).toHaveProperty("user");
    expect(body.user).toHaveProperty("role", "padre");
  });
});
