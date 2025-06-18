The TelegramClient uses several methods in different files to provide all the common functionality in a nice interface.

**In short, to create a client you must do:**

```ts
import {TelegramClient} from "telegram";

const client = new TelegramClient(new StringSession(''),apiId,apiHash,{});

```

You don't need to import any methods that are inside the TelegramClient class as they binding in it.

### Hierarchy

- [TelegramBaseClient](https://gram.js.org/beta/classes/client.telegramBaseClient.TelegramBaseClient.html)
  - TelegramClient

## Index

### Constructors

- [constructor](https://gram.js.org/beta/classes/TelegramClient.html#constructor)

### Methods

- [start](https://gram.js.org/beta/classes/TelegramClient.html#start)
- [checkAuthorization](https://gram.js.org/beta/classes/TelegramClient.html#checkAuthorization)
- [signInUser](https://gram.js.org/beta/classes/TelegramClient.html#signInUser)
- [signInUserWithQrCode](https://gram.js.org/beta/classes/TelegramClient.html#signInUserWithQrCode)
- [sendCode](https://gram.js.org/beta/classes/TelegramClient.html#sendCode)
- [signInWithPassword](https://gram.js.org/beta/classes/TelegramClient.html#signInWithPassword)
- [signInBot](https://gram.js.org/beta/classes/TelegramClient.html#signInBot)
- [updateTwoFaSettings](https://gram.js.org/beta/classes/TelegramClient.html#updateTwoFaSettings)
- [inlineQuery](https://gram.js.org/beta/classes/TelegramClient.html#inlineQuery)
- [buildReplyMarkup](https://gram.js.org/beta/classes/TelegramClient.html#buildReplyMarkup)
- [downloadFile](https://gram.js.org/beta/classes/TelegramClient.html#downloadFile)
- [iterDownload](https://gram.js.org/beta/classes/TelegramClient.html#iterDownload)
- [downloadProfilePhoto](https://gram.js.org/beta/classes/TelegramClient.html#downloadProfilePhoto)
- [downloadMedia](https://gram.js.org/beta/classes/TelegramClient.html#downloadMedia)
- [setParseMode](https://gram.js.org/beta/classes/TelegramClient.html#setParseMode)
- [iterMessages](https://gram.js.org/beta/classes/TelegramClient.html#iterMessages)
- [getMessages](https://gram.js.org/beta/classes/TelegramClient.html#getMessages)
- [sendMessage](https://gram.js.org/beta/classes/TelegramClient.html#sendMessage)
- [forwardMessages](https://gram.js.org/beta/classes/TelegramClient.html#forwardMessages)
- [editMessage](https://gram.js.org/beta/classes/TelegramClient.html#editMessage)
- [deleteMessages](https://gram.js.org/beta/classes/TelegramClient.html#deleteMessages)
- [pinMessage](https://gram.js.org/beta/classes/TelegramClient.html#pinMessage)
- [unpinMessage](https://gram.js.org/beta/classes/TelegramClient.html#unpinMessage)
- [markAsRead](https://gram.js.org/beta/classes/TelegramClient.html#markAsRead)
- [iterDialogs](https://gram.js.org/beta/classes/TelegramClient.html#iterDialogs)
- [getDialogs](https://gram.js.org/beta/classes/TelegramClient.html#getDialogs)
- [iterParticipants](https://gram.js.org/beta/classes/TelegramClient.html#iterParticipants)
- [getParticipants](https://gram.js.org/beta/classes/TelegramClient.html#getParticipants)
- [on](https://gram.js.org/beta/classes/TelegramClient.html#on)
- [addEventHandler](https://gram.js.org/beta/classes/TelegramClient.html#addEventHandler)
- [removeEventHandler](https://gram.js.org/beta/classes/TelegramClient.html#removeEventHandler)
- [listEventHandlers](https://gram.js.org/beta/classes/TelegramClient.html#listEventHandlers)
- [uploadFile](https://gram.js.org/beta/classes/TelegramClient.html#uploadFile)
- [sendFile](https://gram.js.org/beta/classes/TelegramClient.html#sendFile)
- [invoke](https://gram.js.org/beta/classes/TelegramClient.html#invoke)
- [invokeWithSender](https://gram.js.org/beta/classes/TelegramClient.html#invokeWithSender)
- [getMe](https://gram.js.org/beta/classes/TelegramClient.html#getMe)
- [isBot](https://gram.js.org/beta/classes/TelegramClient.html#isBot)
- [isUserAuthorized](https://gram.js.org/beta/classes/TelegramClient.html#isUserAuthorized)
- [getEntity](https://gram.js.org/beta/classes/TelegramClient.html#getEntity)
- [getInputEntity](https://gram.js.org/beta/classes/TelegramClient.html#getInputEntity)
- [getPeerId](https://gram.js.org/beta/classes/TelegramClient.html#getPeerId)
- [connect](https://gram.js.org/beta/classes/TelegramClient.html#connect)
- [getDC](https://gram.js.org/beta/classes/TelegramClient.html#getDC)
- [_initSession](https://gram.js.org/beta/classes/TelegramClient.html#_initSession)
- [disconnect](https://gram.js.org/beta/classes/TelegramClient.html#disconnect)
- [_disconnect](https://gram.js.org/beta/classes/TelegramClient.html#_disconnect)
- [destroy](https://gram.js.org/beta/classes/TelegramClient.html#destroy)
- [setLogLevel](https://gram.js.org/beta/classes/TelegramClient.html#setLogLevel)

### Accessors

- [parseMode](https://gram.js.org/beta/classes/TelegramClient.html#parseMode)
- [events](https://gram.js.org/beta/classes/TelegramClient.html#events)
- [floodSleepThreshold](https://gram.js.org/beta/classes/TelegramClient.html#floodSleepThreshold)
- [maxConcurrentDownloads](https://gram.js.org/beta/classes/TelegramClient.html#maxConcurrentDownloads)
- [connected](https://gram.js.org/beta/classes/TelegramClient.html#connected)
- [disconnected](https://gram.js.org/beta/classes/TelegramClient.html#disconnected)
- [logger](https://gram.js.org/beta/classes/TelegramClient.html#logger)

### Properties

- [__version__](https://gram.js.org/beta/classes/TelegramClient.html#__version__)
- [session](https://gram.js.org/beta/classes/TelegramClient.html#session)
- [apiHash](https://gram.js.org/beta/classes/TelegramClient.html#apiHash)
- [apiId](https://gram.js.org/beta/classes/TelegramClient.html#apiId)
- [_connectedDeferred](https://gram.js.org/beta/classes/TelegramClient.html#_connectedDeferred)

## Constructors

### constructor

- new TelegramClient(session: string | [Session](https://gram.js.org/beta/classes/sessions.Session.html), apiId: number, apiHash: string, clientParams: [TelegramClientParams](https://gram.js.org/beta/interfaces/client.telegramBaseClient.TelegramClientParams.html)): [TelegramClient](https://gram.js.org/beta/classes/TelegramClient.html)

#### Parameters

- **session**: string | [Session](https://gram.js.org/beta/classes/sessions.Session.html) - a session to be used to save the connection and auth key to. This can be a custom session that inherits MemorySession.
- **apiId**: number - The API ID you obtained from [https://my.telegram.org](https://my.telegram.org/).
- **apiHash**: string - The API hash you obtained from [https://my.telegram.org](https://my.telegram.org/).
- **clientParams**: [TelegramClientParams](https://gram.js.org/beta/interfaces/client.telegramBaseClient.TelegramClientParams.html) - see [TelegramClientParams](https://gram.js.org/beta/interfaces/client.telegramBaseClient.TelegramClientParams.html)

#### Returns [TelegramClient](https://gram.js.org/beta/classes/TelegramClient.html)

## Methods

### start

- start(authParams: [UserAuthParams](https://gram.js.org/beta/interfaces/client.auth.UserAuthParams.html) | [BotAuthParams](https://gram.js.org/beta/interfaces/client.auth.BotAuthParams.html)): Promise<void>

Used to handle all aspects of connecting to telegram.

This method will connect to the telegram servers and check if the user is already logged in.

in the case of a new connection this will sign in if the phone already exists or sign up otherwise

By using this method you are **agreeing to Telegram's Terms of Service** [https://core.telegram.org/api/terms](https://core.telegram.org/api/terms).

this method also calls [getMe](https://gram.js.org/beta/classes/TelegramClient.html#getMe) to tell telegram that we want to receive updates.

**Example:**

```ts
// this example assumes you've installed and imported the input package. npm i input.
// This package uses CLI to receive input from the user. you can use your own callback function.
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";

const client = new TelegramClient(new StringSession(''), apiId, apiHash, {});
// logging in as a bot account
await client.start(botToken="123456:abcdfgh123456789);
// logging in as a user account
await client.start({
    phoneNumber: async () => await input.text("number ?"),
    password: async () => await input.text("password?"),
    phoneCode: async () => await input.text("Code ?"),
    onError: (err) => console.log(err),
});
```

#### Parameters

- **authParams**: [UserAuthParams](https://gram.js.org/beta/interfaces/client.auth.UserAuthParams.html) | [BotAuthParams](https://gram.js.org/beta/interfaces/client.auth.BotAuthParams.html) - see UserAuthParams and BotAuthParams

#### Returns Promise<void>

### checkAuthorization

- checkAuthorization(): Promise<boolean>

Checks whether the current client is authorized or not. (logged in as a user)

**Example:**

```ts
await client.connect();
if (await client.checkAuthorization()){
      console.log("I am logged in!");
}else{
      console.log("I am connected to telegram servers but not logged in with any account/bot");
}
```

#### Returns Promise<boolean>

boolean (true of authorized else false)

### sendMessage

- sendMessage(entity: [EntityLike](https://gram.js.org/beta/modules/custom.html#EntityLike), sendMessageParams?: [SendMessageParams](https://gram.js.org/beta/interfaces/client.message.SendMessageParams.html)): Promise< [Message](https://gram.js.org/beta/classes/Api.Message.html) >

Sends a message to the specified user, chat or channel.

The default parse mode is the same as the official applications (a custom flavour of markdown). **bold**, `code` or **italic** are available.

In addition you can send [links](https://example.com/) and [mentions](https://gram.js.org/beta/classes/@username) (or using IDs like in the Bot API: [mention](tg://user?id=123456789)) and pre blocks with three backticks.

Sending a /start command with a parameter (like ?start=data) is also done through this method. Simply send '/start data' to the bot.

See also Message.respond() and Message.reply().

**Example:**

```ts
// Markdown is the default.
await client.sendMessage("me",{message:"Hello **world!**});

// Defaults to another parse mode.
client.setParseMode("HTML");

await client.sendMessage('me', {message:'Some <b>bold</b> and <i>italic</i> text'})
await client.sendMessage('me', {message:'An <a href="https://example.com">URL</a>'})
await client.sendMessage('me', {message:'<a href="tg://user?id=me">Mentions</a>'})

// Explicit parse mode.
//  No parse mode by default
client.setParseMode(undefined);
//...but here I want markdown
await client.sendMessage('me', {message:'Hello, **world**!', {parseMode:"md"}})

// ...and here I need HTML
await client.sendMessage('me', {message:'Hello, <i>world</i>!', {parseMode='html'}})

// Scheduling a message to be sent after 5 minutes
await client.sendMessage(chat, {message:'Hi, future!', schedule:(60 * 5) + (Date.now() / 1000)})
```

#### Parameters

- **entity**: [EntityLike](https://gram.js.org/beta/modules/custom.html#EntityLike) - Who to sent the message to.
- **sendMessageParams**: [SendMessageParams](https://gram.js.org/beta/interfaces/client.message.SendMessageParams.html) - see [SendMessageParams](https://gram.js.org/beta/interfaces/client.message.SendMessageParams.html)

#### Returns Promise< [Message](https://gram.js.org/beta/classes/Api.Message.html) >

The sent custom Message.

### getMessages

- getMessages(entity: undefined | [EntityLike](https://gram.js.org/beta/modules/custom.html#EntityLike), getMessagesParams?: Partial< [IterMessagesParams](https://gram.js.org/beta/interfaces/client.message.IterMessagesParams.html) >): Promise< [TotalList](https://gram.js.org/beta/classes/helpers.TotalList.html) < [Message](https://gram.js.org/beta/classes/Api.Message.html) >>

Same as iterMessages() but returns a TotalList instead.

if the `limit` is not set, it will be 1 by default unless both `minId` **and** `maxId` are set. in which case the entire range will be returned.

**Example:**

```ts
// The totalList has a .total attribute which will show the complete number of messages even if none are fetched.
// Get 0 photos and print the total to show how many photos there are
import { Api } from "telegram";
const photos = await client.getMessages(chat, {limit: 0, filter:Api.InputMessagesFilterPhotos})
console.log(photos.total)

// Get all the photos
const photos = await client.getMessages(chat, {limit: undefined, filter:Api.InputMessagesFilterPhotos})

// Get messages by ID:
const messages = await client.getMessages(chat, {ids:1337})
const message_1337 = messages[0];
```

#### Parameters

- **entity**: undefined | [EntityLike](https://gram.js.org/beta/modules/custom.html#EntityLike) - The entity from whom to retrieve the message history. see [iterMessages](https://gram.js.org/beta/classes/TelegramClient.html#iterMessages).
- **getMessagesParams**: Partial< [IterMessagesParams](https://gram.js.org/beta/interfaces/client.message.IterMessagesParams.html) > - see [IterMessagesParams](https://gram.js.org/beta/interfaces/client.message.IterMessagesParams.html).

#### Returns Promise< [TotalList](https://gram.js.org/beta/classes/helpers.TotalList.html) < [Message](https://gram.js.org/beta/classes/Api.Message.html) >>

[TotalList](https://gram.js.org/beta/classes/helpers.TotalList.html) of messages.

### downloadMedia

- downloadMedia(messageOrMedia: [Message](https://gram.js.org/beta/classes/Api.Message.html) | [TypeMessageMedia](https://gram.js.org/beta/modules/Api.html#TypeMessageMedia), downloadParams?: [DownloadMediaInterface](https://gram.js.org/beta/interfaces/client.downloads.DownloadMediaInterface.html)): Promise<undefined | string | Buffer>

Downloads the given media from a message or a media object.

this will return an empty Buffer in case of wrong or empty media.

**Example:**

```ts
const buffer = await client.downloadMedia(message, {})
// to save it to a file later on using fs.
import { promises as fs } from 'fs';
await fs.writeFile("file",buffer);
// to use a progress callback you can pass it like so.
const buffer = await client.downloadMedia(message, {
      progressCallback : console.log
})
```

#### Parameters

- **messageOrMedia**: [Message](https://gram.js.org/beta/classes/Api.Message.html) | [TypeMessageMedia](https://gram.js.org/beta/modules/Api.html#TypeMessageMedia) - instance of a message or a media.
- **downloadParams**: [DownloadMediaInterface](https://gram.js.org/beta/interfaces/client.downloads.DownloadMediaInterface.html) - [DownloadMediaInterface](https://gram.js.org/beta/interfaces/client.downloads.DownloadMediaInterface.html)

#### Returns Promise<undefined | string | Buffer>

a buffer containing the downloaded data if outputFile is undefined else nothing.

### invoke

- invoke<R>(request: R, dcId?: number): Promise<R["__response"]>

invokes raw Telegram requests.

This is a low level method that can be used to call manually any Telegram API method.

Generally this should only be used when there isn't a friendly method that does what you need.

All available requests and types are found under the `Api.` namespace.

**Example:**

```ts
const result = await client.invoke(new Api.account.CheckUsername({
       username: 'some string here'
    }));
console.log("does this username exist?",result);
```

#### Type Parameters

- **R extends [AnyRequest](https://gram.js.org/beta/modules/Api.html#AnyRequest)**

#### Parameters

- **request**: R - The request to send. this should be of type request.
- **dcId**: number - Optional dc id to use when sending.

#### Returns Promise<R["__response"]>

The response from Telegram.

## Accessors

### parseMode

- get parseMode(): undefined | [ParseInterface](https://gram.js.org/beta/interfaces/client.messageParse.ParseInterface.html)

This property is the default parse mode used when sending messages. Defaults to {@link MarkdownParser}.

It will always be either undefined or an object with parse and unparse methods.

When setting a different value it should be one of:

- Object with parse and unparse methods.
- A str indicating the parse_mode. For Markdown 'md' or 'markdown' may be used. For HTML, 'html' may be used.

**Example:**

```ts
// gets the current parse mode.
console.log("parse mode is :",  client.parseMode)
```

#### Returns undefined | [ParseInterface](https://gram.js.org/beta/interfaces/client.messageParse.ParseInterface.html)

## Properties

### __version__

__version__:string = version

The current gramJS version.

### session

session: [Session](https://gram.js.org/beta/classes/sessions.Session.html)

### apiHash

apiHash:string

### apiId

apiId:number

Generated using [TypeDoc](https://typedoc.org/)
