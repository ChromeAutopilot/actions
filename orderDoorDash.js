import {
  openNewTab,
  waitForElement,
  fetch,
} from 'https://chromeautopilot.com/sdk-1.0.0.js'

export const extensionVersion = '0.0.5'
export const id = 'orderDoorDash'
export const name = 'Order DoorDash'
export const description = 'Order food from DoorDash'
export const domains = ['doordash.com']

export default async function () {
  await openNewTab("https://www.doordash.com/orders")
  await waitForElement('main span', 'Orders')
  const requestBody = {
    "operationName": "getConsumerOrdersWithDetails",
    "variables": {
      "offset": 0,
      "limit": 25,
      "includeCancelled": false
    },
    "query": `
      query getConsumerOrdersWithDetails($offset: Int!, $limit: Int!, $includeCancelled: Boolean) {
        getConsumerOrdersWithDetails(offset: $offset, limit: $limit, includeCancelled: $includeCancelled) {
          id
          orderUuid
          deliveryUuid
          createdAt
          submittedAt
          cancelledAt
          fulfilledAt
          specialInstructions
          isConsumerSubscriptionEligible
          isGroup
          isReorderable
          isGift
          isPickup
          isMerchantShipping
          containsAlcohol
          fulfillmentType
          deliveryAddress {
            id
            formattedAddress
            __typename
          }
          orders {
            id
            items {
              __typename
            }
            __typename
          }
        }
      }
    `
  }
  const response = await fetch('/graphql/getConsumerOrdersWithDetails?operation=getConsumerOrdersWithDetails', {
    method: 'POST',
    body: requestBody,
    headers: {
      "Content-Type": "application/json",
    }
  }).catch(console.log)
  console.log(response)
  const { body } = response
  const orders = body.data.getConsumerOrdersWithDetails
  console.log('orders', orders)
  // const dom = await getDOMSnapshot()
  // const elements = dom.getElementsByText('items', 'span')
  // console.log('elements', elements)
  // const orders = []
  // for (const element of elements) {
  //   await element.click()
  //   await sleep(1000)
  //   const dom = await getDOMSnapshot()
  //   const textEls = dom.getElementsByText('arrival')
  //   if (!textEls || !textEls[0]) {
  //     console.log('no textEls', textEls)
  //     // dom.querySelector('button[aria-label="Back"]').click()
  //     await sleep(1000)
  //     continue
  //   }
  //   const text = textEls[0].innerText
  //   // parse time from this format: • 7:01 PM arrival
  //   const time = text.split('•')[1].split('arrival')[0].trim()
  //   // determine breakfast, lunch, dinner, or other using time and am/pm
  //   let meal = 'other'
  //   const hour = parseInt(time.split(':')[0])
  //   const ampm = time.split(' ')[1]
  //   if (hour >= 5 && hour < 11 && ampm === 'AM') {
  //     meal = 'breakfast'
  //   } else if (hour >= 11 && hour < 5 && ampm === 'PM') {
  //     meal = 'lunch'
  //   } else if (hour >= 5 && hour < 11 && ampm === 'PM') {
  //     meal = 'dinner'
  //   }
  //   console.log('time', time)
  //   console.log('hour', hour)
  //   console.log('ampm', ampm)
  //   console.log('meal', meal)
  //   console.log('text', text)
  //   dom.querySelector('button[aria-label="Back"]').click()
  //   await sleep(1000)
  // }
  
  

}
