import { 
  openNewTab,
  closeTab,
  click,
  pressKey,
  end,
  typeText,
  inferData,
  getDOMSnapshot
} from 'https://chromeautopilot.com/sdk-1.0.0.js'

export const extensionVersion = '0.0.13'
export const name = 'Send Gmail'
export const description = 'Send an AI generated email'
export const domains = ['gmail.com']
export const button = '📧 Send Email'
export const inputPrompt = 'Enter recipient and purpose of email'

export default async function sendGmail(inputText) {
  inputText = inputText || prompt(inputPrompt)
  if (!inputText) return 
  await openNewTab('https://gmail.com')
  await click('div[role="button"]', 'Compose')
  const dom = await getDOMSnapshot()
  const fromLabel = dom.getElementByText('form tr label', 'From')
  const defaultSender = fromLabel.closest('tr').querySelector('td:nth-child(2)').innerText
  // TODO: have a thinking character animation (text based spinner)
  const fields = {
    recipient: 'The email address or recipient in this format: "name" <email address>',
    subject: 'An appropriate subject line for the email',
    sender: `The sender of the email [defaults to ${defaultSender}]`,
    body: "A casual yet professional email body serving the specified purpose, leave blank if unsure. DO NOT use placeholders like '[Your name]'. Use the sender's actual name in the complementary close. If unknown, then simply omit the complementary close. Append 'Sent from Chrome Autopilot' to the end of the email body.",
  }
  const data = await inferData(fields, inputText)
  // TODO: find a contact instead of just typing the email address
  await typeText(data.recipient)
  await pressKey('Enter')
  await click('input[aria-label="Subject"]')
  await typeText(data.subject)
  await click('div[aria-label="Message Body"]')
  await typeText(data.body)
  await click('div[aria-label="Send"]')
  await closeTab()
  await end()
}