import { 
  end,
  openNewTab,
  click,
  typeText,
  inferData,
  pressKey,
// } from 'http://localhost:3000/sdk-1.0.0.js'
} from 'https://chromeautopilot.com/sdk-1.0.0.js'

export const extensionVersion = '0.0.13'
export const id = 'getGmailContact'
export const name = 'Get Gmail Contact'
export const description = 'Get the contact info of someone in your Gmail contacts'
export const inputPrompt = 'Who do you want to get the contact info for?'

export default async function getGmailContact(inputText) {
  if (!inputText) return 
  const { name } = await inferData({
    name: 'The name of the contact',
  }, inputText)
  await openNewTab("https://contacts.google.com/")
  await click('input[aria-label="Search"]')
  await typeText(name)
  await pressKey('Enter')
  await click('div', name)
  await end()
}