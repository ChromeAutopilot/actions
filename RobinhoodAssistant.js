import {
  openNewTab,
  typeText,
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
} from 'http://localhost:3000/sdk-1.0.0.js'
// } from 'https://chromeautopilot.com/sdk-1.0.0.js'

export const extensionVersion = '0.0.14'
export const name = 'Robinhood Assistant'
export const description = 'Executes trades for you on the Robinhood website.'
// export const button = '💰 Submit Order'
export const inputPrompt = `Tell me your stock or crypto trade and I'll open Robinhood and execute it for you.`

async function login() {
  await click('a[href="https://robinhood.com/login"]')
  await waitForElement('input[name="username"]')
  // TODO: click login button only if username and password are filled in
  await click('button', 'Log In')
  await waitForElement('a[href="/account"]')
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function chooseUnit({ assetCategory, orderType, amountUSD, quantity, tickerSymbol }) {
  let dom = await getDOMSnapshot()
  if (!amountUSD && !quantity) return
  await dom.getElementByText('label', `${orderType} in`).closest('div').querySelector('button').click()
  switch (assetCategory) {
    case 'crypto':
      if (amountUSD) return click('li', 'USD')
      if (quantity) return click('li', tickerSymbol)
      return
    case 'stocks':
      if (amountUSD) return click('li', 'Dollars')
      if (quantity) return click('li', 'Shares')
      return
  }
}

async function enterOrder(inputText, data) {
  const { amountUSD, orderType, quantity, sellEntirePosition, tickerSymbol, assetCategory } = data
  await click('form a', `${orderType}`)
  if (orderType === 'sell' && sellEntirePosition) {
    if (await elementExists('button', 'Sell all')) {
      await click('button', 'Sell all')
      await click('button[type=submit]', 'Sell')
      return
    }
  }
  await chooseUnit(data)
  if (amountUSD) {
    await click('input[placeholder="$0.00"]')
    await typeText(amountUSD)
  } else if (quantity) {
    let dom = await getDOMSnapshot()
    const label = assetCategory === 'crypto' ? 'Amount' : 'Shares'
    await dom.getElementByText('label', label).closest('div').querySelector('input').click()
    await typeText(quantity)
  } else {
    let dom = await getDOMSnapshot()
    const available = dom.querySelector('form[data-testid="OrderForm"] footer').textContent
    const newData = await inferData({
      amountUSD: 'The amount the user explicitly states they want to buy or sell in USD (do not assume or guess)',
      quantity: 'The nunmber of units of the stock or crypto the user explicitly requested to buy or sell (do not assume or guess)', 
    }, `${inputText} \n\n[Did the user specify how much? ${available}]`) 
    if (newData.amountUSD || newData.quantity) {
      return enterOrder(inputText, { ...data, ...newData })
    }
    const amountClarification = await prompt('How much?')
    return enterOrder(amountClarification, { ...data, ...newData })
  }
  await click('button', 'Review')
  await sleep(100)
  if (await elementExists('section', 'sell all')) {
    await click('button', 'Yes')
  }
  await click('form button[type=submit]', orderType)
}

async function getOntoThePage() {
  await waitForElement('main.app')
  let isLoggedOut = await elementExists('a[href="https://robinhood.com/login"]')
  if (isLoggedOut) {
    await login()
  }
}

export default async function (inputText) {
  const data = await inferData({ 
    amountUSD: '{Numeric} The USD value of the order',
    tickerSymbol: 'The ticker symbol of the stock or crypto',
    name: 'The name of the asset to search for if we do not have the ticker symbol',
    assetCategory: 'The asset category ("stocks" or "crypto")',
    orderType: 'The type of order ("buy" or "sell")',
    quantity: '{Numeric} The nunmber of units of the stock or crypto to buy or sell', 
    sellEntirePosition: 'Boolean indicating if this is a sell order for the entire position in the asset',
  }, `${inputText} (buying power and quantity already on hand is not currently available)`)
  
  const {tickerSymbol, assetCategory } = data
  if (tickerSymbol && assetCategory) {
    await openNewTab(`https://robinhood.com/${assetCategory}/${tickerSymbol}`)
  } else {
    if (!data.name) return window.alert("I cannot handle this request, please try more specific instructions.")
    await openNewTab('https://robinhood.com')
    await click('input[type="search"]')
    await typeText(data.name)
    await click('#downshift-0-item-0')
  }
  await getOntoThePage()
  await enterOrder(inputText, data)
  await end()
}

// export async function init() {
//   await openNewTab('https://robinhood.com')
//   await getOntoThePage()
//   const data1 = await fetch('https://nummus.robinhood.com/accounts/')
//   const data2 = await fetch('https://bonfire.robinhood.com/accounts/5SP38106/unified/')
//   console.log(data1, data2)
//   await end()
// }