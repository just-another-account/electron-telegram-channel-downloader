# GramJS Documentation

这是从 [gram.js.org](https://gram.js.org) 网站抓取并保存为Markdown格式的GramJS文档集合。

## 文档目录

### 主要文档

- [index.md](./index.md) - GramJS主页介绍和快速开始指南
- [authentication.md](./authentication.md) - 认证和登录指南
- [FAQ.md](./FAQ.md) - 常见问题解答

### 核心类文档

- [TelegramClient.md](./TelegramClient.md) - TelegramClient类的完整API文档
- [StringSession.md](./StringSession.md) - StringSession类文档
- [NewMessage.md](./NewMessage.md) - NewMessage事件类文档
- [Button.md](./Button.md) - Button类文档，用于创建各种类型的按钮

### 模块文档

- [sessions.md](./sessions.md) - Sessions模块概览

## 关于GramJS

GramJS是一个用JavaScript编写的Telegram客户端，适用于Node.js和浏览器，其核心基于[Telethon](https://github.com/LonamiWebs/Telethon)。

### 快速开始

```bash
npm i telegram
```

```javascript
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";

const apiId = 123456;
const apiHash = "123456abcdfg";
const stringSession = new StringSession("");

(async () => {
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });
  await client.start({
    phoneNumber: async () => await input.text("Please enter your number: "),
    password: async () => await input.text("Please enter your password: "),
    phoneCode: async () => await input.text("Please enter the code you received: "),
    onError: (err) => console.log(err),
  });
  console.log("You should now be connected.");
  await client.sendMessage("me", { message: "Hello!" });
})();
```

## 原始文档

如需最新的文档，请访问：
- [官方网站](https://gram.js.org/)
- [Beta文档](https://gram.js.org/beta/)
- [GitHub仓库](https://github.com/gram-js/gramjs)

## 抓取信息

- 抓取时间：2025年6月18日
- 抓取工具：Firecrawl MCP
- 总共抓取页面：已抓取主要类、模块和指南文档

## 注意事项

这些文档是从官方网站抓取的静态版本，可能不包含最新的更新。建议定期检查官方网站获取最新信息。
