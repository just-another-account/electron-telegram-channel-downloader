# FAQ

> Frequently asked questions

## Table of Contents

- [How do I stop logging?](#how-do-i-stop-logging)
- [Can I use a proxy?](#can-i-use-a-proxy)

## How do I stop logging?

Logging is enabled by default to the most verbose option. To remove it you can do the following:

```js
client.setLogLevel("none"); // no logging
client.setLogLevel("error"); // only errors
client.setLogLevel("warn"); // warnings too
client.setLogLevel("info"); // info too
client.setLogLevel("debug"); // everything
```

## Can I use a proxy?

Yes you can, but only on Node!

Currently only socks5, 4 and MTProto proxies are supported. HTTP proxies are not supported as they required a completely different connection type.
