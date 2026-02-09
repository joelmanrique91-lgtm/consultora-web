import { test, expect } from '@playwright/test';

const HEADER_LINKS = [
  { name: 'Servicios', path: '/servicios' },
  { name: 'Sobre', path: '/sobre' },
  { name: 'Posts', path: '/posts' },
];

test.describe('header clickable navigation', () => {
  test('header links remain clickable across breakpoints', async ({ page }, testInfo) => {
    await page.goto('/');

    const isMobile = testInfo.project.name === 'mobile';
    const toggle = page.getByRole('button', { name: /menú/i });
    const details = page.locator('details.site-nav__details');

    for (const linkData of HEADER_LINKS) {
      if (isMobile) {
        await expect(toggle).toBeVisible();
        await toggle.click();
        await expect(details).toHaveAttribute('open', '');
      }

      const link = page.getByRole('link', { name: linkData.name });
      await expect(link).toBeVisible();

      await Promise.all([
        page.waitForURL(new RegExp(`${linkData.path}/?$`), { timeout: 8000 }),
        link.click(),
      ]);

      await page.goto('/');
    }
  });
});
