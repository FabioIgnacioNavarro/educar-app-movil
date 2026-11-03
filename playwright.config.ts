import { defineConfig, devices } from "@playwright/test";

/**
 * Configuración de Playwright para Centro Educativo "Transformar para educar" (educar-app-movil)
 * Valida contratos de la API REST en Django y pruebas de interfaz con emulación móvil.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report" }],
  ],
  use: {
    baseURL: process.env.EXPO_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "api-contracts",
      testMatch: /.*\.spec\.ts/,
    },
    {
      name: "mobile-pixel",
      use: { ...devices["Pixel 5"] },
      testMatch: /.*ui.*\.spec\.ts/,
    },
  ],
});
