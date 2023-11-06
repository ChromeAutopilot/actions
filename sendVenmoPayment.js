import {
  prompt,
  inferData,
  pressKey,
  click,
  openNewTab,
  typeText,
  elementExists,
  end,
  clickIfExists,
} from 'https://chromeo.ai/chromeo-sdk-1.0.0.js'
// } from 'http://localhost:3001/chromeo-sdk-1.0.0.js'

export const extensionVersion = '0.0.5'

export const name = 'Send Venmo Payment'
export const description = "Send money easily by saying who and how much (and we'll mark it private)"
export const domains = ['venmo.com']
export const inputPrompt = 'Send how much to whom and for what?'
export const button = '💰 Send Money'

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

export default async function (input) {
  const text = input || await prompt("Send how much to whom and for what?")
  if (!text.trim()) return
  const data = await inferData({
    recipientName: 'The name of the recipient',
    recipientEmail: 'The email address of the recipient',
    recipientUsername: 'The venmo username (begins with @))',
    amount: 'The numeric amount of the payment',
    memo: 'The reason for the payment',
  }, text)
  data.recipient = data.recipientUsername || data.recipientEmail || data.recipientName
  data.memo = data.memo || `Sent from Chromeo.ai`
  await openNewTab("https://account.venmo.com/pay")
  await clickIfExists("button[name='Next']")
  await clickIfExists("button[name='Sign in']")
  // await click("a[href='/pay']")
  if (data.amount) {
    await click("input[aria-label='Amount']")
    await typeText(data.amount)
    await pressKey('Enter')
  }
  if (data.recipient) {
    await click("input#search-input")
    if (data.recipientUsername) {
      await clickIfExists('li', data.recipientUsername)
    } else if (data.recipientEmail) {
      await typeText(data.recipientEmail)
      await click('li', 'Pay or request')
    } else if (data.recipientName) {
      const recipientMatch = await elementExists('li', data.recipientName)
      if (recipientMatch) {
        await click('li', data.recipientName)
      } else {
        await pressKey('Escape')
        await sleep(100)
      }
    }
  }
  if (data.memo) {
    await click("#payment-note")
    await typeText(data.memo)
  }
  // set it to private
  if (await elementExists('h6', 'Public')) {
    await click('button', 'Public')
    await click('li', 'Private')
  }
  await click('button', 'Pay')
  await end()
}
