import {
  elementExists,
  openNewTab,
  typeText,
  click,
  closeTab,
  end,
  inferData,
  pressKey,
  getDOMSnapshot,
  waitForElement,
  sleep,
  sendMessageToUser
} from 'https://chromeautopilot.com/sdk-1.0.0.js'
// } from 'http://localhost:3000/sdk-1.0.0.js'

export const extensionVersion = '0.0.16'
export const id = 'locateItemInHomeDepot'
export const name = 'Locate Item in Home Depot'
export const description = 'Find the aisle and bay of a product in your local Home Depot'
export const domains = ['homedepot.com']
export const button = '🔍 Locate Item'
export const inputPrompt = 'Which Home Depot location and what item are you looking for?'

export default async function locateItemInHomeDepot(inputText) {
  const data = await inferData({ 
    homeDepotLocation: 'The name/town/store# of the home depot location', 
    product: 'The product you are looking for', 
  }, inputText)
  console.log('data', data)
  let hdLocation = data.homeDepotLocation
  if (!hdLocation) {
    return 'Which Home Depot store?'
  }
  // if (!product) {
  //   product = await prompt('What item?')
  //   return locateItemInHomeDepot(inputText + '\n' + product)
  // }
  await openNewTab('https://google.com')
  await typeText(`${hdLocation} home depot`)
  await pressKey('Enter')
  await click('cite', 'Store Directory')
  const selectStoreButton = await elementExists('div[data-component="StoreHeroHeader"] span', 'Shop This Store')
  if (selectStoreButton) {
    await click('div[data-component="StoreHeroHeader"] span', 'Shop This Store')
  }
  await click('input[type=search]')
  await typeText(data.product)
  await pressKey('Enter')
  await click('a', 'In Stock')
  await clickFirstNonSponsoredProduct()
  await waitForElement('[data-component="FulfillmentTiles"] button')
  await sleep(50)
  const isPickup = await elementExists('span', 'Aisle')
  let dom = await getDOMSnapshot()
  const specificProductName = dom.querySelector('[data-component="ProductDetailsTitle"] h1').innerText
  const productBrand = dom.querySelector('[data-component="ProductDetailsBrandCollection"]').innerText
  const { itemName } = await inferData({
    itemName: 'A brief yet fairly unique name of the item (no more than 6-7 words)',
  }, `${productBrand} ${specificProductName}`)
  const store = dom.querySelector('button[data-testid="my-store-button"] div').innerText
  if (!isPickup) {
    const isNearby = await elementExists('[data-automation-id="pickupNearByQty"]')
    if (!isNearby) {
      await closeTab()
      return `"${itemName}" is the top result, but it's not in stock at the ${store} store.`
    }
    await closeTab()
    return `"${itemName}" is the top result, but it's not in stock at the ${store} store. However, it is in stock nearby.`
    // TODO: 
    await click('[data-automation-id="pickupNearByQty"]')
    await sleep(150)
    let dom = await getDOMSnapshot()
    const inStockFilter = dom.querySelector('#inStockFilter') // this is in an iframe
    await inStockFilter.parent().click()
    const url = dom.querySelector('link[rel=canonical]').href
    let nearbyStore = dom.querySelector('[data-testid="store-pod-name"]').innerText
    let nearbyStoreName = nearbyStore.split('#')[0].trim()
    let storeNumber = nearbyStore.split('#')[1]
    await click('[aria-label="Close Drawer"]')
    await click('[data-testid="my-store-button"]')
    await click('[data-testid="store-search-text-field"]')
    await typeText(storeNumber)
    await pressKey('Enter')
    await click('[data-testid="store-search-pod-testId"] h5')
    await click('div[data-component="StoreHeroHeader"] span', 'Shop This Store')
    await navigateTo(url)
    dom = await getDOMSnapshot()
    const itemLocation = dom.getElementByText('span', 'Aisle').innerText
    return sendMessageToUser(`"${itemName}" is not in stock at ${store}, but it is in stock at ${nearbyStoreName}:\n\n**${itemLocation}**`, id)
  }  
  const itemLocation = dom.getElementByText('span', 'Aisle').innerText
  await closeTab()
  return `I found "${itemName}" in stock at the ${store} store:\n\n**${itemLocation}**`
  // return end()
}

async function clickFirstNonSponsoredProduct() {
  let dom = await getDOMSnapshot()
  const products = Array.from(dom.querySelectorAll('div[data-testid="product-pod"]'))
  console.log('products', products)
  const product = products.find(a => !a.querySelector('.product-sponsored__text'))
  return product.querySelector('a').click()
}