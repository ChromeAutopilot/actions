import {
  elementExists,
  waitForElement,
  navigateToUrl,
  click,
  end,
  prompt,
  inferData,
  pressKey,
  getDOMSnapshot,
  fetch,
// } from 'http://localhost:3000/sdk-1.0.0.js'
} from 'https://chromeautopilot.com/sdk-1.0.0.js'


async function login() {
  await click('a[href="https://robinhood.com/login"]')
  await waitForElement('input[name="username"]')
  // TODO: click login button only if username and password are filled in
  await click('button', 'Log In')
  await waitForElement('a[href="/account"]')
}

export default async function () {
  await waitForElement('main.app')
  let isLoggedOut = await elementExists('a[href="https://robinhood.com/login"]')
  if (isLoggedOut) {
    await login()
  }
}