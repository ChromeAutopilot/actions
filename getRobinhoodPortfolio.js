import {
  openNewTab,
  runAction,
  getDOMSnapshot,
  waitForElement,
  closeTab,
  navigateToUrl,
// } from 'http://localhost:3000/sdk-1.0.0.js'
} from 'https://chromeautopilot.com/sdk-1.0.0.js'

export const extensionVersion = '0.0.14'
export const id = 'getRobinhoodPortfolio'
export const name = 'Get Robinhood Portfolio'
export const description = 'Get the data from your Robinhood portfolio'

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

export default async function () {
  await openNewTab("https://robinhood.com/account/investing")
  await runAction('loginToRobinhood')
  return scrapePortfolio()
}

async function scrapePortfolio(attempt = 1) {
  try {
    console.log('Scraping portfolio', attempt)
    await waitForElement('header', 'Total portfolio value')
    await sleep(500)
    let dom = await getDOMSnapshot()
    const text = dom.getElementByText('header', 'Total portfolio value').innerText
    const totalValue = parseFloat(text.match(/\$(\d+\,?\.?\d*)/)[1].replace(/,/g, ''))
    const stocksSection = dom.getElementByText('h2', 'Stocks').parent();
    const cryptoSection = dom.getElementByText('h2', 'Cryptocurrencies').parent();
    const htmlHeaders = stocksSection.querySelectorAll('header > div > span > span')
    const headers = Array.from(htmlHeaders).map(el => el.innerText)
    const stockRows = stocksSection.querySelectorAll('a')
    const cryptoRows = cryptoSection.querySelectorAll('a')
    const rows = Array.from([...stockRows,...cryptoRows]).map(el => {
      const spans = el.querySelectorAll('div > span')
      return Array.from(spans).map(span => span.innerText).filter(Boolean)
    })

    await navigateToUrl('https://robinhood.com/')
    await sleep(1000)
    dom = await getDOMSnapshot()
    // get the second span in the div with text 'Cash earning interest'
    let cash = dom.getElementByText('div', 'Cash earning interest')
      .parent()
      .getElementByText('span', '$')
      .innerText

    await closeTab()
    const value = `
## Your Portfolio
- Total value: $${totalValue}
- Available cash: ${cash}

| ${headers.join(' | ')}|
| ${headers.map(() => '-----').join(' | ')} |
${rows.map(row => `| ${row.join(' | ')} |`).join('\n')}
`
    return value
  } catch (error) {
    console.log('Error scraping portfolio', error)
    scrapePortfolio(attempt + 1)
  }
}
