/// <reference types="node" />
import { test, expect } from "@playwright/test";
import { adaptEstadoPago, adaptCuotasList, adaptHistorialPagos } from "../src/adapters/cuotaAdapter";

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api").replace(/\/+$/, "");
const TUTOR_IDENTIFIER = process.env.MOBILE_TEST_TUTOR_USERNAME ?? "rperez";
const TUTOR_PASSWORD = process.env.MOBILE_TEST_TUTOR_PASSWORD ?? "pass1234";
const TEST_QUOTA_ID = process.env.MOBILE_TEST_CUOTA_ID;
const TEST_CONCEPT_KEY = process.env.MOBILE_TEST_CONCEPTO_KEY;
const TEST_CONCEPT_AMOUNT = process.env.MOBILE_TEST_CONCEPTO_IMPORTE;

const isLocalApi = ["localhost", "127.0.0.1"].includes(new URL(API_BASE_URL).hostname);
let loginStatus = 0;
let loginBody: Record<string, unknown> = {};
let tutorToken = "";

test.describe("Contratos de API REST - Centro Educativo Transformar para educar", () => {
  test.beforeAll(async ({ playwright }) => {
    const context = await playwright.request.newContext();
    const response = await context.post(`${API_BASE_URL}/auth/login/`, {
      data: { identifier: TUTOR_IDENTIFIER, password: TUTOR_PASSWORD },
    });
    loginStatus = response.status();
    loginBody = await response.json();
    if (typeof loginBody.access === "string") tutorToken = loginBody.access;
    await context.dispose();
  });

  test("HU_M02/HU_M03: el adaptador conserva estados y motivos del comprobante", () => {
    expect(adaptEstadoPago("En revisión")).toBe("en revisión");
    expect(adaptEstadoPago("Pagado")).toBe("pagado");
    expect(adaptEstadoPago("Rechazado")).toBe("rechazado");

    const [cuota] = adaptCuotasList([{
      id: 88,
      periodo: "Prueba local",
      monto: "100.00",
      monto_pagado: "0.00",
      estado: "pendiente",
      alumno: { legajo: 1, nombre_completo: "Alumno de prueba" },
      comprobantes: [{
        id: 99,
        estado: "rechazado",
        estado_pago: "rechazado",
        importe: "10.00",
        motivo_rechazo: "No se distingue el importe transferido.",
      }],
    }]);
    expect(cuota.comprobantes[0]).toMatchObject({
      estado: "rechazado",
      motivoRechazo: "No se distingue el importe transferido.",
    });
    expect(adaptHistorialPagos([cuota])[0]).toMatchObject({
      estado: "rechazado",
      motivoRechazo: "No se distingue el importe transferido.",
    });
  });

  test("RNF_M02: el endpoint protegido /auth/me/ debe rechazar peticiones sin token Bearer", async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/auth/me/`);
    expect(response.status()).toBe(401);
  });

  test("HU_M01: el endpoint de autenticación debe rechazar credenciales vacías con 400", async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/auth/login/`, {
      data: { identifier: "", password: "" },
    });
    expect(response.status()).toBe(400);
  });

  test("HU_M01: login exitoso con credenciales de tutor devuelve token Bearer y usuario con rol", async () => {
    expect(loginStatus).toBe(200);
    expect(loginBody).toHaveProperty("access");
    expect(loginBody).toHaveProperty("token_type", "Bearer");
    expect(loginBody).toHaveProperty("user");
    expect(loginBody.user).toHaveProperty("role", "padre");
  });

  test("HU_M02/HU_M03: cuotas devuelve una lista con el contrato financiero móvil", async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/cuotas/`, {
      headers: { Authorization: `Bearer ${tutorToken}` },
    });
    expect(response.status()).toBe(200);

    const cuotas = await response.json();
    expect(Array.isArray(cuotas)).toBe(true);
    for (const cuota of cuotas) {
      expect(cuota).toHaveProperty("id");
      expect(cuota).toHaveProperty("monto_total");
      expect(cuota).toHaveProperty("monto_pagado");
      expect(cuota).toHaveProperty("saldo");
      expect(cuota).toHaveProperty("estado");
      expect(cuota).toHaveProperty("alumno");
      expect(Array.isArray(cuota.conceptos_pago)).toBe(true);
      expect(Array.isArray(cuota.comprobantes)).toBe(true);
      for (const comprobante of cuota.comprobantes) {
        expect(comprobante).toHaveProperty("estado_pago");
        expect(comprobante).toHaveProperty("motivo_rechazo");
        if (comprobante.estado_pago === "rechazado") {
          expect(comprobante.motivo_rechazo).toEqual(expect.any(String));
          expect(comprobante.motivo_rechazo.trim().length).toBeGreaterThan(0);
        }
      }
    }
  });

  test("HU_M04: POST comprobantes requiere un archivo", async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/comprobantes/`, {
      headers: { Authorization: `Bearer ${tutorToken}` },
      multipart: { cuota_id: "1", importe: "1.00" },
    });
    expect(response.status()).toBe(400);
    expect(await response.json()).toHaveProperty("detail");
  });

  test("HU_M04: carga multipart deja el comprobante en revisión y lo devuelve en cuotas", async ({ request }) => {
    test.skip(!isLocalApi, "La carga crea registros; se permite solo contra Django local.");
    test.skip(!TEST_QUOTA_ID, "Prepará una cuota local asociada al tutor y define MOBILE_TEST_CUOTA_ID.");
    test.skip(!TEST_CONCEPT_KEY || !TEST_CONCEPT_AMOUNT, "Define la clave e importe completo de un concepto de esa cuota.");

    const upload = await request.post(`${API_BASE_URL}/comprobantes/`, {
      headers: { Authorization: `Bearer ${tutorToken}` },
      multipart: {
        cuota_id: TEST_QUOTA_ID as string,
        importe: TEST_CONCEPT_AMOUNT as string,
        conceptos_seleccionados: JSON.stringify([TEST_CONCEPT_KEY]),
        medio_pago: "Transferencia",
        archivo: {
          name: "comprobante-playwright.pdf",
          mimeType: "application/pdf",
          buffer: Buffer.from("%PDF-1.4\n% prueba local Playwright\n%%EOF\n"),
        },
      },
    });
    expect(upload.status()).toBe(201);
    const comprobanteCreado = await upload.json();
    expect(comprobanteCreado).toHaveProperty("estado", "en revisión");

    const cuotasResponse = await request.get(`${API_BASE_URL}/cuotas/`, {
      headers: { Authorization: `Bearer ${tutorToken}` },
    });
    expect(cuotasResponse.status()).toBe(200);
    const cuotas = await cuotasResponse.json();
    const cuota = cuotas.find((item: { id: number }) => item.id === comprobanteCreado.cuota_id);
    if (!cuota) throw new Error("La cuota con el comprobante nuevo no apareció en GET /api/cuotas/.");
    const comprobante = cuota.comprobantes.find((item: { id: number }) => item.id === comprobanteCreado.id);
    expect(comprobante).toMatchObject({
      estado_pago: "en revisión",
      motivo_rechazo: null,
    });
    const concepto = cuota.conceptos_pago.find((item: { clave: string }) => item.clave === TEST_CONCEPT_KEY);
    expect(concepto).toBeDefined();
    expect(concepto.saldo_disponible).toBe("0.00");
  });
});
