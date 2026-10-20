import { test } from '@stencil/playwright';
import { expect } from '@playwright/test';
import { mount } from './helpers';

/**
 * ins-header v6 support pill (TW#26801633).
 *
 * The header's "Ask us anything" pill is the only way into Intercom chat; the instance boots
 * Intercom with hide_default_launcher: true. A click opens the Messenger, a click while it is open
 * closes it, and the pill reads "Online" in office hours (Monday to Friday 08:00-18:00 by default)
 * and the reply-time line outside them. These specs fake window.Intercom (it records commands and
 * fires onShow/onHide the way the real Messenger does) and fix the clock.
 */

const FAKE_INTERCOM = () => {
  const ic: any = { calls: [] as string[], handlers: {} as { [k: string]: Function[] } };
  (window as any).__ic = ic;
  (window as any).Intercom = (cmd: string, arg?: any) => {
    ic.calls.push(cmd);
    if (cmd.startsWith('on')) (ic.handlers[cmd] = ic.handlers[cmd] || []).push(arg);
    if (cmd === 'show') (ic.handlers.onShow || []).forEach((f: Function) => f());
    if (cmd === 'hide') (ic.handlers.onHide || []).forEach((f: Function) => f());
  };
};

const header = (attrs = 'support-time-zone="UTC"') => `<ins-header variant="v6" instance-name="IIA Staging" ${attrs}></ins-header>`;

const pill = (page) => page.locator('ins-header button.iia-chat');
const presence = (page) => page.locator('ins-header .iia-chat__presence');
const dot = (page) => page.locator('ins-header .iia-chat__dot');
const intercomCalls = (page) => page.evaluate(() => (window as any).__ic.calls.filter((c: string) => !c.startsWith('on')));

const supportWarnings = (page) => {
  const warnings: string[] = [];
  page.on('console', (msg) => { if (msg.type() === 'warning' && msg.text().startsWith('ins-header:')) warnings.push(msg.text()); });
  return warnings;
};

// 19 Oct 2026 is a Monday.
const at = (iso: string) => new Date(iso);

test.describe('ins-header support availability', () => {
  const cases: Array<[string, string, boolean]> = [
    ['Monday 07:59', '2026-10-19T07:59:00Z', false],
    ['Monday 08:00', '2026-10-19T08:00:00Z', true],
    ['Wednesday 12:30', '2026-10-21T12:30:00Z', true],
    ['Friday 17:59', '2026-10-23T17:59:00Z', true],
    ['Friday 18:00', '2026-10-23T18:00:00Z', false],
    ['Saturday 10:00', '2026-10-24T10:00:00Z', false],
    ['Sunday 10:00', '2026-10-25T10:00:00Z', false],
  ];
  for (const [name, iso, online] of cases) {
    test(`${name} UTC reads ${online ? 'Online' : 'the reply line'}`, async ({ page }) => {
      await page.clock.setFixedTime(at(iso));
      await mount(page, header());

      await expect(presence(page)).toHaveText(online ? 'Online' : 'Replies in ~2h');
      if (online) {
        await expect(dot(page)).not.toHaveClass(/iia-chat__dot--away/);
        await expect(presence(page)).not.toHaveClass(/iia-chat__presence--away/);
      } else {
        await expect(dot(page)).toHaveClass(/iia-chat__dot--away/);
        await expect(presence(page)).toHaveClass(/iia-chat__presence--away/);
      }
    });
  }

  test('the away dot is muted, not the online green', async ({ page }) => {
    await page.clock.setFixedTime(at('2026-10-24T10:00:00Z'));
    await mount(page, header());
    const away = await dot(page).evaluate(el => getComputedStyle(el).backgroundColor);

    await page.locator('ins-header').evaluate((el: any) => { el.supportPresence = 'Online'; });
    await page.waitForChanges();
    const online = await dot(page).evaluate(el => getComputedStyle(el).backgroundColor);

    expect(away).not.toBe(online);
    expect(away).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('support-reply-line sets the away text', async ({ page }) => {
    await page.clock.setFixedTime(at('2026-10-24T10:00:00Z'));
    await mount(page, header('support-time-zone="UTC" support-reply-line="Back on Monday"'));
    await expect(presence(page)).toHaveText('Back on Monday');
  });

  test('support-time-zone moves the hours: 00:30 UTC Monday is 11:30 in Melbourne', async ({ page }) => {
    await page.clock.setFixedTime(at('2026-10-19T00:30:00Z'));
    await mount(page, header('support-time-zone="Australia/Melbourne"'));
    await expect(presence(page)).toHaveText('Online');

    await page.locator('ins-header').evaluate((el: any) => { el.supportTimeZone = 'UTC'; });
    await page.waitForChanges();
    await expect(presence(page)).toHaveText('Replies in ~2h');
  });

  test('support-hours takes other days and times', async ({ page }) => {
    await page.clock.setFixedTime(at('2026-10-24T11:00:00Z')); // Saturday
    await mount(page, header('support-time-zone="UTC" support-hours="6-7 10:00-14:00"'));
    await expect(presence(page)).toHaveText('Online');

    await page.locator('ins-header').evaluate((el: any) => { el.supportHours = '1-3,5 09:00-17:30'; });
    await page.waitForChanges();
    await expect(presence(page)).toHaveText('Replies in ~2h');
  });

  test('an unreadable support-hours or time zone warns once and falls back', async ({ page }) => {
    const warnings = supportWarnings(page);
    await page.clock.setFixedTime(at('2026-10-24T11:00:00Z')); // Saturday: away under the default hours
    await mount(page, header('support-time-zone="Mars/Olympus" support-hours="weekdays 9-5"'));

    await expect(presence(page)).toHaveText('Replies in ~2h');
    await page.locator('ins-header').evaluate((el: any) => { el.supportReplyLine = 'Later'; });
    await page.waitForChanges();
    expect(warnings).toEqual([
      'ins-header: unreadable support-hours "weekdays 9-5"; using "1-5 08:00-18:00". Format: ISO weekdays then HH:MM-HH:MM, e.g. "1-5 08:00-18:00".',
      'ins-header: unknown support-time-zone "Mars/Olympus"; using the browser\'s time zone.',
    ]);
  });

  test('an explicit support-presence pins the label and the online dot', async ({ page }) => {
    await page.clock.setFixedTime(at('2026-10-24T10:00:00Z')); // Saturday
    await mount(page, header('support-time-zone="UTC" support-presence="Online now"'));

    await expect(presence(page)).toHaveText('Online now');
    await expect(dot(page)).not.toHaveClass(/iia-chat__dot--away/);
  });

  test('re-evaluates every minute while connected', async ({ page }) => {
    await page.clock.install({ time: at('2026-10-23T17:59:10Z') }); // Friday
    await mount(page, header());
    await expect(presence(page)).toHaveText('Online');

    await page.clock.fastForward('01:00');
    await expect(presence(page)).toHaveText('Replies in ~2h');
    await expect(dot(page)).toHaveClass(/iia-chat__dot--away/);
  });

  test('clears its minute timer when removed and starts one again when re-attached', async ({ page }) => {
    await page.addInitScript(() => {
      const live = new Set<any>();
      (window as any).__minuteTimers = live;
      const si = window.setInterval.bind(window);
      const ci = window.clearInterval.bind(window);
      (window as any).setInterval = (fn: any, ms?: number, ...rest: any[]) => { const id = si(fn, ms, ...rest); if (ms === 60000) live.add(id); return id; };
      (window as any).clearInterval = (id: any) => { live.delete(id); return ci(id); };
    });
    await mount(page, header());
    const timers = () => page.evaluate(() => (window as any).__minuteTimers.size);
    expect(await timers()).toBe(1);

    await page.evaluate(() => { (window as any).__hdr = document.querySelector('ins-header'); (window as any).__hdr.remove(); });
    expect(await timers()).toBe(0);

    await page.evaluate(() => document.body.appendChild((window as any).__hdr));
    await page.waitForChanges();
    expect(await timers()).toBe(1);
  });

  test.describe('in the browser time zone', () => {
    test.use({ timezoneId: 'Asia/Manila' });

    test('defaults to the browser zone: 00:30 UTC Monday is 08:30 in Manila', async ({ page }) => {
      await page.clock.setFixedTime(at('2026-10-19T00:30:00Z'));
      await mount(page, header(''));
      await expect(presence(page)).toHaveText('Online');
    });
  });
});

test.describe('ins-header support chat toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(FAKE_INTERCOM);
    await page.clock.setFixedTime(at('2026-10-19T10:00:00Z'));
  });

  test('the pill opens the Messenger, then closes it on the next click', async ({ page }) => {
    await mount(page, header());
    const opened = await page.spyOnEvent('insSupportOpen');

    await pill(page).click();
    await page.waitForChanges();
    expect(await intercomCalls(page)).toEqual(['show']);
    await expect(pill(page)).toHaveAttribute('aria-expanded', 'true');
    expect(opened).toHaveReceivedEventTimes(1);

    await pill(page).click();
    await page.waitForChanges();
    expect(await intercomCalls(page)).toEqual(['show', 'hide']);
    await expect(pill(page)).toHaveAttribute('aria-expanded', 'false');
    expect(opened).toHaveReceivedEventTimes(1);

    await pill(page).click();
    await page.waitForChanges();
    expect(await intercomCalls(page)).toEqual(['show', 'hide', 'show']);
    expect(opened).toHaveReceivedEventTimes(2);
  });

  test('closing the Messenger from inside Intercom resets the toggle', async ({ page }) => {
    await mount(page, header());
    await pill(page).click();
    await page.evaluate(() => (window as any).Intercom('hide'));
    await page.waitForChanges();
    await expect(pill(page)).toHaveAttribute('aria-expanded', 'false');

    await pill(page).click();
    await page.waitForChanges();
    expect(await intercomCalls(page)).toEqual(['show', 'hide', 'show']);
  });

  test('the phone-width icon button toggles the same way', async ({ page }) => {
    await page.setViewportSize({ width: 600, height: 800 });
    await mount(page, header());
    const btn = page.locator('ins-header button.iia-hdr__btn[data-tip="Help & support"]');
    await expect(pill(page)).toHaveCount(0);

    await btn.click();
    await page.waitForChanges();
    await expect(btn).toHaveAttribute('aria-expanded', 'true');
    await expect(btn).toHaveAttribute('aria-label', 'Close support chat, 0 unread messages');
    await btn.click();
    await page.waitForChanges();
    expect(await intercomCalls(page)).toEqual(['show', 'hide']);
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  test('the screen reader label carries the unread count from Intercom', async ({ page }) => {
    await mount(page, header());
    await expect(pill(page)).toHaveAttribute('aria-label', 'Open support chat, 0 unread messages');

    await page.evaluate(() => (window as any).__ic.handlers.onUnreadCountChange.forEach((f: Function) => f(3)));
    await page.waitForChanges();
    await expect(pill(page)).toHaveAttribute('aria-label', 'Open support chat, 3 unread messages');
    await expect(page.locator('ins-header .iia-chat__badge')).toHaveText('3');

    await page.evaluate(() => (window as any).__ic.handlers.onUnreadCountChange.forEach((f: Function) => f(1)));
    await page.waitForChanges();
    await expect(pill(page)).toHaveAttribute('aria-label', 'Open support chat, 1 unread message');
  });

  test('the label says Close while the Messenger is open', async ({ page }) => {
    await mount(page, header());
    await pill(page).click();
    await page.waitForChanges();
    await expect(pill(page)).toHaveAttribute('aria-label', 'Close support chat, 0 unread messages');
    await pill(page).click();
    await page.waitForChanges();
    await expect(pill(page)).toHaveAttribute('aria-label', 'Open support chat, 0 unread messages');
  });

  test('subscribes to Intercom once, even when it loads after the header', async ({ page }) => {
    await page.addInitScript(() => { (window as any).__lateIntercom = (window as any).Intercom; delete (window as any).Intercom; });
    await mount(page, header());
    await page.evaluate(() => { (window as any).Intercom = (window as any).__lateIntercom; });

    await pill(page).click();
    await pill(page).click();
    await page.waitForChanges();
    const subs = await page.evaluate(() => (window as any).__ic.calls.filter((c: string) => c.startsWith('on')));
    expect(subs).toEqual(['onUnreadCountChange', 'onShow', 'onHide']);
    expect(await intercomCalls(page)).toEqual(['show', 'hide']);
  });
});
