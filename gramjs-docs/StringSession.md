# StringSession Class

This session file can be easily saved and loaded as a string. According to the initial design, it contains only the data that is necessary for successful connection and authentication, so takeout ID is not stored.

It is thought to be used where you don't want to create any on-disk files but would still like to be able to save and load existing sessions by other means.

You can use custom `encode` and `decode` functions, if present:

`encode` definition must be `function encode(value: Buffer) -> string:`.
`decode` definition must be `function decode(value: string) -> Buffer:`.

### Hierarchy

- [MemorySession](https://gram.js.org/beta/classes/sessions.MemorySession.html)
  - StringSession

## Index

### Properties

- [_serverAddress](https://gram.js.org/beta/classes/sessions.StringSession.html#_serverAddress)
- [_dcId](https://gram.js.org/beta/classes/sessions.StringSession.html#_dcId)
- [_port](https://gram.js.org/beta/classes/sessions.StringSession.html#_port)
- [_takeoutId](https://gram.js.org/beta/classes/sessions.StringSession.html#_takeoutId)
- [_entities](https://gram.js.org/beta/classes/sessions.StringSession.html#_entities)
- [_updateStates](https://gram.js.org/beta/classes/sessions.StringSession.html#_updateStates)
- [_authKey](https://gram.js.org/beta/classes/sessions.StringSession.html#_authKey)
- [_key](https://gram.js.org/beta/classes/sessions.StringSession.html#_key)

### Methods

- [setDC](https://gram.js.org/beta/classes/sessions.StringSession.html#setDC)
- [getAuthKey](https://gram.js.org/beta/classes/sessions.StringSession.html#getAuthKey)
- [setAuthKey](https://gram.js.org/beta/classes/sessions.StringSession.html#setAuthKey)
- [close](https://gram.js.org/beta/classes/sessions.StringSession.html#close)
- [delete](https://gram.js.org/beta/classes/sessions.StringSession.html#delete)
- [processEntities](https://gram.js.org/beta/classes/sessions.StringSession.html#processEntities)
- [getEntityRowsByPhone](https://gram.js.org/beta/classes/sessions.StringSession.html#getEntityRowsByPhone)
- [getEntityRowsByUsername](https://gram.js.org/beta/classes/sessions.StringSession.html#getEntityRowsByUsername)
- [getEntityRowsByName](https://gram.js.org/beta/classes/sessions.StringSession.html#getEntityRowsByName)
- [getEntityRowsById](https://gram.js.org/beta/classes/sessions.StringSession.html#getEntityRowsById)
- [getInputEntity](https://gram.js.org/beta/classes/sessions.StringSession.html#getInputEntity)
- [encode](https://gram.js.org/beta/classes/sessions.StringSession.html#encode)
- [decode](https://gram.js.org/beta/classes/sessions.StringSession.html#decode)
- [load](https://gram.js.org/beta/classes/sessions.StringSession.html#load)
- [save](https://gram.js.org/beta/classes/sessions.StringSession.html#save)

### Accessors

- [dcId](https://gram.js.org/beta/classes/sessions.StringSession.html#dcId)
- [serverAddress](https://gram.js.org/beta/classes/sessions.StringSession.html#serverAddress)
- [port](https://gram.js.org/beta/classes/sessions.StringSession.html#port)
- [authKey](https://gram.js.org/beta/classes/sessions.StringSession.html#authKey)
- [takeoutId](https://gram.js.org/beta/classes/sessions.StringSession.html#takeoutId)

### Constructors

- [constructor](https://gram.js.org/beta/classes/sessions.StringSession.html#constructor)

## Constructors

### constructor

- new StringSession(session?: string): [StringSession](https://gram.js.org/beta/classes/sessions.StringSession.html)

#### Parameters

- **session**: string (optional) - The session string to load from

#### Returns [StringSession](https://gram.js.org/beta/classes/sessions.StringSession.html)

## Methods

### setDC

- setDC(dcId: number, serverAddress: string, port: number): void

Sets the information of the data center address and port that the library should connect to, as well as the data center ID, which is currently unused.

#### Parameters

- **dcId**: number
- **serverAddress**: string
- **port**: number

#### Returns void

### getAuthKey

- getAuthKey(dcId?: number): undefined | [AuthKey](https://gram.js.org/beta/classes/custom.AuthKey.html)

Gets auth key for a dc

#### Parameters

- **dcId**: number (optional)

#### Returns undefined | [AuthKey](https://gram.js.org/beta/classes/custom.AuthKey.html)

### setAuthKey

- setAuthKey(authKey?: [AuthKey](https://gram.js.org/beta/classes/custom.AuthKey.html), dcId?: number): undefined

Sets auth key for a dc

#### Parameters

- **authKey**: [AuthKey](https://gram.js.org/beta/classes/custom.AuthKey.html) (optional)
- **dcId**: number (optional)

#### Returns undefined

### close

- close(): void

Called on client disconnection. Should be used to free any used resources. Can be left empty if none.

#### Returns void

### delete

- delete(): void

Called upon client.log_out(). Should delete the stored information from disk since it's not valid anymore.

#### Returns void

### processEntities

- processEntities(tlo: any): void

Processes the input `TLObject` or `list` and saves whatever information is relevant (e.g., ID or access hash).

#### Parameters

- **tlo**: any

#### Returns void

### getInputEntity

- getInputEntity(key: [EntityLike](https://gram.js.org/beta/modules/custom.html#EntityLike)): [TypeInputPeer](https://gram.js.org/beta/modules/Api.html#TypeInputPeer)

Turns the given key into an `InputPeer` (e.g. `InputPeerUser`). The library uses this method whenever an `InputPeer` is needed to suit several purposes (e.g. user only provided its ID or wishes to use a cached username to avoid extra RPC).

#### Parameters

- **key**: [EntityLike](https://gram.js.org/beta/modules/custom.html#EntityLike)

#### Returns [TypeInputPeer](https://gram.js.org/beta/modules/Api.html#TypeInputPeer)

### Static encode

- encode(x: Buffer): string

#### Parameters

- **x**: Buffer

#### Returns string

### Static decode

- decode(x: string): Buffer

#### Parameters

- **x**: string

#### Returns Buffer

### load

- load(): Promise<void>

Called before using the session

#### Returns Promise<void>

### save

- save(): string

Called whenever important properties change. It should make persist the relevant session information to disk.

#### Returns string

## Accessors

### dcId

- get dcId(): number

#### Returns number

### serverAddress

- get serverAddress(): string

#### Returns string

### port

- get port(): number

#### Returns number

### authKey

- get authKey(): undefined | [AuthKey](https://gram.js.org/beta/classes/custom.AuthKey.html)
- set authKey(value: undefined | [AuthKey](https://gram.js.org/beta/classes/custom.AuthKey.html)): void

#### Returns undefined | [AuthKey](https://gram.js.org/beta/classes/custom.AuthKey.html)

### takeoutId

- get takeoutId(): undefined
- set takeoutId(value: undefined): void

#### Returns undefined

Generated using [TypeDoc](https://typedoc.org/)
