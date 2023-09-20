import {
  openNewTab,
  typeText,
  elementExists,
  waitForElement,
  navigateToUrl,
  click,
  end,
} from 'https://chromeo.ai/chromeo-sdk-1.0.0.js'

export const extensionVersion = '0.0.5'

export const title = 'Buy Bitcoin on Robinhood'
export const description = 'DCA with a single click. Buy $10 of BTC on Robinhood.'
export const banner = 'Robinhood'
export const button = '📈 Stack Sats'

const BTCURL = "https://robinhood.com/crypto/BTC"

async function login() {
  await click('a[href="https://robinhood.com/login"]')
  await waitForElement('input[name="username"]')
  // TODO: click login button only if username and password are filled in
  await click('button', 'Log In')
  await waitForElement('a[href="/account"]')
  await navigateToUrl(BTCURL)
}

async function buyBTC() {
  await click('input[placeholder="$0.00"]')
  await typeText('10')
  await click('button', 'Review order')
  await click('button', 'Submit buy')
}

export default async function buyRobinhoodBTC() {
  await openNewTab(BTCURL)
  await waitForElement('main.app')
  let isLoggedOut = await elementExists('a[href="https://robinhood.com/login"]')
  if (isLoggedOut) {
    await login()
  }
  await buyBTC()
  await end()
}
