import {
  waitForElement,
  openNewTab,
  prompt,
  getDOMSnapshot,
  click,
  getSelector,
  typeText,
  inferData,
  clickIfExists,
  pressKey,
  end,
} from 'https://chromeo.ai/chromeo-sdk-1.0.0.js'
  
export const extensionVersion = '0.0.5'

let sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

export default async function (input) {
  const year = new Date().getFullYear()
  const inputText = input || await prompt('What month and gross sales amount?')
  if (!inputText.trim()) return 
  const data = await inferData({
    date: `The last day of the specified month in MM/DD/YYYY format, assuming ${year} year if unspecified`,
    grossSales: 'The numeric dollar amount of gross sales for the specified month',
  }, inputText)
  const { date, grossSales } = data
  await openNewTab("https://www.colorado.gov/revenueonline/_/")
  await waitForElement('.FastPageFooter')
  await sleep(500)
  await clickIfExists('a[href="../ClearSession"]')
  await click('button', 'Log In')
  let dom = await getDOMSnapshot()
  const record = dom.querySelector('.FastPanel', `${date} Returns`)
  const selector = await getSelector(record)
  const fullSelector = `${selector} a`
  await click(fullSelector, 'File Return')
  await click('[data-event="SelectTableRow"]')
  if (grossSales > 0) {
    await typeText(grossSales)
  } else {
    dom = await getDOMSnapshot()
    const zeroCheckbox = dom.getElementByText('*', 'Gross Sales is $0.00')
      .closest('td')
      .querySelector('input[type="checkbox"]')
    if (zeroCheckbox) {
      await click(getSelector(zeroCheckbox))
    }
    await click('button[data-event="AcceptDocModal"]')
    await click('button', 'Next')
    await click('button', 'Next')
    dom = await getDOMSnapshot()
    const agreeCheckbox = dom.getElementByText('label', 'I agree')
      .closest('div')
      .querySelector('input[type="checkbox"]')
    await click(getSelector(agreeCheckbox))
    await click('button', 'Submit')
    // TODO: autofilling the password isn't working
    // await pressKey('ArrowDown')
    // await pressKey('ArrowDown')
    // await pressKey('Enter')
    // await pressKey('Tab')
    // await pressKey('Tab')
    // await pressKey('Enter')
    await end()
  }
}
