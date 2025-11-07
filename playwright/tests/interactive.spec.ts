import { test, expect } from '@playwright/test';

const NORMALIZE = (texts: string[]) => texts.map((label) => label.trim()).filter(Boolean);

test.describe('Sidebar highlight submenu', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');
	});

	test('expanded submenu lists tiers in order with glow and square toggle', async ({ page }) => {
		const sidebarToggle = page.getByTestId('sidebar-toggle');
		await expect(sidebarToggle).toBeVisible();

		const borderRadius = await sidebarToggle.evaluate((node) => window.getComputedStyle(node).borderRadius);
		expect(borderRadius).toContain('10px');

		await sidebarToggle.click();
		await expect(sidebarToggle).toHaveAttribute('aria-label', 'Collapse sidebar');

		const highlightTrigger = page.getByTestId('highlights-trigger');
		await highlightTrigger.click();

		const submenu = page.getByTestId('highlight-submenu-list');
		await expect(submenu).toBeVisible();

		const submenuLabels = NORMALIZE(await submenu.locator('button').allTextContents());
		expect(submenuLabels).toEqual(['Executives', 'Team Leads', 'Interns']);

		const assertGlow = async (testId: string, colorFragment: string) => {
			const glow = await page.getByTestId(testId).evaluate((node) => window.getComputedStyle(node).boxShadow);
			expect(glow).not.toBe('none');
			expect(glow).toContain(colorFragment);
		};

		await assertGlow('highlight-option-executives', 'rgba(249, 115, 22');
		await assertGlow('highlight-option-team-leads', 'rgba(250, 204, 21');
		await assertGlow('highlight-option-interns', 'rgba(34, 197, 94');
	});

	test('collapsed floating menu shows tier labels in order', async ({ page }) => {
		const highlightTrigger = page.getByTestId('highlights-trigger');
		await expect(highlightTrigger).toBeVisible();

		await highlightTrigger.click();

		const floatingMenu = page.getByTestId('highlight-floating-menu');
		await expect(floatingMenu).toBeVisible();

		const floatingLabels = NORMALIZE(await floatingMenu.locator('button').allTextContents());
		expect(floatingLabels).toEqual(['Executives', 'Team Leads', 'Interns']);
	});
});
