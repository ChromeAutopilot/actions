import {
  openNewTab,
  typeText,
  elementExists,
  waitForElement,
  click,
  end,
  prompt,
  inferData,
  getDOMSnapshot,
  sendMessageToUser,
  deduce,
  closeTab,
// } from 'http://localhost:3000/sdk-1.0.0.js'
} from 'https://chromeautopilot.com/sdk-1.0.0.js'

export const extensionVersion = '0.0.16'
export const name = 'Robinhood Assistant'
export const id = 'RobinhoodAssistant'
export const description = 'Executes trades for you on the Robinhood website.'
export const inputPrompt = `Tell me your stock or crypto trade(s) and I'll open Robinhood and execute it for you.`
export const banner = 'robinhood.com'
export const button = 'Chat'
export const isAssistant = true

const assistantId = id

export default async function (messages) {
  const actionResponse = await deduce({
    taskedWithIdentifying: 'the action to perform',
    contextualInformation: `
      You are the Robinhood Assistant and you have the following capabilities:
      - recallFromChatHistory - if the user is trying to remember something earlier in the conversation
      - executeTrades - if the user wants to perform specific trade(s) or make portfolio adjustments
      - providePortfolioAnalysis - if the user has a question about their portfolio or explicitly asks for feedback or an assessment of their portfolio
      - getRobinhoodPortfolio - if the user explicitly wants their raw portfolio data
      - getAssetData - if the user asks for data on a specific stock or crypto
      - getTradeHistory - if the user wants to see their trade history or has a question about it
    `,
    JSONOutputExamples: [
      { action: 'executeTrades' },
      { error: 'You do not have a sufficient DOGE balance to execute this trade.' },
    ],
    messages
  })
  console.log('actionResponse', actionResponse)
  // get key from actionResponse
  if (actionResponse.error) return sendMessageToUser(actionResponse.error, assistantId)
  const key = actionResponse.action
  switch (key) {
    case 'executeTrades': return executeTrades(messages)
    case 'recallFromChatHistory': return recallFromChatHistory(messages)
    case 'getTradeHistory': return getTradeHistory(messages)
    case 'getRobinhoodPortfolio': 
      const portfolio = await getRobinhoodPortfolio(messages)
      if (!portfolio) return sendMessageToUser('Sorry, there was a glitch retrieving your portfolio data. Try again.', assistantId)
      return sendMessageToUser(portfolio, assistantId)
    case 'providePortfolioAnalysis': return assessPortfolio(messages)
    case 'getAssetData': return getAssetData(messages)
    default: 
      console.log('no action identified', actionResponse)
      return sendMessageToUser(actionResponse[0], assistantId)
  }
}

async function getAssetData(messages) {
  const inputText = messages[messages.length - 1].content
  const data = await inferData({
    tickerSymbol: 'The ticker symbol of the stock or crypto',
    name: 'The name of the asset to search for if we do not have the ticker symbol',
    assetCategory: 'The asset category ("stocks" or "crypto")',
  }, inputText)
  console.log('data', data)
  const {tickerSymbol, assetCategory } = data
  if (tickerSymbol && assetCategory) {
    await openNewTab(`https://robinhood.com/${assetCategory}/${tickerSymbol}`)
  }
}

async function getTradeHistory(messages) {
  await openNewTab('https://robinhood.com/account/history')
  await end()
}

async function recallFromChatHistory(messages) {
  const response = await deduce({
    taskedWithIdentifying: 'requested information from the chat history',
    JSONOutputExamples: [
      {response: 'Yes of course, you previously sold all of your ETH at $2000 per coin on 4/20/2021.'},
      {response: 'My apologies, I do not have a record of that.'},
    ],
    messages
  })
  console.log('response', response)
  return sendMessageToUser(response.response, assistantId)
}

async function assessPortfolio(messages) {
  const portfolio = await getRobinhoodPortfolio()
  const assessment = await deduce({
    taskedWithIdentifying: 'the assessmenet/analysis or the answer to a question about the given portfolio',
    contextualInformation: `
      The user has the following portfolio data:
      ${portfolio}

      Don't explain how the user can calculate figures himself, do the calculation yourself and just give the answer.
    `,
    JSONOutputExamples: [
      {response: 'Your portfolio is well diversified and has a low risk profile.'},
      {response: 'Your portfolio is heavily weighted in cryptocurrency and bitcoin miners and has a high risk profile.'},
    ],
    messages
  })
  console.log('assessment', assessment)
  return sendMessageToUser(assessment.response, assistantId)
}

async function getRobinhoodPortfolio() {
  const portfolio = await runAction('getRobinhoodPortfolio')
  // await sendMessageToUser(portfolio, assistantId)
  return portfolio
}

async function executeTrades(messages) {
  // await sendMessageToUser("First, let's make sure we're logged into Robinhood...", assistantId)
  const portfolio = await getRobinhoodPortfolio()
  const tradesResponse = await deduce({
    taskedWithIdentifying: 'a series of single-asset trades',
    contextualInformation: `
      Someone else will execute the trades, but you need to identify 
      the trades to be executed.

      The user has provided you with the following portfolio data:
      ${portfolio}

      Fractional shares/tokens are available. Amounts can be specified in USD, 
      so the price of the asset is not needed to buy or sell a specific amount 
      of the asset.

      If the asset is missing in the portfolio, assume none is held.

      If a percent allocation is requested, identify the buy or sell trades required
      to increase or decrease the current allocation to the requested allocation.
      
      Please explain any calculation logic in the "notes" field.

      Errors should be generated when applicable, a few examples are below.
    `,
    JSONOutputExamples: [
      {trades: ['Sell 0.15 shares of AAPL','Buy $25 of BTC']},
      {notes: 'user asked for 15% allocation. 15% of total portfolio value is $10', trades: ['Buy $10 of TSLA']},
      {error: 'My knowledge and abilities are limited to executing trades on the Robinhood website.'},
      {error: '<Reason why trade is not possible>'},
    ],
    messages
  })
  const { error, trades, notes } = tradesResponse
  console.log('tradesResponse', tradesResponse)
  if (tradesResponse.code === "ECONNABORTED") {
    return sendMessageToUser('Sorry OpenAI is taking too long to respond. Try again momentarily.', assistantId)
  }
  if (error) {
    console.log('error identifying trades:', error)
    return sendMessageToUser(error, assistantId)
  }
  console.log('trades', trades)
  if (!trades.length) {
    return sendMessageToUser(notes, assistantId)
  }
  await sendMessageToUser(`I will execute the following trades for you:\n\`\`\`\n${trades.join('\n')}\n\`\`\``, assistantId)

  await mapSeries(trades, async trade => {
    const data = await inferData({ 
      amountUSD: '{Numeric} The USD value of the order',
      tickerSymbol: 'The ticker symbol of the stock or crypto',
      name: 'The name of the asset to search for if we do not have the ticker symbol',
      assetCategory: 'The asset category ("stocks" or "crypto")',
      orderType: 'The type of order ("buy" or "sell")',
      quantity: '{Numeric} The nunmber of units of the stock or crypto to buy or sell', 
      limitPrice: '{Numeric} The limit price for the order',
      sellEntirePosition: 'Boolean indicating if this is a sell order for the entire position in the asset',
    }, `${trade} \n\n ${portfolio}`)

    console.log('data', data)
    
    const {tickerSymbol, assetCategory } = data
    if (tickerSymbol && assetCategory) {
      await openNewTab(`https://robinhood.com/${assetCategory}/${tickerSymbol}`)
    } else {
      if (!data.name) return window.alert("I cannot handle this request, please try more specific instructions.")
      await openNewTab('https://robinhood.com')
      await click('input[type="search"]')
      await typeText(data.name)
      await click('#downshift-0-item-0')
    }
    await getOntoThePage()
    await enterOrder(trade, data)
    await closeTab()
  })
  await sendMessageToUser('Done!', assistantId)
}


async function login() {
  await click('a[href="https://robinhood.com/login"]')
  await waitForElement('input[name="username"]')
  // TODO: click login button only if username and password are filled in
  await click('button', 'Log In')
  await waitForElement('a[href="/account"]')
}

async function chooseUnit({ assetCategory, orderType, amountUSD, quantity, tickerSymbol }) {
  let dom = await getDOMSnapshot()
  if (!amountUSD && !quantity) return
  await dom.getElementByText('label', `${orderType} in`).closest('div').querySelector('button').click()
  switch (assetCategory) {
    case 'crypto':
      if (amountUSD) return click('li', 'USD')
      if (quantity) return click('li', tickerSymbol)
      return
    case 'stocks':
      if (amountUSD) return click('li', 'Dollars')
      if (quantity) return click('li', 'Shares')
      return
  }
}

async function enterOrder(inputText, data) {
  const { amountUSD, orderType, quantity, sellEntirePosition, tickerSymbol, assetCategory } = data
  await click('form h3', `${orderType}`)
  if (data.limitPrice) {
    // TODO: implement limit orders
    return window.alert('Sorry I cannot handle limit orders yet.')
  }
  if (orderType === 'sell' && sellEntirePosition) {
    if (await elementExists('button', 'Sell all')) {
      await click('button', 'Sell all')
      await click('button[type=submit]', 'Sell')
      return
    }
  }
  await chooseUnit(data)
  if (amountUSD) {
    await click('input[placeholder="$0.00"]')
    await typeText(amountUSD)
  } else if (quantity) {
    let dom = await getDOMSnapshot()
    const label = assetCategory === 'crypto' ? 'Amount' : 'Shares'
    await dom.getElementByText('label', label).closest('div').querySelector('input').click()
    await typeText(quantity)
  } else {
    let dom = await getDOMSnapshot()
    const available = dom.querySelector('form[data-testid="OrderForm"] footer').textContent
    const newData = await inferData({
      amountUSD: 'The amount the user explicitly states they want to buy or sell in USD (do not assume or guess)',
      quantity: 'The nunmber of units of the stock or crypto the user explicitly requested to buy or sell (do not assume or guess)', 
    }, `${inputText} \n\n[Did the user specify how much? ${available}]`) 
    if (newData.amountUSD || newData.quantity) {
      return enterOrder(inputText, { ...data, ...newData })
    }
    const amountClarification = await prompt('How much?')
    return enterOrder(amountClarification, { ...data, ...newData })
  }
  await click('button', 'Review')
  await sleep(100)
  if (await elementExists('section', 'sell all')) {
    await click('button', 'Yes')
  }
  await click('form button[type=submit]', orderType)
}

async function getOntoThePage() {
  await waitForElement('main.app')
  let isLoggedOut = await elementExists('a[href="https://robinhood.com/login"]')
  if (isLoggedOut) {
    await login()
  }
}

function mapSeries(array, asyncFn) {
  return array.reduce(async (promise, item) => {
    await promise
    return asyncFn(item)
  }, Promise.resolve())
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}