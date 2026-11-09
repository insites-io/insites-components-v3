import { test } from '@stencil/playwright';
import { expect } from '@playwright/test';
import { mount } from './helpers';

/**
 * ins-input-tel: reopening a saved number must show the country it was saved with. Modules store
 * a phone as "+1 4165551234" (dial code + national digits, no ISO country), and "+1" is shared by
 * the US, Canada and 23 other NANP countries. Before the fix the flag came from the dial code
 * alone, so every saved Canadian number reopened as the US. The area code now picks the country.
 *
 * The modules' InsInputTelWrap mounts the field empty and then calls setValue, so most cases go
 * through that path; the prop path covers markup that sets country-code and phonenum-value.
 */

const FIELD = `<ins-input-tel no-areacode label="Mobile Phone"></ins-input-tel>`;

const field = (page) => page.locator('ins-input-tel');

const selectedCountry = (page) =>
  field(page).evaluate(async (el: any) => (await el.getCountryData()).iso2);

const setValue = (page, country_code: string, phone_number: string) =>
  field(page).evaluate(
    (el: any, v) => el.setValue({ country: null, country_code: v.country_code, area_code: null, phone_number: v.phone_number }),
    { country_code, phone_number },
  );

test.describe('ins-input-tel', () => {
  test('a saved Toronto number reopens as Canada, not the US', async ({ page }) => {
    await mount(page, FIELD);
    await setValue(page, '+1', '4165551234');
    expect(await selectedCountry(page)).toBe('ca');
  });

  test('a saved New York number reopens as the US', async ({ page }) => {
    await mount(page, FIELD);
    await setValue(page, '+1', '2125551234');
    expect(await selectedCountry(page)).toBe('us');
  });

  test('a Caribbean NANP number reopens as its own country', async ({ page }) => {
    await mount(page, FIELD);
    await setValue(page, '+1', '8765551234');
    expect(await selectedCountry(page)).toBe('jm');
  });

  test('a UK mobile in a Guernsey-listed range stays the UK', async ({ page }) => {
    await mount(page, FIELD);
    await setValue(page, '+44', '7911123456');
    expect(await selectedCountry(page)).toBe('gb');
  });

  test('the national digits stay in the phone field, not the hidden flag input', async ({ page }) => {
    await mount(page, FIELD);
    await setValue(page, '+1', '4165551234');
    expect(await page.locator('ins-input-tel .phone').inputValue()).toBe('');
    expect(await page.locator('ins-input-tel .phone-number').inputValue()).toBe('4165551234');
    expect(await field(page).evaluate((el: any) => el.getValues())).toEqual({
      country_code: '1',
      area_code: '',
      phone_number: '4165551234',
    });
  });

  test('country-code and phonenum-value props pick Canada on first render', async ({ page }) => {
    await mount(page, `<ins-input-tel no-areacode country-code="1" phonenum-value="6045551234"></ins-input-tel>`);
    expect(await selectedCountry(page)).toBe('ca');
  });

  test('picking Canada, saving and reopening shows Canada', async ({ page }) => {
    await mount(page, FIELD);
    await page.locator('ins-input-tel .iti__selected-flag').click();
    await page.locator('ins-input-tel .iti__country[data-country-code="ca"]').click();
    await page.locator('ins-input-tel .phone-number').fill('6135551234');
    await page.locator('ins-input-tel .phone-number').press('Tab');
    await page.waitForChanges();

    const saved = await field(page).evaluate((el: any) => el.getValues());
    expect(saved.country_code).toBe('1');

    // Reopening builds a new field. A second mount() would keep the old one: setContent navigates
    // to the same "#" URL, which does not reload the page. So swap the element in place.
    await page.evaluate((html) => { document.body.innerHTML = html; }, FIELD);
    await expect(page.locator('ins-input-tel .iti')).toHaveCount(1);
    expect(await selectedCountry(page)).toBe('au');

    await setValue(page, `+${saved.country_code}`, saved.phone_number);
    expect(await selectedCountry(page)).toBe('ca');
  });
});
