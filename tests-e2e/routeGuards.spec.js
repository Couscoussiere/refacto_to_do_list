// @ts-check
import { test, expect } from '@playwright/test';

const FAKE_USER  = { id: '1', firstName: 'Jean', lastName: 'Dupont', email: 'jean.dupont@test.com' };
const FAKE_TOKEN = 'fake-jwt-token';

test.describe('Accès aux pages selon la connexion', () => {

    // 1 - Un visiteur voit la page principale avec les accès login / inscription
    test('un visiteur accède à la page principale', async ({ page }) => {
        await page.goto('/');

        await expect(page.getByRole('heading', { name: /Organisez vos tâches/ })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Se connecter' })).toBeVisible();
        await expect(page.getByRole('link', { name: "S'inscrire" })).toBeVisible();
    });

    // 2 - Un visiteur qui tente d'ouvrir une zone protégée est redirigé vers le login
    for (const path of ['/projects', '/projects/1']) {
        test(`un visiteur est redirigé de ${path} vers /login`, async ({ page }) => {
            await page.goto(path);

            await expect(page).toHaveURL(/\/login$/);
            await expect(page.getByRole('heading', { name: 'Se connecter' })).toBeVisible();
        });
    }

    // 3 - Une URL inconnue affiche la page d'erreur
    test('une URL inconnue affiche une page 404', async ({ page }) => {
        await page.goto('/page-qui-n-existe-pas');

        await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
    });

    // 4 - Un utilisateur connecté n'a plus accès au login : redirection vers ses projets
    test('un utilisateur connecté est redirigé de /login vers /projects', async ({ page }) => {
        await page.route('**/v1/projects/**', route =>
            route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ projects: [] }) })
        );
        await page.goto('/');
        await page.evaluate(({ user, token }) => {
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', token);
        }, { user: FAKE_USER, token: FAKE_TOKEN });

        await page.goto('/login');

        await expect(page).toHaveURL(/\/projects$/);
        await expect(page.getByRole('heading', { name: 'Mes projets' })).toBeVisible();
    });

    // 5 - Un token expiré est traité comme une déconnexion
    test('un token expiré ne donne pas accès aux zones protégées', async ({ page }) => {
        const payload = Buffer.from(JSON.stringify({ sub: '1', exp: 1 })).toString('base64url');
        const expiredToken = `header.${payload}.signature`;

        await page.goto('/');
        await page.evaluate(({ user, token }) => {
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', token);
        }, { user: FAKE_USER, token: expiredToken });

        await page.goto('/projects');

        await expect(page).toHaveURL(/\/login$/);
    });

});
