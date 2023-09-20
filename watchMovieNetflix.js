import { 
  openNewTab,
  click,
  clickIfExists,
  elementExists,
  end,
} from 'https://chromeo.ai/chromeo-sdk-1.0.0.js'

export const extensionVersion = '0.0.6'

export const title = 'Watch a Movie on Netflix'
export const description = "We'll surprise you with a movie we think you'll like"
export const banner = 'netflix.com'
export const button = '🎬 Watch movie'


async function login() {
  await click('button.login-button')
}

async function chooseProfile() {
  await click('a.profile-link')
}

export default async function () {
  await openNewTab("https://www.netflix.com/browse")
  const isLoggedOut = await elementExists('button.login-button')
  if (isLoggedOut) await login()
  const isProfileGate = await elementExists('h1.profile-gate-label')
  if (isProfileGate) await chooseProfile()
  await click('a', 'Movies')
  await click('.title-card')
  await clickIfExists('button', 'Play')
  await clickIfExists('button', 'Resume')
  await click('button[aria-label="Full screen"]')
  await end()
}
