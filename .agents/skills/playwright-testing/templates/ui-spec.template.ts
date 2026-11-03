import { test, expect } from "@playwright/test";

test.describe("UI Móvil - Login y Consulta de Cuotas (HU_M01 / HU_M02)", () => {
  test("debe mostrar la pantalla de login con campos requeridos", async ({ page }) => {
    await page.goto("/");

    // 1. Verificar inputs de usuario y contraseña
    const usuarioInput = page.getByTestId("input-usuario");
    const passwordInput = page.getByTestId("input-password");
    const loginButton = page.getByTestId("btn-login");

    await expect(usuarioInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(loginButton).toBeVisible();
  });

  test("debe mostrar mensaje de error si las credenciales son inválidas", async ({ page }) => {
    await page.goto("/");

    await page.getByTestId("input-usuario").fill("usuario_inexistente");
    await page.getByTestId("input-password").fill("clave_invalida");
    await page.getByTestId("btn-login").click();

    await expect(page.getByTestId("login-error-msg")).toBeVisible({ timeout: 5000 });
  });
});
