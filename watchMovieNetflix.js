import { 
  openNewTab,
  click,
  clickIfExists,
  elementExists,
  end,
} from 'https://chromeautopilot.com/sdk-1.0.0.js'

export const extensionVersion = '0.0.6'
export const id = 'watchMovieNetflix'
export const name = 'Watch a Movie on Netflix'
export const description = "We'll surprise you with a movie we think you'll like"
export const domains = ['netflix.com']
export const button = '🎬 Watch movie'

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

export default async function () {
  await openNewTab("https://www.netflix.com/browse")
  const isLoggedOut = await elementExists('button.login-button')
  if (isLoggedOut) await click('button.login-button')
  await sleep(2000)
  const isProfileGate = await elementExists('h1.profile-gate-label')
  console.log({ isProfileGate })
  if (isProfileGate) await click('a.profile-link')
  await click('a', 'Movies')
  await click('.title-card')
  await clickIfExists('button', 'Play')
  await clickIfExists('button', 'Resume')
  await click('button[aria-label="Full screen"]')
  await end()
}
