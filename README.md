# SideProject-Spotify-With-LineBot

概念是透過LineBot來控制Spotify播放音樂，並且可以透過LineBot來查詢歌曲資訊。
流程是：
    1.我們會先註冊一個LineBot，並且把它加入我們的好友。
    2.我們會將一個有會員的Spotity帳號登入到伺服器中 (並且使用MongoDB來記錄token相關內容)
    3.用戶跟LineBot說話，LineBot會將用戶的訊息傳送到伺服器中
    4.伺服器會將用戶的訊息去詢問Spotify的Api
    5.Spotify會回傳結果給伺服器
    6.伺服器會將結果回傳給LineBot
    7.LineBot會將結果回傳給用戶

1. 伺服器架在Vercel上使用Fastify框架
2. 資料庫使用MongoDB
3. LineBot使用LineBotSDK
