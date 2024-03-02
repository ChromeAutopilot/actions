import { 
  end,
  openNewTab,
  prompt,
  click,
  typeText,
  inferData,
  getDOMSnapshot,
// } from 'http://localhost:3000/sdk-1.0.0.js'
} from 'https://chromeautopilot.com/sdk-1.0.0.js'

export const extensionVersion = '0.0.14'
export const id = 'filePeriodicReportColorado'
export const name = 'File Periodic Report in Colorado'
export const description = 'Automate filing your annual periodic report to keep your Colorado business in Good Standing'
export const domains = ['coloradosos.gov']
export const button = '📄 File Periodic Report'
export const inputPrompt = 'Please provide the exact name of the entity'

export default async function filePeriodicReportColorado(inputText) {
  if (!inputText) return 
  const { name } = await inferData({
    name: 'The name of the business',
  }, inputText)
  await openNewTab("https://coloradosos.gov/biz/FileDocSearchCriteria.do")
  await typeText(name)
  await click('input[type="submit"][value="Search"]')
  const dom = await getDOMSnapshot()
  const nodes = dom.querySelectorAll('#box td')
  const td = Array.from(nodes).find(el => {
    if (el.textContent.trim().toLowerCase() !== name.toLowerCase()) return false
    if (el.parentElement.children[4].textContent.trim().replace(/\s/g, '') !== 'ArticlesofOrganization') return false
    return true
  })
  if (!td) {
    const newName = await prompt(`'${name}' not found, try fixing any typos or using a different name`, name)
    return filePeriodicReportColorado(newName)
  }
  await td.closest('tr').querySelector('a').click()
  await click('input[type="submit"][value="Confirm"]')
  // TODO: click the 'File Periodic Report' link
  await end()
}