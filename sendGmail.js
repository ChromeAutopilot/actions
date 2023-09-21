import { 
  openNewTab,
  click,
  pressKey,
  end,
  typeText,
  inferData,
  getDOMSnapshot
} from 'https://chromeo.ai/chromeo-sdk-1.0.0.js'

export const extensionVersion = '0.0.7'
export const title = 'Send Gmail'
export const description = 'Send an AI generated email'
export const banner = 'Gmail'
export const button = '📧 Send Email'
export const inputPrompt = 'Enter recipient and purpose of email'

// send will@gadgetlabs.com an invoice for $1000 for 5 hours of consulting work on TopNug.com, format it like an itemized invoice.

export default async function (inputText) {
  inputText = inputText || prompt(inputPrompt)
  if (!inputText) return end()
  await openNewTab('https://gmail.com')
  await click('div', 'Compose')
  const dom = await getDOMSnapshot()
  const fromLabel = dom.getElementByText('form tr label', 'From')
  const defaultSender = fromLabel.closest('tr').querySelector('td:nth-child(2)').innerText
  // TODO: have a thinking character animation (text based spinner)
  const data = await inferData({
    recipient: 'The email address or recipient in this format: "name" <email address>',
    subject: 'An appropriate subject line for the email',
    body: 'A casual yet professional email body serving the specified purpose, leave blank if unsure',
    sender: `The sender of the email, defaults to ${defaultSender}`
  }, inputText)
  await typeText(data.recipient)
  await pressKey('Enter')
  await click('input[aria-label="Subject"]')
  await typeText(data.subject)
  await click('div[aria-label="Message Body"]')
  await typeText(data.body)
  await click('div[aria-label="Send"]')
  await end()
}