import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { expect, test, type FrameLocator, type Locator, type Page } from '@playwright/test';

const formFile = '.Build/v14/public/fileadmin/form_definitions/contact.form.yaml';

function editor(page: Page): FrameLocator {
  return page.frameLocator('#typo3-contentIframe');
}

async function selectTopic(page: Page): Promise<Locator> {
  await editor(page).locator('[data-identifier="stageArea"]').getByText('Topic', { exact: true }).click();
  return editor(page).locator('.formeditor-inspector textarea');
}

test.beforeEach(async ({ page }) => {
  mkdirSync(dirname(formFile), { recursive: true });
  copyFileSync('Tests/E2E/Fixtures/contact.form.yaml', formFile);
  await page.goto('/typo3/');
  await page.locator('#t3-username').fill('admin');
  await page.locator('#t3-password').fill('Password-1234!');
  await page.locator('#t3-login-submit').click();
  await page.locator('a[href*="/typo3/module/form?"]').first().click();
  await editor(page).locator('a[title="Edit this form"]').first().click();
});

test('shows an empty import field', async ({ page }) => {
  await expect(await selectTopic(page)).toHaveValue('');
});

test('imports pasted options into a select inside a fieldset', async ({ page }) => {
  const importField = await selectTopic(page);
  await importField.fill('Label 1;1;1\nLabel 2;2\nLabel 3\nLabel 4;;1\n"Label with ; works too";5;1');
  // The core editor only reads the field on keyup.
  await importField.press('End');
  const saved = page.waitForResponse(response => response.url().includes('saveForm'));
  await editor(page).getByRole('button', { name: 'Save' }).click();
  await saved;

  const yaml = readFileSync(formFile, 'utf8');
  expect(yaml).toContain("5: 'Label with ; works too'");
  expect(yaml).toContain('defaultValue: 1');
  expect(yaml).not.toContain('options_import');

  await page.reload();
  await selectTopic(page);
  const selected = editor(page).locator('typo3-form-property-grid-editor input[type=checkbox]');
  await expect(selected).toHaveCount(5);
  await expect(selected.first()).toBeChecked();
});
