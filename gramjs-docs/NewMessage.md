# NewMessage Class

Occurs whenever a new text message or a message with media arrives.

## Example

```ts
async function eventPrint(event: NewMessageEvent) {
const message = event.message;

  // Checks if it's a private message (from user or bot)
  if (event.isPrivate){
      // prints sender id
      console.log(message.senderId);
      // read message
      if (message.text == "hello"){
          const sender = await message.getSender();
          console.log("sender is",sender);
          await client.sendMessage(sender,{
              message:`hi your id is ${message.senderId}`
          });
      }
  }
}
// adds an event handler for new messages
client.addEventHandler(eventPrint, new NewMessage({}));
```

### Hierarchy

- [EventBuilder](https://gram.js.org/beta/classes/custom.EventBuilder.html)
  - NewMessage
    - [EditedMessage](https://gram.js.org/beta/classes/custom.EditedMessage.html)

## Index

### Properties

- [func](https://gram.js.org/beta/classes/custom.NewMessage.html#func)
- [incoming](https://gram.js.org/beta/classes/custom.NewMessage.html#incoming)
- [outgoing](https://gram.js.org/beta/classes/custom.NewMessage.html#outgoing)
- [fromUsers](https://gram.js.org/beta/classes/custom.NewMessage.html#fromUsers)
- [forwards](https://gram.js.org/beta/classes/custom.NewMessage.html#forwards)
- [pattern](https://gram.js.org/beta/classes/custom.NewMessage.html#pattern)
- [chats](https://gram.js.org/beta/classes/custom.NewMessage.html#chats)
- [blacklistChats](https://gram.js.org/beta/classes/custom.NewMessage.html#blacklistChats)
- [resolved](https://gram.js.org/beta/classes/custom.NewMessage.html#resolved)
- [client](https://gram.js.org/beta/classes/custom.NewMessage.html#client)

### Constructors

- [constructor](https://gram.js.org/beta/classes/custom.NewMessage.html#constructor)

### Methods

- [_resolve](https://gram.js.org/beta/classes/custom.NewMessage.html#_resolve)
- [build](https://gram.js.org/beta/classes/custom.NewMessage.html#build)
- [filter](https://gram.js.org/beta/classes/custom.NewMessage.html#filter)
- [addAttributes](https://gram.js.org/beta/classes/custom.NewMessage.html#addAttributes)
- [resolve](https://gram.js.org/beta/classes/custom.NewMessage.html#resolve)

## Properties

### func (Optional)

func?: ((event: [NewMessageEvent](https://gram.js.org/beta/classes/custom.NewMessageEvent.html)) => boolean)

Custom function to filter events.

### incoming (Optional)

incoming?: boolean

Whether to handle incoming messages.

### outgoing (Optional)

outgoing?: boolean

Whether to handle outgoing messages.

### fromUsers (Optional)

fromUsers?: [EntityLike](https://gram.js.org/beta/modules/custom.html#EntityLike)[]

List of users to listen for messages from.

### forwards (Optional)

forwards?: boolean

Whether to handle forwarded messages.

### pattern (Optional)

pattern?: RegExp

Regular expression pattern to match against message text.

### chats (Optional)

chats?: string[]

List of chats to listen for messages in.

### blacklistChats

blacklistChats: boolean

Whether the chats list is a blacklist.

### resolved

resolved: boolean

Whether the event has been resolved.

### client (Optional)

client?: [TelegramClient](https://gram.js.org/beta/classes/TelegramClient.html)

The Telegram client instance.

## Constructors

### constructor

- new NewMessage(newMessageParams?: [NewMessageInterface](https://gram.js.org/beta/interfaces/custom.NewMessageInterface.html)): [NewMessage](https://gram.js.org/beta/classes/custom.NewMessage.html)

#### Parameters

- **newMessageParams**: [NewMessageInterface](https://gram.js.org/beta/interfaces/custom.NewMessageInterface.html) (optional) - Configuration options for the new message event

#### Returns [NewMessage](https://gram.js.org/beta/classes/custom.NewMessage.html)

## Methods

### _resolve

- _resolve(client: [TelegramClient](https://gram.js.org/beta/classes/TelegramClient.html)): Promise<void>

Internal method to resolve the event.

#### Parameters

- **client**: [TelegramClient](https://gram.js.org/beta/classes/TelegramClient.html)

#### Returns Promise<void>

### build

- build(update: [TypeUpdates](https://gram.js.org/beta/modules/Api.html#TypeUpdates) | [TypeUpdate](https://gram.js.org/beta/modules/Api.html#TypeUpdate), callback: undefined, selfId: BigInteger): undefined | [NewMessageEvent](https://gram.js.org/beta/classes/custom.NewMessageEvent.html)

Builds a new message event from an update.

#### Parameters

- **update**: [TypeUpdates](https://gram.js.org/beta/modules/Api.html#TypeUpdates) | [TypeUpdate](https://gram.js.org/beta/modules/Api.html#TypeUpdate)
- **callback**: undefined
- **selfId**: BigInteger

#### Returns undefined | [NewMessageEvent](https://gram.js.org/beta/classes/custom.NewMessageEvent.html)

### filter

- filter(event: [NewMessageEvent](https://gram.js.org/beta/classes/custom.NewMessageEvent.html)): undefined | [EventCommon](https://gram.js.org/beta/classes/custom.EventCommon.html) | [EventCommonSender](https://gram.js.org/beta/classes/custom.EventCommonSender.html)

Filters the event based on the configured criteria.

#### Parameters

- **event**: [NewMessageEvent](https://gram.js.org/beta/classes/custom.NewMessageEvent.html)

#### Returns undefined | [EventCommon](https://gram.js.org/beta/classes/custom.EventCommon.html) | [EventCommonSender](https://gram.js.org/beta/classes/custom.EventCommonSender.html)

### addAttributes

- addAttributes(update: any): void

Adds attributes to the update.

#### Parameters

- **update**: any

#### Returns void

### resolve

- resolve(client: [TelegramClient](https://gram.js.org/beta/classes/TelegramClient.html)): Promise<void>

Resolves the event with the client.

#### Parameters

- **client**: [TelegramClient](https://gram.js.org/beta/classes/TelegramClient.html)

#### Returns Promise<void>

Generated using [TypeDoc](https://typedoc.org/)
