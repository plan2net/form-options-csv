import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { expect, test, type FrameLocator, type Locator, type Page } from '@playwright/test';

const formFile = `.Build/v${process.env.TYPO3_VERSION ?? '14'}/public/fileadmin/form_definitions/contact.form.yaml`;

function editor(page: Page): FrameLocator {
  return page.frameLocator('#typo3-contentIframe');
}

async function selectTopic(page: Page): Promise<void> {
  await editor(page).locator('[data-identifier="stageArea"]').getByText('Topic', { exact: true }).click();
}

async function openImport(page: Page): Promise<Locator> {
  await selectTopic(page);
  await editor(page).getByRole('button', { name: 'Import from spreadsheet/CSV…' }).click();
  return page.getByRole('dialog');
}

async function paste(modal: Locator, text: string): Promise<void> {
  await modal.locator('.form-options-csv-drop-area').evaluate((dropArea, pastedText) => {
    const clipboardData = new DataTransfer();
    clipboardData.setData('text/plain', pastedText);
    dropArea.dispatchEvent(new ClipboardEvent('paste', { clipboardData, bubbles: true, cancelable: true }));
  }, text);
}

function inputValues(page: Page): Promise<string[]> {
  return editor(page).locator('input').evaluateAll(inputs => inputs.map(input => (input as HTMLInputElement).value));
}

const readmeExample = 'Label 1;1;1\nLabel 2;2\nLabel 3\nLabel 4;;1\n"Label with ; works too";5;1';

test.beforeEach(async ({ page }) => {
  mkdirSync(dirname(formFile), { recursive: true });
  copyFileSync('Tests/E2E/Fixtures/contact.form.yaml', formFile);
  // The login script resets the username field once it has loaded.
  await page.goto('/typo3/', { waitUntil: 'networkidle' });
  await page.locator('#t3-username').fill('admin');
  await page.locator('#t3-password').fill('Password-1234!');
  await page.locator('#t3-login-submit').click();
  const formsModule = page.getByRole('menuitem', { name: 'Forms', exact: true })
    .or(page.getByRole('link', { name: 'Forms', exact: true }))
    .first();
  const editFormLink = editor(page).locator('a[title="Edit this form"]').first();
  // The backend menu ignores clicks until its script has loaded, so click again until the form list shows.
  await expect(async () => {
    await formsModule.click();
    await expect(editFormLink).toBeVisible({ timeout: 5_000 });
  }).toPass({ timeout: 45_000 });
  await editFormLink.click();
});

test('the settings of a select show the import button instead of a textarea', async ({ page }) => {
  await selectTopic(page);
  await expect(editor(page).getByRole('button', { name: 'Import from spreadsheet/CSV…' })).toBeVisible();
  await expect(editor(page).locator('textarea')).toHaveCount(0);
});

test('the import button opens a modal with a paste area', async ({ page }) => {
  await selectTopic(page);
  await editor(page).getByRole('button', { name: 'Import from spreadsheet/CSV…' }).click();
  const modal = page.getByRole('dialog');
  await expect(modal).toBeVisible();
  await expect(modal.getByText('Paste cells here (Ctrl+V / ⌘V), drop a CSV file, or click to choose a file')).toBeVisible();
});

test('pasted cells show a preview and the number of options to add', async ({ page }) => {
  const modal = await openImport(page);
  await paste(modal, readmeExample);
  const rows = modal.locator('tbody tr');
  await expect(rows).toHaveCount(5);
  await expect(rows.nth(0).locator('td')).toHaveText(['Label 1', '1', '✔', '']);
  await expect(rows.nth(2).locator('td')).toHaveText(['Label 3', 'Label 3', '', '']);
  await expect(rows.nth(3).locator('td')).toHaveText(['Label 4', 'Label 4', '', 'Only one default allowed, added without default mark']);
  await expect(rows.nth(4).locator('td')).toHaveText(['Label with ; works too', '5', '', 'Only one default allowed, added without default mark']);
  await expect(modal.getByRole('button', { name: 'Add 5 options' })).toBeEnabled();
});

test('the paste area has focus once the modal is open, so Ctrl+V pastes into it', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  const modal = await openImport(page);
  await expect(modal.locator('.form-options-csv-drop-area')).toBeFocused();
  await page.evaluate(text => navigator.clipboard.writeText(text), 'Pasted;p');
  await page.keyboard.press('ControlOrMeta+V');
  await expect(modal.locator('tbody tr')).toHaveCount(1);
});

test('applying adds the rows below the existing option and they are saved with the form', async ({ page }) => {
  const modal = await openImport(page);
  await paste(modal, `${readmeExample}\nAgain;existing`);
  await modal.getByRole('button', { name: 'Add 5 options' }).click();
  await expect(modal).toBeHidden();
  await expect.poll(() => inputValues(page)).toEqual(expect.arrayContaining(['Existing option', 'Label 1', 'Label with ; works too']));

  const saved = page.waitForResponse(response => /saveForm|SaveForm/.test(response.url()));
  await editor(page).getByRole('button', { name: 'Save' }).click();
  expect((await saved).ok()).toBe(true);
  const yaml = readFileSync(formFile, 'utf8');
  const optionLines = yaml.split('\n').filter(line => /^ {16}\S/.test(line)).map(line => line.trim());
  expect(optionLines).toEqual([
    "existing: 'Existing option'",
    "1: 'Label 1'",
    "2: 'Label 2'",
    "'Label 3': 'Label 3'",
    "'Label 4': 'Label 4'",
    "5: 'Label with ; works too'",
  ]);
  expect(yaml).toContain('defaultValue: 1');
});

test('the preview explains skipped rows and dropped default marks', async ({ page }) => {
  const modal = await openImport(page);
  await paste(modal, 'Again;existing\n ;blank\nX;x;1\nY;y;1\nX again;x');
  const rows = modal.locator('tbody tr');
  await expect(rows).toHaveCount(5);
  await expect(rows.nth(0)).toContainText('Value already exists, skipped');
  await expect(rows.nth(1)).toContainText('No label, skipped');
  await expect(rows.nth(3)).toContainText('Only one default allowed, added without default mark');
  await expect(rows.nth(4)).toContainText('Value appears twice, skipped');
  await expect(modal.getByRole('button', { name: 'Add 2 options' })).toBeEnabled();
});

test('an unclosed quote blocks the import and names the line', async ({ page }) => {
  const modal = await openImport(page);
  await paste(modal, 'A;a\n"Broken;b');
  await expect(modal.getByText('Line 2: a quote is not closed')).toBeVisible();
  await expect(modal.getByRole('button', { name: 'Add 0 options' })).toBeDisabled();
});

test('a chosen comma separated file in the old Windows encoding is imported', async ({ page }) => {
  const modal = await openImport(page);
  await modal.locator('input[type="file"]').setInputFiles({
    name: 'cities.csv',
    mimeType: 'application/vnd.ms-excel',
    buffer: Buffer.from('"Graz, Österreich",grz,1\r\nWien,wie\r\n', 'latin1'),
  });
  const rows = modal.locator('tbody tr');
  await expect(rows).toHaveCount(2);
  await expect(rows.nth(0).locator('td')).toHaveText(['Graz, Österreich', 'grz', '✔', '']);
});

test('a dropped UTF-8 file with a byte order mark is imported', async ({ page }) => {
  const modal = await openImport(page);
  await modal.locator('.form-options-csv-drop-area').evaluate(dropArea => {
    const dataTransfer = new DataTransfer();
    const bytes = new Uint8Array([0xef, 0xbb, 0xbf, ...new TextEncoder().encode('Zürich;zrh\n')]);
    dataTransfer.items.add(new File([bytes], 'cities.csv', { type: 'text/csv' }));
    dropArea.dispatchEvent(new DragEvent('drop', { dataTransfer, bubbles: true, cancelable: true }));
  });
  await expect(modal.locator('tbody tr').first().locator('td').first()).toHaveText('Zürich');
});

test('an Excel workbook gets a hint instead of a preview', async ({ page }) => {
  const modal = await openImport(page);
  await modal.locator('input[type="file"]').setInputFiles({ name: 'cities.xlsx', mimeType: '', buffer: Buffer.from('PK') });
  await expect(modal.getByText('This is a spreadsheet file. Copy the cells or save the sheet as CSV.')).toBeVisible();
  await expect(modal.locator('tbody tr')).toHaveCount(0);
});

test('the header switch drops the first row from the preview', async ({ page }) => {
  const modal = await openImport(page);
  await paste(modal, 'Label\tValue\nVienna\tvie');
  await expect(modal.locator('tbody tr')).toHaveCount(2);
  await modal.getByLabel('First row is a header').check();
  await expect(modal.locator('tbody tr')).toHaveCount(1);
  await expect(modal.locator('tbody tr').first().locator('td').first()).toHaveText('Vienna');
});

test('the replace switch removes the existing options', async ({ page }) => {
  const modal = await openImport(page);
  await paste(modal, 'Vienna\tvie');
  await modal.getByLabel('Replace existing options').check();
  await modal.getByRole('button', { name: 'Replace with 1 option' }).click();
  await expect.poll(() => inputValues(page)).toContain('Vienna');
  expect(await inputValues(page)).not.toContain('Existing option');
});

test('the editor undo button removes the whole import in one step', async ({ page }) => {
  const modal = await openImport(page);
  await paste(modal, readmeExample);
  await modal.getByRole('button', { name: 'Add 5 options' }).click();
  await expect.poll(() => inputValues(page)).toContain('Label 1');
  await editor(page).locator('[data-identifier="undoButton"]').click();
  await expect.poll(() => inputValues(page)).not.toContain('Label 1');
  expect(await inputValues(page)).toContain('Existing option');
});
