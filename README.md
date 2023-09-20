# Chromeo.ai SDK API Reference

The Chromeo.ai SDK allows you to create an automation script (a "macro") that interacts with any website using the [Chromeo AI browser extension](https://chrome.google.com/webstore/detail/chromeo-ai/idahijhccencfhigphpmlnjbppldolgk).

# Usage

```js
import * as sdk from 'https://chromeo.ai/chromeo-sdk-1.0.0.js'
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
- [`getExtensionInfo`](#getExtensionInfo)
- [`navigateToUrl`](#navigateToUrl)
- [`openNewTab`](#openNewTab)

### Text
- [`pressKey`](#pressKey)
- [`prompt`](#prompt)
- [`typeText`](#typeText)

### Data
- [`fetch`](#fetch)
- [`inferData`](#inferData)

# Methods

All methods are async (return a Promise).

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
await click('button', 'Log in')
```

<a name="clickIfExists"></a>

## clickIfExists( selector, [textContent] )

Attempts to click an element. If the element does not exist, it returns (does not wait for the element to appear) so execution of the script continues
- `selector` {String} - The CSS selector of the element to click.
- `textContent` {String} *(optional)* - Case-insensitive text content that must appear within the element's node or its descendants.

```js
// Immediately try clicking `button` element containing the text 'log in', otherwise proceed gracefully
await clickIfExists('button', 'Log in')
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

**Returns**: a copy of the active tab's `document` DOM object

```js
const dom = await getDOMSnapshot()
await dom.querySelector('button').click()
```

<a name="waitForElement"></a>

## waitForElement( selector, [textContent] )

Waits for a specific element to exist in the active tab's HTML.
- `selector` - The CSS selector of the element to wait for.
- `textContent` *(optional)* - Text content that must appear within the element's node or its descendants.

```js
await waitForElement('#login-button')
```

<a name="fetch"></a>

## fetch( url, options )

Performs a `fetch` request in the context of the active tab
- `url` {String} - The absolute URL (or URL path relative to the active tab's origin) .
- `options` {Object} *(optional)* - Standard `fetch` options with keys such as `method`, `headers`, `body`, etc. If the `body` provided is an Object, it will be automatically stringified.

**Returns**: {Object} the standard `fetch` response object with the following additional fields for convenience: `body` and `request`

```js
const response = await fetch('/v1/something', {
  method: 'POST',
  body: { ... }
})
console.log(response) // { body: { ... }, status: 201, ... }
```

<a name="getExtensionInfo"></a>

## getExtensionInfo()

Retrieves information about the Chromeo AI browser extension.

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

<a name="pressKey"></a>

## pressKey( keycode )

Simulates pressing a specific key.
- `keycode` {String|Integer} - JavaScript keycode, (see [keyCode reference](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode#printable_keys_in_standard_position)). Only the most common string keycodes are supported, but all numeric keycodes are supported.

```js
await pressKey('Enter')
```

<a name="prompt"></a>

## prompt( message )

Displays a text input prompt to the user.
- `message` {String} - The message to display to the user above the input box

**Returns**: {String} the user's input text

```js
const inputText = await prompt('What is your favorite color?'); // "rich mahogany"
const { hex } = await inferData({ hex: 'The hex color code' }, inputText)
console.log(hex) // #88421D
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


## Example Macro

```js
import {
  openNewTab,
  click,
  elementExists,
  end,
} from 'https://chromeo.ai/chromeo-sdk-1.0.0.js'

export const extensionVersion = '0.0.5'

export default async function watchMovieOnNetflix() {
  await openNewTab("https://www.netflix.com/browse")
  const isLoggedOut = await elementExists('button.login-button')
  if (isLoggedOut) await click('button.login-button')
  const isChooseProfile = await elementExists('h1.profile-gate-label')
  if (isChooseProfile) await click('a.profile-link')
  await click('a', 'Movies')
  await click('div.ptrack-content > a')
  await Promise.any([
    click('button', 'Play'),
    click('button', 'Resume'),
  ])
  await click('button[aria-label="Full screen"]')
  await end()
}
```

## Example Integration to Third-party React App (COMING SOON)

```js
import { useChromeoSDK, runMacro } from 'chromeoai'

const MyComponent = () => {
  const { runMacro } = useChromeoSDK()
  const onClick = () => runMacro('sendVenmoPayment', '$5 to @will123195 for coffee')
  return (
    <button onClick={onClick}>Send me $5</button>
  )
}
```

## Example Integration to Third-party Website (COMING SOON)

```js
async function () {
  const { launchMacro } = import('https://chromeo.ai/chromeo-sdk-1.0.0.js')
  document.querySelector('button').addEventListener('click', () => {
    // this will confirm with the user, then run the macro
    return runMacro('sendVenmoPayment', '$5 to @will123195 for coffee')
  }, false)
}
```

## Example API Integration (COMING SOON)

```js
import axios from 'axios'

// the user's oauth token must be provided
// this will add this job to the user's inbox, the user will confirm/decline
await axios.post('https://chromeo.ai/v1/run-macro', {
  id: 'sendVenmoPayment',
  input: '$5 to @will123195 for coffee'
})
```
