# Api Module

## 索引

### Type Aliases (类型别名)

- [AnyLiteral](#anyliteral)
- [Reader](#reader)
- [Client](#client)
- [Utils](#utils)
- [X](#x)
- [Type](#type)
- [Bool](#bool)
- [int](#int)
- [double](#double)
- [float](#float)
- [int128](#int128)
- [int256](#int256)
- [long](#long)
- [bytes](#bytes)
- [TypeEntityLike](#typeentitylike)
- [TypeInputPeer](#typeinputpeer)
- [TypeInputUser](#typeinputuser)
- [TypeInputContact](#typeinputcontact)
- [TypeInputFile](#typeinputfile)
- [TypeInputMedia](#typeinputmedia)
- [TypeInputChatPhoto](#typeinputchatphoto)
- [TypeInputGeoPoint](#typeinputgeopoint)
- [TypeInputPhoto](#typeinputphoto)
- [TypeInputFileLocation](#typeinputfilelocation)
- [TypePeer](#typepeer)
- [TypeUser](#typeuser)
- [TypeUserProfilePhoto](#typeuserprofilephoto)
- [TypeUserStatus](#typeuserstatus)
- [TypeChat](#typechat)
- [TypeChatFull](#typechatfull)
- [TypeChatParticipant](#typechatparticipant)
- [TypeChatParticipants](#typechatparticipants)
- [TypeChatPhoto](#typechatphoto)
- [TypeMessage](#typemessage)
- [TypeMessageMedia](#typemessagemedia)
- [TypeMessageAction](#typemessageaction)
- [TypeDialog](#typedialog)
- [TypePhoto](#typephoto)
- [TypePhotoSize](#typephotosize)
- [TypeGeoPoint](#typegeopoint)
- [TypeInputNotifyPeer](#typeinputnotifypeer)
- [TypeInputPeerNotifySettings](#typeinputpeernotifysettings)
- [TypePeerNotifySettings](#typepeernotifysettings)
- [TypePeerSettings](#typepeersettings)
- [TypeWallPaper](#typewallpaper)
- [TypeReportReason](#typereportreason)
- [TypeUserFull](#typeuserfull)
- [TypeContact](#typecontact)
- [TypeImportedContact](#typeimportedcontact)
- [TypeContactStatus](#typecontactstatus)
- [TypeMessagesFilter](#typemessagesfilter)
- [TypeUpdate](#typeupdate)
- [TypeUpdates](#typeupdates)
- [TypeDcOption](#typedcoption)
- [TypeConfig](#typeconfig)
- [TypeNearestDc](#typenearestdc)
- [TypeEncryptedChat](#typeencryptedchat)
- [TypeInputEncryptedChat](#typeinputencryptedchat)
- [TypeEncryptedFile](#typeencryptedfile)
- [TypeInputEncryptedFile](#typeinputencryptedfile)
- [TypeEncryptedMessage](#typeencryptedmessage)
- [TypeInputDocument](#typeinputdocument)
- [TypeDocument](#typedocument)
- [TypeNotifyPeer](#typenotifypeer)
- [TypeSendMessageAction](#typesendmessageaction)
- [TypeInputPrivacyKey](#typeinputprivacykey)
- [TypePrivacyKey](#typeprivacykey)
- [TypeInputPrivacyRule](#typeinputprivacyrule)
- [TypePrivacyRule](#typeprivacyrule)
- [TypeAccountDaysTTL](#typeaccountdaysttl)
- [TypeDocumentAttribute](#typedocumentattribute)
- [TypeStickerPack](#typestickerpack)
- [TypeWebPage](#typewebpage)
- [TypeAuthorization](#typeauthorization)
- [TypeReceivedNotifyMessage](#typereceivednotifymessage)
- [TypeExportedChatInvite](#typeexportedchatinvite)
- [TypeChatInvite](#typechatinvite)
- [TypeInputStickerSet](#typeinputstickerset)
- [TypeStickerSet](#typestickerset)
- [TypeBotCommand](#typebotcommand)
- [TypeBotInfo](#typebotinfo)
- [TypeKeyboardButton](#typekeyboardbutton)
- [TypeKeyboardButtonRow](#typekeyboardbuttonrow)
- [TypeReplyMarkup](#typereplymarkup)
- [TypeMessageEntity](#typemessageentity)
- [TypeInputChannel](#typeinputchannel)
- [TypeMessageRange](#typemessagerange)
- [TypeChannelMessagesFilter](#typechannelmessagesfilter)
- [TypeChannelParticipant](#typechannelparticipant)
- [TypeChannelParticipantsFilter](#typechannelparticipantsfilter)
- [TypeInputBotInlineMessage](#typeinputbotinlinemessage)
- [TypeInputBotInlineResult](#typeinputbotinlineresult)
- [TypeBotInlineMessage](#typebotinlinemessage)
- [TypeBotInlineResult](#typebotinlineresult)
- [TypeExportedMessageLink](#typeexportedmessagelink)
- [TypeMessageFwdHeader](#typemessagefwdheader)
- [TypeInputBotInlineMessageID](#typeinputbotinlinemessageid)
- [TypeInlineBotSwitchPM](#typeinlinebotswitchpm)
- [TypeTopPeer](#typetoppeer)
- [TypeTopPeerCategory](#typetoppeercategory)
- [TypeTopPeerCategoryPeers](#typetoppeercategorypeers)
- [TypeDraftMessage](#typedraftmessage)
- [TypeStickerSetCovered](#typestickersetcovered)
- [TypeMaskCoords](#typemaskcoords)
- [TypeInputStickeredMedia](#typeinputstickeredmedia)
- [TypeGame](#typegame)
- [TypeInputGame](#typeinputgame)
- [TypeHighScore](#typehighscore)
- [TypeRichText](#typerichtext)
- [TypePageBlock](#typepageblock)
- [TypePhoneCallDiscardReason](#typephonecalldiscardreason)
- [TypeDataJSON](#typedatajson)
- [TypeLabeledPrice](#typelabeledprice)
- [TypeInvoice](#typeinvoice)
- [TypePaymentCharge](#typepaymentcharge)
- [TypePostAddress](#typepostaddress)
- [TypePaymentRequestedInfo](#typepaymentrequestedinfo)
- [TypePaymentSavedCredentials](#typepaymentsavedcredentials)
- [TypeWebDocument](#typewebdocument)
- [TypeInputWebDocument](#typeinputwebdocument)
- [TypeInputWebFileLocation](#typeinputwebfilelocation)
- [TypeInputPaymentCredentials](#typeinputpaymentcredentials)
- [TypeShippingOption](#typeshippingoption)
- [TypeInputStickerSetItem](#typeinputstickersetitem)
- [TypeInputPhoneCall](#typeinputphonecall)
- [TypePhoneCall](#typephonecall)
- [TypePhoneConnection](#typephoneconnection)
- [TypePhoneCallProtocol](#typephonecallprotocol)
- [TypeCdnPublicKey](#typecdnpublickey)
- [TypeCdnConfig](#typecdnconfig)
- [TypeLangPackString](#typelangpackstring)
- [TypeLangPackDifference](#typelangpackdifference)
- [TypeLangPackLanguage](#typelangpacklanguage)
- [TypeChannelAdminLogEventAction](#typechanneladminlogeventaction)
- [TypeChannelAdminLogEvent](#typechanneladminlogevent)
- [TypeChannelAdminLogEventsFilter](#typechanneladminlogeventsfilter)
- [TypePopularContact](#typepopularcontact)
- [TypeRecentMeUrl](#typerecentmeurl)
- [TypeInputSingleMedia](#typeinputsinglemedia)
- [TypeWebAuthorization](#typewebauthorization)
- [TypeInputMessage](#typeinputmessage)
- [TypeInputDialogPeer](#typeinputdialogpeer)
- [TypeDialogPeer](#typedialogpeer)
- [TypeFileHash](#typefilehash)
- [TypeInputClientProxy](#typeinputclientproxy)
- [TypeInputSecureFile](#typeinputsecurefile)
- [TypeSecureFile](#typesecurefile)
- [TypeSecureData](#typesecuredata)
- [TypeSecurePlainData](#typesecureplaindata)
- [TypeSecureValueType](#typesecurevaluetype)
- [TypeSecureValue](#typesecurevalue)
- [TypeInputSecureValue](#typeinputsecurevalue)
- [TypeSecureValueHash](#typesecurevaluehash)
- [TypeSecureValueError](#typesecurevalueerror)
- [TypeSecureCredentialsEncrypted](#typesecurecredentialsencrypted)
- [TypeSavedContact](#typesavedcontact)
- [TypePasswordKdfAlgo](#typepasswordkdfalgo)
- [TypeSecurePasswordKdfAlgo](#typesecurepasswordkdfalgo)
- [TypeSecureSecretSettings](#typesecuresecretsettings)
- [TypeInputCheckPasswordSRP](#typeinputcheckpasswordsrp)
- [TypeSecureRequiredType](#typesecurerequiredtype)
- [TypeInputAppEvent](#typeinputappevent)
- [TypeJSONObjectValue](#typejsonobjectvalue)
- [TypeJSONValue](#typejsonvalue)
- [TypePageTableCell](#typepagetablecell)
- [TypePageTableRow](#typepagetablerow)
- [TypePageCaption](#typepagecaption)
- [TypePageListItem](#typepagelistitem)
- [TypePageListOrderedItem](#typepagelistordereditem)
- [TypePageRelatedArticle](#typepagerelatedarticle)
- [TypePage](#typepage)
- [TypePollAnswer](#typepollanswer)
- [TypePoll](#typepoll)
- [TypePollAnswerVoters](#typepollanswervotes)
- [TypePollResults](#typepollresults)
- [TypeChatOnlines](#typechatonlines)
- [TypeStatsURL](#typestatsurl)
- [TypeChatAdminRights](#typechatadminrights)
- [TypeChatBannedRights](#typechatbannedrights)
- [TypeInputWallPaper](#typeinputwallpaper)
- [TypeCodeSettings](#typecodesettings)
- [TypeWallPaperSettings](#typewallpapersettings)
- [TypeAutoDownloadSettings](#typeautodownloadsettings)
- [TypeEmojiKeyword](#typeemojikeyword)
- [TypeEmojiKeywordsDifference](#typeemojikeywordsdifference)
- [TypeEmojiURL](#typeemojiurl)
- [TypeEmojiLanguage](#typeemojilanguage)
- [TypeFolder](#typefolder)
- [TypeInputFolderPeer](#typeinputfolderpeer)
- [TypeFolderPeer](#typefolderpeer)
- [TypeUrlAuthResult](#typeurlauthresult)
- [TypeChannelLocation](#typechannellocation)
- [TypePeerLocated](#typepeerlocated)
- [TypeRestrictionReason](#typerestrictionreason)
- [TypeInputTheme](#typeinputtheme)
- [TypeTheme](#typetheme)
- [TypeBaseTheme](#typebasetheme)
- [TypeInputThemeSettings](#typeinputthemesettings)
- [TypeThemeSettings](#typethemesettings)
- [TypeWebPageAttribute](#typewebpageattribute)
- [TypeBankCardOpenUrl](#typebankcardopenurl)
- [TypeDialogFilter](#typedialogfilter)
- [TypeDialogFilterSuggested](#typedialogfiltersuggested)
- [TypeStatsDateRangeDays](#typestatsdaterangedays)
- [TypeStatsAbsValueAndPrev](#typestatsabsvalueandprev)
- [TypeStatsPercentValue](#typestatspercentvalue)
- [TypeStatsGraph](#typestatsgraph)
- [TypeVideoSize](#typevideosize)
- [TypeStatsGroupTopPoster](#typestatsgroupropposter)
- [TypeStatsGroupTopAdmin](#typestatsgroupropadmin)
- [TypeStatsGroupTopInviter](#typestatsgroupropinviter)
- [TypeGlobalPrivacySettings](#typeglobalprivacysettings)
- [TypeMessageViews](#typemessageviews)
- [TypeMessageReplyHeader](#typemessagereplyheader)
- [TypeMessageReplies](#typemessagereplies)
- [TypePeerBlocked](#typepeerblocked)
- [TypeGroupCall](#typegroupcall)
- [TypeInputGroupCall](#typeinputgroupcall)
- [TypeGroupCallParticipant](#typegroupcallparticipant)
- [TypeInlineQueryPeerType](#typeinlinequerypeertype)
- [TypeChatInviteImporter](#typechatinviteimporter)
- [TypeChatAdminWithInvites](#typechatadminwithinvites)
- [TypeGroupCallParticipantVideoSourceGroup](#typegroupcallparticipantvideosourcegroup)
- [TypeGroupCallParticipantVideo](#typegroupcallparticiplantvideo)
- [TypeBotCommandScope](#typebotcommandscope)
- [TypeSponsoredMessage](#typesponsoredmessage)
- [TypeSearchResultsCalendarPeriod](#typesearchresultscalendarperiod)
- [TypeSearchResultsPosition](#typesearchresultsposition)
- [TypeReactionCount](#typereactioncount)
- [TypeMessageReactions](#typemessagereactions)
- [TypeAvailableReaction](#typeavailablereaction)
- [TypeMessagePeerReaction](#typemessagepeerreaction)
- [TypeGroupCallStreamChannel](#typegroupcallstreamchannel)
- [TypeAttachMenuBotIconColor](#typeattachmenuboticoncolor)
- [TypeAttachMenuBotIcon](#typeattachmenuboricon)
- [TypeAttachMenuBot](#typeattachmenubot)
- [TypeAttachMenuBots](#typeattachmenubots)
- [TypeAttachMenuBotsBot](#typeattachmenubotsbot)
- [TypeWebViewResult](#typewebviewresult)
- [TypeSimpleWebViewResult](#typesimplewebviewresult)
- [TypeWebViewMessageSent](#typewebviewmessagesent)
- [TypeBotMenuButton](#typebotmenubutton)
- [TypeNotificationSound](#typenotificationsound)
- [TypeAttachMenuPeerType](#typeattachmenupeertype)
- [TypeInputInvoice](#typeinputinvoice)
- [TypeInputStorePaymentPurpose](#typeinputstorepaymentpurpose)
- [TypePremiumGiftOption](#typepremiumgiftoption)
- [TypePaymentFormMethod](#typepaymentformmethod)
- [TypeEmojiStatus](#typeemojistatus)
- [TypeReaction](#typereaction)
- [TypeChatReactions](#typechatreactions)
- [TypeEmailVerifyPurpose](#typeemailverifypurpose)
- [TypeEmailVerification](#typeemailverification)
- [TypePremiumSubscriptionOption](#typepremiumsubscriptionoption)
- [TypeSendAsPeer](#typesendaspe)
- [TypeMessageExtendedMedia](#typemessageextendedmedia)
- [TypeStickerKeyword](#typestickerkeyword)
- [TypeUsername](#typeusername)
- [TypeForumTopic](#typeforumtopic)
- [TypeDefaultHistoryTTL](#typedefaulthistoryttl)
- [TypeExportedContactToken](#typeexportedcontacttoken)
- [TypeRequestPeerType](#typerequestpeertype)
- [TypeEmojiList](#typeemojilist)
- [TypeEmojiGroup](#typeemojigroup)
- [TypeTextWithEntities](#typetextwithentities)
- [TypeAutoSaveSettings](#typeautosavesettings)
- [TypeAutoSaveException](#typeautosaveexception)
- [TypeInputBotApp](#typeinputbotapp)
- [TypeBotApp](#typebotapp)
- [TypeAppWebViewResult](#typeappwebviewresult)
- [TypeInlineBotWebView](#typeinlinebotwebview)
- [TypeReadParticipantDate](#typereadparticipantdate)
- [TypeInputChatlist](#typeinputchatlist)
- [TypeExportedChatlistInvite](#typeexportedchatlistinvite)
- [TypeMessagePeerVote](#typemessagepeervote)
- [TypeSponsoredWebPage](#typesponsoredwebpage)
- [TypeStoryViews](#typestoryviews)
- [TypeStoryItem](#typestoryitem)
- [TypeStoryView](#typestoryview)
- [TypeInputReplyTo](#typeinputreplyto)
- [TypeExportedStoryLink](#typeexportedstorylink)
- [TypeStoriesStealthMode](#typestoriesstealthmode)
- [TypeMediaAreaCoordinates](#typemediaareacoordinates)
- [TypeMediaArea](#typemediaarea)
- [TypePeerStories](#typepeerstories)
- [TypePremiumGiftCodeOption](#typepremiumgiftcodeoption)
- [TypePrepaidGiveaway](#typeprepaidgiveaway)
- [TypeBoost](#typeboost)
- [TypeMyBoost](#typemyboost)
- [TypeStoryFwdHeader](#typestoryfwdheader)
- [TypePostInteractionCounters](#typepostinteractioncounters)
- [TypePublicForward](#typepublicforward)
- [TypePeerColor](#typepeercolor)
- [TypeStoryReaction](#typestoryreaction)
- [TypeSavedDialog](#typesaveddialog)
- [TypeSavedReactionTag](#typesavedreactiontag)
- [TypeOutboxReadDate](#typeoutboxreaddate)
- [TypeResPQ](#typerespq)
- [TypeP_Q_inner_data](#typep_q_inner_data)
- [TypeBindAuthKeyInner](#typebindauthkeyinner)
- [TypeServer_DH_Params](#typeserver_dh_params)
- [TypeServer_DH_inner_data](#typeserver_dh_inner_data)
- [TypeClient_DH_Inner_Data](#typeclient_dh_inner_data)
- [TypeSet_client_DH_params_answer](#typeset_client_dh_params_answer)
- [TypeDestroyAuthKeyRes](#typedestroyauthkeyres)
- [TypeMsgsAck](#typemsgsack)
- [TypeBadMsgNotification](#typebadmsgnotification)
- [TypeMsgsStateReq](#typemsgsstatereq)
- [TypeMsgsStateInfo](#typemsgsstatrinfo)
- [TypeMsgsAllInfo](#typemsgsallinfo)
- [TypeMsgDetailedInfo](#typemsgdetailedinfo)
- [TypeMsgResendReq](#typemsgresendreq)
- [TypeRpcError](#typerpcerror)
- [TypeRpcDropAnswer](#typerpccdropanswer)
- [TypeFutureSalt](#typefuturesalt)
- [TypeFutureSalts](#typefuturesalts)
- [TypePong](#typepong)
- [TypeDestroySessionRes](#typedestroysessionres)
- [TypeNewSession](#typenewsession)
- [TypeHttpWait](#typehttpwait)
- [TypeIpPort](#typeipport)
- [TypeAccessPointRule](#typeaccesspointrule)
- [TypeTlsClientHello](#typetlsclienthello)
- [TypeTlsBlock](#typetlsblock)
- [AnyRequest](#anyrequest)

### Classes (类)

包含了数百个API类，这些类代表了Telegram API中的各种对象和方法。这些类包括：

#### 核心通信类
- `InputPeerEmpty`, `InputPeerSelf`, `InputPeerChat`, `InputPeerUser`, `InputPeerChannel` - 输入对等体
- `InputUserEmpty`, `InputUserSelf`, `InputUser` - 输入用户
- `UserEmpty`, `User` - 用户对象
- `ChatEmpty`, `Chat`, `ChatForbidden`, `Channel`, `ChannelForbidden` - 聊天和频道对象

#### 消息相关类
- `MessageEmpty`, `Message`, `MessageService` - 消息对象
- `MessageMediaEmpty`, `MessageMediaPhoto`, `MessageMediaDocument` 等 - 消息媒体
- `MessageActionEmpty`, `MessageActionChatCreate` 等 - 消息操作

#### 文件和媒体类
- `InputFile`, `InputFileBig` - 输入文件
- `DocumentEmpty`, `Document` - 文档
- `PhotoEmpty`, `Photo` - 照片
- `InputMediaPhoto`, `InputMediaDocument` 等 - 输入媒体

#### 更新和通知类
- `UpdateNewMessage`, `UpdateDeleteMessages` 等 - 各种更新类型
- `Updates`, `UpdatesCombined` - 更新集合

#### 设置和配置类
- `Config` - 配置
- `DcOption` - 数据中心选项
- `NotifyPeer`, `PeerNotifySettings` - 通知设置

#### 加密聊天类
- `EncryptedChat`, `EncryptedMessage` - 加密聊天相关

#### 隐私和安全类
- `PrivacyKeyStatusTimestamp`, `PrivacyRule` 等 - 隐私设置
- `SecureValue`, `SecureFile` 等 - 安全值

### Namespaces (命名空间)

API模块包含以下子命名空间：

- **storage** - 存储相关API
- **auth** - 认证相关API
- **contacts** - 联系人管理API
- **messages** - 消息处理API
- **updates** - 更新处理API
- **photos** - 照片管理API
- **upload** - 文件上传API
- **help** - 帮助和配置API
- **account** - 账户管理API
- **channels** - 频道管理API
- **payments** - 支付相关API
- **phone** - 电话和通话API
- **stats** - 统计API
- **stickers** - 贴纸API
- **users** - 用户API
- **chatlists** - 聊天列表API
- **bots** - 机器人API
- **stories** - 故事API
- **premium** - 高级功能API
- **langpack** - 语言包API
- **folders** - 文件夹API

## Type Aliases (类型别名详情)

### AnyLiteral
```typescript
type AnyLiteral = Record<string, any> | void
```

### Reader
```typescript
type Reader = any
```

### Client
```typescript
type Client = any
```

### Utils
```typescript
type Utils = any
```

### X
```typescript
type X = unknown
```

### Type
```typescript
type Type = unknown
```

### Bool
```typescript
type Bool = boolean
```

### int
```typescript
type int = number
```

### double
```typescript
type double = number
```

### float
```typescript
type float = number
```

### int128
```typescript
type int128 = BigInteger
```

### int256
```typescript
type int256 = BigInteger
```

### long
```typescript
type long = BigInteger
```

### bytes
```typescript
type bytes = Buffer
```

### TypeEntityLike
```typescript
type TypeEntityLike = EntityLike
```

### TypeInputPeer
表示输入对等体的联合类型，包括：
- `InputPeerEmpty` - 空对等体
- `InputPeerSelf` - 自己
- `InputPeerChat` - 聊天
- `InputPeerUser` - 用户
- `InputPeerChannel` - 频道
- `InputPeerUserFromMessage` - 来自消息的用户
- `InputPeerChannelFromMessage` - 来自消息的频道

### TypeInputUser
表示输入用户的联合类型，包括：
- `InputUserEmpty` - 空用户
- `InputUserSelf` - 自己
- `InputUser` - 用户
- `InputUserFromMessage` - 来自消息的用户

### TypeMessage
表示消息的联合类型，包括：
- `MessageEmpty` - 空消息
- `Message` - 普通消息
- `MessageService` - 服务消息

### TypeUpdate
表示更新的联合类型，包含所有可能的更新类型，如：
- `UpdateNewMessage` - 新消息
- `UpdateDeleteMessages` - 删除消息
- `UpdateUserTyping` - 用户正在输入
- `UpdateChatUserTyping` - 聊天中用户正在输入
- 以及许多其他更新类型...

### AnyRequest
表示任何请求的联合类型，包含所有API方法，如：
- 认证相关：`SendCode`, `SignIn`, `SignUp`
- 消息相关：`SendMessage`, `ForwardMessages`, `EditMessage`
- 用户相关：`GetUsers`, `UpdateProfile`
- 聊天相关：`CreateChat`, `EditChatTitle`
- 以及数百个其他API方法...

## 使用说明

Api模块是GramJS的核心模块，包含了所有Telegram API的类型定义和方法。通过这个模块，你可以：

1. **发送和接收消息**
2. **管理用户和聊天**
3. **处理文件上传和下载**
4. **管理隐私设置**
5. **处理支付**
6. **管理机器人**
7. **处理更新和事件**

### 基本使用示例

```javascript
import { Api } from 'telegram';

// 发送消息
await client.invoke(new Api.messages.SendMessage({
    peer: 'username',
    message: 'Hello World!'
}));

// 获取聊天信息
const result = await client.invoke(new Api.messages.GetChats({
    id: [chatId]
}));

// 获取用户信息
const users = await client.invoke(new Api.users.GetUsers({
    id: [new Api.InputUserSelf()]
}));
```

这个模块提供了完整的Telegram API访问能力，是构建Telegram客户端应用的基础。
