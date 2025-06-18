# Button Class

Helper class for creating various types of buttons for Telegram messages.

## Index

### Properties

- [button](https://gram.js.org/beta/classes/custom.Button.html#button)
- [resize](https://gram.js.org/beta/classes/custom.Button.html#resize)
- [selective](https://gram.js.org/beta/classes/custom.Button.html#selective)
- [singleUse](https://gram.js.org/beta/classes/custom.Button.html#singleUse)

### Methods

- [inline](https://gram.js.org/beta/classes/custom.Button.html#inline)
- [switchInline](https://gram.js.org/beta/classes/custom.Button.html#switchInline)
- [url](https://gram.js.org/beta/classes/custom.Button.html#url)
- [auth](https://gram.js.org/beta/classes/custom.Button.html#auth)
- [text](https://gram.js.org/beta/classes/custom.Button.html#text)
- [requestLocation](https://gram.js.org/beta/classes/custom.Button.html#requestLocation)
- [requestPhone](https://gram.js.org/beta/classes/custom.Button.html#requestPhone)
- [requestPoll](https://gram.js.org/beta/classes/custom.Button.html#requestPoll)
- [clear](https://gram.js.org/beta/classes/custom.Button.html#clear)
- [forceReply](https://gram.js.org/beta/classes/custom.Button.html#forceReply)

### Constructors

- [constructor](https://gram.js.org/beta/classes/custom.Button.html#constructor)

## Properties

### button

button: [ButtonLike](https://gram.js.org/beta/modules/custom.html#ButtonLike)

The underlying button object.

### resize

resize: undefined | boolean

Whether to resize the keyboard.

### selective

selective: undefined | boolean

Whether the keyboard is selective.

### singleUse

singleUse: undefined | boolean

Whether the keyboard is single use.

## Static Methods

### inline

- inline(text: string, data?: Buffer): [KeyboardButtonCallback](https://gram.js.org/beta/classes/Api.KeyboardButtonCallback.html)

Creates an inline button with callback data.

#### Parameters

- **text**: string - The text to display on the button
- **data**: Buffer (optional) - The callback data

#### Returns [KeyboardButtonCallback](https://gram.js.org/beta/classes/Api.KeyboardButtonCallback.html)

### switchInline

- switchInline(text: string, query?: string, samePeer?: boolean): [KeyboardButtonSwitchInline](https://gram.js.org/beta/classes/Api.KeyboardButtonSwitchInline.html)

Creates a switch inline button.

#### Parameters

- **text**: string - The text to display on the button
- **query**: string (default: "") - The inline query
- **samePeer**: boolean (default: false) - Whether to use the same peer

#### Returns [KeyboardButtonSwitchInline](https://gram.js.org/beta/classes/Api.KeyboardButtonSwitchInline.html)

### url

- url(text: string, url?: string): [KeyboardButtonUrl](https://gram.js.org/beta/classes/Api.KeyboardButtonUrl.html)

Creates a URL button.

#### Parameters

- **text**: string - The text to display on the button
- **url**: string (optional) - The URL to open

#### Returns [KeyboardButtonUrl](https://gram.js.org/beta/classes/Api.KeyboardButtonUrl.html)

### auth

- auth(text: string, url?: string, bot?: [EntityLike](https://gram.js.org/beta/modules/custom.html#EntityLike), writeAccess?: boolean, fwdText?: string): [InputKeyboardButtonUrlAuth](https://gram.js.org/beta/classes/Api.InputKeyboardButtonUrlAuth.html)

Creates an auth button.

#### Parameters

- **text**: string - The text to display on the button
- **url**: string (optional) - The URL
- **bot**: [EntityLike](https://gram.js.org/beta/modules/custom.html#EntityLike) (optional) - The bot
- **writeAccess**: boolean (optional) - Whether to request write access
- **fwdText**: string (optional) - Forward text

#### Returns [InputKeyboardButtonUrlAuth](https://gram.js.org/beta/classes/Api.InputKeyboardButtonUrlAuth.html)

### text

- text(text: string, resize?: boolean, singleUse?: boolean, selective?: boolean): [Button](https://gram.js.org/beta/classes/custom.Button.html)

Creates a text button.

#### Parameters

- **text**: string - The text to display on the button
- **resize**: boolean (optional) - Whether to resize
- **singleUse**: boolean (optional) - Whether single use
- **selective**: boolean (optional) - Whether selective

#### Returns [Button](https://gram.js.org/beta/classes/custom.Button.html)

### requestLocation

- requestLocation(text: string, resize?: boolean, singleUse?: boolean, selective?: boolean): [Button](https://gram.js.org/beta/classes/custom.Button.html)

Creates a location request button.

#### Parameters

- **text**: string - The text to display on the button
- **resize**: boolean (optional) - Whether to resize
- **singleUse**: boolean (optional) - Whether single use
- **selective**: boolean (optional) - Whether selective

#### Returns [Button](https://gram.js.org/beta/classes/custom.Button.html)

### requestPhone

- requestPhone(text: string, resize?: boolean, singleUse?: boolean, selective?: boolean): [Button](https://gram.js.org/beta/classes/custom.Button.html)

Creates a phone request button.

#### Parameters

- **text**: string - The text to display on the button
- **resize**: boolean (optional) - Whether to resize
- **singleUse**: boolean (optional) - Whether single use
- **selective**: boolean (optional) - Whether selective

#### Returns [Button](https://gram.js.org/beta/classes/custom.Button.html)

### requestPoll

- requestPoll(text: string, resize?: boolean, singleUse?: boolean, selective?: boolean): [Button](https://gram.js.org/beta/classes/custom.Button.html)

Creates a poll request button.

#### Parameters

- **text**: string - The text to display on the button
- **resize**: boolean (optional) - Whether to resize
- **singleUse**: boolean (optional) - Whether single use
- **selective**: boolean (optional) - Whether selective

#### Returns [Button](https://gram.js.org/beta/classes/custom.Button.html)

### clear

- clear(): [ReplyKeyboardHide](https://gram.js.org/beta/classes/Api.ReplyKeyboardHide.html)

Creates a clear keyboard button.

#### Returns [ReplyKeyboardHide](https://gram.js.org/beta/classes/Api.ReplyKeyboardHide.html)

### forceReply

- forceReply(): [ReplyKeyboardForceReply](https://gram.js.org/beta/classes/Api.ReplyKeyboardForceReply.html)

Creates a force reply button.

#### Returns [ReplyKeyboardForceReply](https://gram.js.org/beta/classes/Api.ReplyKeyboardForceReply.html)

## Constructors

### constructor

- new Button(button: [TypeKeyboardButton](https://gram.js.org/beta/modules/Api.html#TypeKeyboardButton), resize?: boolean, singleUse?: boolean, selective?: boolean): [Button](https://gram.js.org/beta/classes/custom.Button.html)

#### Parameters

- **button**: [TypeKeyboardButton](https://gram.js.org/beta/modules/Api.html#TypeKeyboardButton) - The keyboard button
- **resize**: boolean (optional) - Whether to resize
- **singleUse**: boolean (optional) - Whether single use
- **selective**: boolean (optional) - Whether selective

#### Returns [Button](https://gram.js.org/beta/classes/custom.Button.html)

Generated using [TypeDoc](https://typedoc.org/)
