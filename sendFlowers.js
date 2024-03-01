import {
  openNewTab,
  typeText,
  elementExists,
  waitForElement,
  navigateToUrl,
  click,
  inferData,
  end,
} from 'https://chromeautopilot.com/sdk-1.0.0.js'

import { inferData } from '../website/web/public/sdk-1.0.0'

export const extensionVersion = '0.0.13'
export const name = 'Send Flowers'
export const description = 'Send flowers to someone special'
export const domains = ['bouqs.com']
export const button = '🌹 Send Flowers'
export const inputPrompt = 'To whom and when should they arrive?'

export default async function sendFlowers(inputText) {
  if (!inputText) return
  await inferData({ recipientName: 'The name of the recipient', deliveryDate: 'The date the flowers should arrive' }, inputText)
  
  await openNewTab("https://bouqs.com/flowers/mixed/pink-roses-oriental-lilies-vase")
  await waitForElement('span', 'Delivery Date')
  await typeText('10001')
  await click('button', 'Shop Now')
  await click('a', 'Shop All')
  await click('img[alt="Bouquet"]')
  await click('button', 'Add to Cart')
  await click('button', 'Checkout')
  await typeText('John Doe')
}
