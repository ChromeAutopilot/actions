# Chrome Autopilot SDK API Reference

The Chrome Autopilot SDK allows you to create an automation script (an "Action") that interacts with any website using the [Chrome Autopilot browser extension](https://chrome.google.com/webstore/detail/chrome-autopilot/idahijhccencfhigphpmlnjbppldolgk).

# Usage

```js
import * as sdk from 'https://chromeautopilot.com/sdk-1.0.0.js'
```

# API

### DOM
- [`blurFocusedElement`](#blurFocusedElement)
- [`click`](#click)
- [`clickIfExists`](#clickIfExists)
- [`elementExists`](#elementExists)
- [`getDOMSnapshot`](#getDOMSnapshot)
- [`waitForElement`](#waitForElement)

### Browser
- [`closeTab`](#closeTab)
- [`getExtensionInfo`](#getExtensionInfo)
- [`navigateToUrl`](#navigateToUrl)
- [`openNewTab`](#openNewTab)
- [`runAction`](#runAction)

### Text
- [`alert`](#alert)
- [`pressKey`](#pressKey)
- [`prompt`](#prompt)
- [`typeText`](#typeText)

### Data
- [`fetch`](#fetch)
- [`inferData`](#inferData)

# Example

```js
import { 
  openNewTab,
  click,
  clickIfExists,
  elementExists,
  end,
} from 'https://chromeautopilot.com/sdk-1.0.0.js'

export const extensionVersion = '0.0.12'
export const title = 'Watch a Movie on Netflix'
export const description = "We'll surprise you with a movie we think you'll like"
export const button = '🎬 Watch movie'

export default async function () {
  await openNewTab("https://www.netflix.com/browse")
  const isLoggedOut = await elementExists('button.login-button')
  if (isLoggedOut) await click('button.login-button')
  const isProfileGate = await elementExists('h1.profile-gate-label')
  if (isProfileGate) await click('a.profile-link')
  await click('a', 'Movies')
  await click('.title-card')
  await clickIfExists('button', 'Play')
  await clickIfExists('button', 'Resume')
  await click('button[aria-label="Full screen"]')
  await end()
}
```

# Methods

All methods are async.

<a name="blurFocusedElement"></a>

## blurFocusedElement()

Removes the focus from the currently focused element.

```js
await blurFocusedElement()
```

<a name="click"></a>

## click( selector, [textContent] )

Clicks an element. If the element does not yet exist, it waits for the element to exist, then clicks it.
- `selector` {String} - The CSS selector of the element to click.
- `textContent` {String} *(optional)* - Case-insensitive text content that must appear within the element's node or its descendants.

```js
// Wait for `button` element containing the text 'log in' to appear, then click it
await click('#login button', 'Log in')
```

<a name="clickIfExists"></a>

## clickIfExists( selector, [textContent] )

Attempts to click an element. If the element does not exist, it returns (does not wait for the element to appear) so execution of the script continues
- `selector` {String} - The CSS selector of the element to click.
- `textContent` {String} *(optional)* - Case-insensitive text content that must appear within the element's node or its descendants.

```js
// Immediately try clicking `button` element containing the text 'log in', otherwise proceed gracefully
await clickIfExists('#login button', 'Log in')
```

<a name="elementExists"></a>

## elementExists( selector, [textContent] )

Determines if a specific element exists on the current webpage.
- `selector` {String} - The CSS selector of the element to check.
- `textContent` *(optional)* - Text content that must appear within the element's node or its descendants.
  
**Returns** {Boolean}

```js
// Check if there is a 'log out' link on the page
const isLoggedIn = await elementExists('a', 'Log out')
```

<a name="getDOMSnapshot"></a>

## getDOMSnapshot()

Gets a copy of the active tab's DOM. It's a snapshot of the current tab's `document` object, so if the HTML in the active tab changes, your DOM snapshot will be stale.

There are helper methods available on each element:
- getElementByText( elementType, [searchText] )
- getElementsByText( elementType, [searchText] )
- parent()

**Returns**: a copy of the active tab's `document` DOM object

```js
const dom = await getDOMSnapshot()
await dom.querySelector('#login button').click()
```

<a name="waitForElement"></a>

## waitForElement( selector, [textContent] )

Waits for a specific element to exist in the active tab's HTML.
- `selector` - The CSS selector of the element to wait for.
- `textContent` *(optional)* - Text content that must appear within the element's node or its descendants.

```js
await waitForElement('#login button')
```

<a name="closeTab"></a>

## closeTab()

Closes the current tab.

**Returns**: when the tab is closed

```js
await closeTab()
```

<a name="getExtensionInfo"></a>

## getExtensionInfo()

Retrieves information about the Chrome Autopilot browser extension the user currently has installed.

**Returns**: {Object}

```js
const { version } = await getExtensionInfo()
console.log(version) // 0.0.5
```

<a name="navigateToUrl"></a>

## navigateToUrl( url )

Directs the browser to the specified URL.
- `url` {String} - The URL to navigate to in the active browser tab.

**Returns**: when the navigation is complete (tab status is `complete`).

```js
await navigateToUrl('https://example.com')
```

<a name="openNewTab"></a>

## openNewTab( url )

Opens a new browser tab with the specified URL.
- `url` {String} - The URL to open in a new browser tab.

**Returns**: when the page is loaded in the new tab (tab status is `complete`).

```js
await openNewTab('https://example.com')
```

<a name="runAction"></a>

## runAction( id, [inputText] )

Imports and runs the specified Action with optional instructions. You can run an Action within another Action.
- `id` {String} - The id of the Action (the filename without .js extension). The list of Actions is [here](https://github.com/chromeautopilot/actions).
- `inputText` {String} - Natural language instructions for the Action. Use [`inferData`](#inferData) to extract structured data from the inputText.

**Returns**: {String} the Action may return a string value upon completion

```js
await runAction('sendVenmoPayment', 'please send $5 to @will123195 for coffee')
```

<a name="alert"></a>

## alert( message )

Opens an alert dialog in the current tab. Consider using prompt() instead.

**Returns**: when the alert is dismissed

```js
await alert('This message is displayed in the current tab')
```

<a name="pressKey"></a>

## pressKey( keycode )

Simulates pressing a specific key.
- `keycode` {String|Integer} - JavaScript keycode, (see [keyCode reference](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode#printable_keys_in_standard_position)). Only the most common string keycodes are supported, but all numeric keycodes are supported.

```js
await pressKey('Enter')
```

<a name="prompt"></a>

## prompt( message, [defaultValue] )

Opens a dialog in the current tab prompting the user for text input.

**Returns**: {String} user inputted text

```js
await prompt('What is your budget?', '$100)
```

<a name="typeText"></a>

## typeText(text)

Types a string of characters (into the currently focused input element)
- `text` {String} - The text to type.

```js
await click('*[type=search]')
await typeText('apple vision pro')
await pressKey('Enter')
```

<a name="fetch"></a>

## fetch( url, options )

Performs a `fetch` request in the context of the active tab
- `url` {String} - The absolute URL (or relative URL path of the active tab) .
- `options` {Object} *(optional)* - Standard `fetch` options with keys such as `method`, `headers`, `body`, etc. If the `body` provided is an Object, it will be automatically stringified.

**Returns**: {Object} the standard `fetch` response object with the following additional fields for convenience: `body` and `request`

```js
const response = await fetch('/v1/something', {
  method: 'POST',
  body: { ... }
})
console.log(response) // { body: { ... }, status: 201, ... }
```

<a name="inferData"></a>

## inferData( fields, inputText )

Analyzes the free-form `inputText` using an LLM and extracts a structured data object.
- `fields` {Object} - An object whose keys are the structured data fields you wish to extract. The value of each key is a description that provides context/instruction to the LLM to determine the correct value.
- `inputText` {String} - The unstructured text to analyze.

**Returns**: {Object} An object with the same keys as the `fields` param. If the `inputText` does not have enough information to derive the value of a given key, the key is set to null.

```js
const inputText = 'My friend John was born in 1999.';
const data = await inferData({
  name: "The name of the person",
  age: "The person's age",
  email: "The person's email address"
}, inputText)
console.log(data) // { name: 'John', age: 24, email: null }
```

# Launch an Action from your website

## React App (COMING SOON)

```js
import { launchAction } from 'chromeautopilot'

const BuyMeACoffee = () => (
  <button onClick={() => (
    launchAction('sendVenmoPayment', '$5 to @will123195 for coffee')
  )}>Buy me a coffee</button>
)
```

## Vanilla JavaScript (COMING SOON)

```js
import { launchAction } from 'https://chromeautopilot.com/sdk-1.0.0.js'

async function () {
  const { launchAction } = await import('https://chromeautopilot.com/sdk-1.0.0.js')
  const result = await launchAction('sendVenmoPayment', '$5 to @will123195 for coffee')
}
```
