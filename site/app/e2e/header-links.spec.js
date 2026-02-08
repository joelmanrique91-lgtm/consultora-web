import { test, expect } from '@playwright/test';

const HEADER_LINKS = [
  { name: 'Servicios', path: '/servicios' },
  { name: 'Sobre', path: '/sobre' },
  { name: 'Experiencia', path: '/experiencia' },
  { name: 'Posts', path: '/posts' },
  { name: 'Contacto', path: '/contacto' },
];

const collectHitTestData = async (page, locator) => {
  const box = await locator.boundingBox();
  if (!box) {
    return { error: 'boundingBox null' };
  }
  const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  return page.evaluate(({ center }) => {
    const target = document.elementFromPoint(center.x, center.y);
    const summary = (el) => {
      if (!el || !(el instanceof HTMLElement)) {
        return null;
      }
      const style = window.getComputedStyle(el);
      return {
        tag: el.tagName.toLowerCase(),
        id: el.id || null,
        classes: [...el.classList],
        pointerEvents: style.pointerEvents,
        zIndex: style.zIndex,
        position: style.position,
        display: style.display,
        opacity: style.opacity,
        visibility: style.visibility,
      };
    };
    const path = [];
    let cursor = target;
    while (cursor && cursor instanceof HTMLElement) {
      let label = cursor.tagName.toLowerCase();
      if (cursor.id) {
        label += `#${cursor.id}`;
      }
      if (cursor.classList.length) {
        label += `.${[...cursor.classList].join('.')}`;
      }
      path.push(label);
      if (cursor.tagName.toLowerCase() === 'header') {
        break;
      }
      cursor = cursor.parentElement;
    }
    const backdrop = document.querySelector('.site-nav__backdrop');
    const panel = document.querySelector('.site-nav__panel');
    const details = document.querySelector('.site-nav__details');
    const body = document.body;
    return {
      center,
      hitElement: summary(target),
      hitPath: path,
      backdrop: summary(backdrop),
      panel: summary(panel),
      detailsOpen: details?.hasAttribute('open') ?? null,
      bodyMenuOpen: body.classList.contains('menu-open'),
      panelAriaHidden: panel?.getAttribute('aria-hidden') ?? null,
      panelInert: panel?.hasAttribute('inert') ?? null,
    };
  }, { center });
};

test.describe('header links', () => {
  test('desktop header links navigate', async ({ page }, testInfo) => {
    await page.goto('/');

    for (const linkData of HEADER_LINKS) {
      const link = page.getByRole('link', { name: linkData.name });
      await expect(link).toBeVisible();
      const hitData = await collectHitTestData(page, link);
      await testInfo.attach(`hit-${linkData.name}.json`, {
        body: JSON.stringify(hitData, null, 2),
        contentType: 'application/json',
      });

      try {
        await Promise.all([
          page.waitForURL(new RegExp(`${linkData.path}/?$`), { timeout: 8000 }),
          link.click(),
        ]);
      } catch (error) {
        const forensic = await collectHitTestData(page, link);
        await testInfo.attach(`forensic-${linkData.name}.json`, {
          body: JSON.stringify(forensic, null, 2),
          contentType: 'application/json',
        });
        throw error;
      }

      await page.goto('/');
    }
  });

  test('mobile menu opens and link navigates', async ({ page }) => {
    await page.goto('/');
    const toggle = page.getByRole('button', { name: /menú/i });
    await expect(toggle).toBeVisible();
    await toggle.click();
    const details = page.locator('details.site-nav__details');
    await expect(details).toHaveAttribute('open', '');

    const link = page.getByRole('link', { name: 'Servicios' });
    await Promise.all([
      page.waitForURL(/\/servicios\/?$/),
      link.click(),
    ]);
    await expect(details).not.toHaveAttribute('open', '');
  });
});
