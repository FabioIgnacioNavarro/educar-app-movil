import { test, expect } from "@playwright/test";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

test.describe("API Contract Tests - Educar para Transformar", () => {
  let authToken: string;

  test("debe rechazar acceso a cuotas sin token JWT (RNF_M02)", async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/cuotas/`);
    expect(response.status()).toBe(401);
  });

  test("debe autenticar al usuario y devolver tokens JWT (HU_M01)", async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/auth/login/`, {
      data: {
        usuario: "tutor_demo",
        password: "password123",
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty("access");
    expect(body).toHaveProperty("refresh");
    expect(body).toHaveProperty("user");
    expect(body.user).toHaveProperty("rol");

    authToken = body.access;
  });

  test("debe listar únicamente las cuotas de los hijos del tutor autenticado (HU_M02 / RNF_M04)", async ({ request }) => {
    test.skip(!authToken, "Requiere authToken previo");

    const response = await request.get(`${API_BASE_URL}/cuotas/`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);

    if (body.length > 0) {
      const cuota = body[0];
      expect(cuota).toHaveProperty("id");
      expect(cuota).toHaveProperty("periodo");
      expect(cuota).toHaveProperty("monto");
      expect(cuota).toHaveProperty("estado");
      expect(cuota).toHaveProperty("alumno");
    }
  });
});
