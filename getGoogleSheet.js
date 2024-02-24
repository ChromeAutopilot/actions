import { 
  end,
  inferData,
} from 'https://chromeautopilot.com/sdk-1.0.0.js'

export const extensionVersion = '0.0.13'
export const name = 'Get Google Sheet'
export const description = 'Get the data from a Google Sheet'
export const inputPrompt = 'Enter the name or ID of the Google Sheet'

export default async function sendGmail(inputText) {
  inputText = inputText || prompt(inputPrompt)
  if (!inputText) return 
  const fields = {
    id: 'The google sheet ID',
    name: 'The approximate name of the google sheet',
  }
  const data = await inferData(fields, inputText)
  await end()
}