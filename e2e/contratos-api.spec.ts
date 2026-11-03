import { test, expect } from "@playwright/test";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

test.describe("Contratos de API REST - Centro Educativo Transformar para educar", () => {
  test("RNF_M02: el endpoint de cuotas debe rechazar peticiones sin token Bearer", async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/cuotas/`);
    expect(response.status()).toBe(401);
  });

  test("HU_M01: el endpoint de autenticación debe rechazar credenciales vacías con 400", async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/auth/login/`, {
      data: { usuario: "", password: "" },
    });
    // Debe devolver Bad Request (400) o Unauthorized (401)
    expect([400, 401]).toContain(response.status());
  });
});
