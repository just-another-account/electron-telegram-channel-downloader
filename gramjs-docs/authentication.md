# Authentication

Signing in

## Table of Contents

- [Getting API ID and API HASH](#getting-api-id-and-api-hash)
- [Logging in as a Bot](#logging-in-as-a-bot)
- [Logging in as a User](#logging-in-as-a-user)
- [Using MTProxies and Socks5 Proxies](#using-mtproxies-and-socks5-proxies)
- [Persistent Session](#persistent-session)
- [String Session](#string-session)
- [Store Session](#store-session)

## Getting API ID and API HASH

Before working with Telegram's API, you need to get your own API ID and hash:

1. [Login to your Telegram account](https://my.telegram.org/) with the phone number of the developer account to use.
2. Click under API Development tools.
3. A _Create new application_ window will appear. Fill in your application details. There is no need to enter any _URL_, and only the first two fields ( _App title_ and _Short name_) can currently be changed later.
4. Click on _Create application_ at the end. Remember that your **API hash is secret** and Telegram won't let you revoke it. Don't post it anywhere!

## Logging in as a Bot

Using GramJS you can use a bot token to log in. Doing this is simple

**JavaScript:**
```js
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");

const stringSession = ""; // leave this empty for now
const BOT_TOKEN = ""; // put your bot token here

(async () => {
  const client = new TelegramClient(
    new StringSession(stringSession),
    apiId,
    apiHash,
    { connectionRetries: 5 }
  );
  await client.start({
    botAuthToken: BOT_TOKEN,
  });
  console.log(client.session.save());
})();
```

**TypeScript:**
```ts
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";

const stringSession = ""; // leave this empty for now
const BOT_TOKEN = ""; // put your bot token here

(async () => {
  const client = new TelegramClient(
    new StringSession(stringSession),
    apiId,
    apiHash,
    { connectionRetries: 5 }
  );
  await client.start({
    botAuthToken: BOT_TOKEN,
  });
  console.log(client.session.save());
})();
```

Underneath this is just calling the RAW function `ImportBotAuthorization`. you can leave the string session empty for now.

## Logging in as a User

Logging in as a user is a bit more complex because you'll need to provide callbacks for when you receive the code from telegram. you can use the [input](https://www.npmjs.com/package/input) package to manage that on Node or [prompt](https://developer.mozilla.org/en-US/docs/Web/API/Window/prompt) on the browser

**JavaScript:**
```js
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input"); // npm i input

const apiId = 123456;
const apiHash = "123456abcdfg";
const stringSession = new StringSession(""); // fill this later with the value from session.save()

(async () => {
  console.log("Loading interactive example...");
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });
  await client.start({
    phoneNumber: async () => await input.text("number ?"),
    password: async () => await input.text("password?"),
    phoneCode: async () => await input.text("Code ?"),
    onError: (err) => console.log(err),
  });
  console.log("You should now be connected.");
  console.log(client.session.save()); // Save this string to avoid logging in again
  await client.sendMessage("me", { message: "Hello!" });
})();
```

**TypeScript:**
```ts
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import input from "input"; // npm i input

const apiId = 123456;
const apiHash = "123456abcdfg";
const stringSession = new StringSession(""); // fill this later with the value from session.save()

(async () => {
  console.log("Loading interactive example...");
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });
  await client.start({
    phoneNumber: async () => await input.text("number ?"),
    password: async () => await input.text("password?"),
    phoneCode: async () => await input.text("Code ?"),
    onError: (err) => console.log(err),
  });
  console.log("You should now be connected.");
  console.log(client.session.save()); // Save this string to avoid logging in again
  await client.sendMessage("me", { message: "Hello!" });
})();
```

## Using MTProxies and Socks5 Proxies

You can also use MTProxies or a normal Socks proxy to connect to telegram servers.

**JavaScript:**
```js
const { TelegramClient } = require("telegram");

const apiId = 123456;
const apiHash = "123456abcdfg";

(async () => {
  console.log("Loading interactive example...");
  const client = new TelegramClient("session_name", apiId, apiHash, {
    useWSS: false, // Important. Most proxies cannot use SSL.
    proxy: {
      ip: "123.123.123.123", // Proxy host (IP or hostname)
      port: 123, // Proxy port
      MTProxy: false, // Whether it's an MTProxy or a normal Socks one
      secret: "00000000000000000000000000000000", // If used MTProxy then you need to provide a secret (or zeros).
      socksType: 5, // If used Socks you can choose 4 or 5.
      timeout: 2, // Timeout (in seconds) for connection,
    },
  });
  await client.connect();
  console.log("You should now be connected.");
})();
```

**TypeScript:**
```ts
import { TelegramClient } from "telegram";

const apiId = 123456;
const apiHash = "123456abcdfg";

(async () => {
  console.log("Loading interactive example...");
  const client = new TelegramClient("session_name", apiId, apiHash, {
    useWSS: false, // Important. Most proxies cannot use SSL.
    proxy: {
      ip: "123.123.123.123", // Proxy host (IP or hostname)
      port: 123, // Proxy port
      MTProxy: false, // Whether it's an MTProxy or a normal Socks one
      secret: "00000000000000000000000000000000", // If used MTProxy then you need to provide a secret (or zeros).
      socksType: 5, // If used Socks you can choose 4 or 5.
      timeout: 2, // Timeout (in seconds) for connection,
    },
  });
  await client.connect();
  console.log("You should now be connected.");
})();
```

## Persistent Session

To avoid having to logging each time you'll need to save the session after logging in. There are multiple types of sessions with the easiest being `StringSession` that will provide an Authorization string for you to use again. You can create your own Session by subclassing the `MemorySession` class.

If you have async logic in your custom session put it in the `load()` function that's called before loading a session.

## String Session

You can import it from `telegram/session`

**JavaScript:**
```js
const { StringSession } = require("telegram/sessions");
```

**TypeScript:**
```ts
import { StringSession } from "telegram/sessions";
```

If you're using it for the first login you need to provide an empty String to the constructor

```js
const stringSession = new StringSession("");
```

After logging in you'll need to call the `.save()` method to receive the string

You can either do that by calling it directly on the `stringSession` variable or by using `client.session`

```js
console.log(client.session.save());
console.log(stringSession.save());
```

## Store Session

Store session uses [store2](https://www.npmjs.com/package/store2) with the help of [node-localstorage](https://www.npmjs.com/search?q=node-localstorage) to save the session automatically in files. it's useful to save entities so you can access them later with just their ID and lowers the amount of requests needed to the telegram server. You just need to provide a session name to save it with

**JavaScript:**
```js
const { StringSession } = require("telegram/sessions");
const storeSession = new StoreSession("my_session");
const client = new TelegramClient(storeSession, apiId, apiHash, {
  connectionRetries: 5,
});
```

**TypeScript:**
```ts
import { StringSession } from "telegram/sessions";
const storeSession = new StoreSession("my_session");
const client = new TelegramClient(storeSession, apiId, apiHash, {
  connectionRetries: 5,
});
```

This session is still in Alpha and not tested that much so it might break. use carefully.
