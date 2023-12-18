# SideProject-Spotify-With-LineBot

概念是透過LineBot來控制Spotify播放音樂，並且可以透過LineBot來查詢歌曲資訊。
流程是：
    1.我們會先註冊一個LineBot，並且把它加入我們的好友。
    2.我們會將公用的Spotity帳號登入到伺服器中
    3.用戶跟LineBot說話，LineBot會將用戶的訊息傳送到伺服器中
    4.伺服器會將用戶的訊息傳送到Spotify中 (因為有登入，所以可以控制Spotify)
    5.Spotify會回傳結果給伺服器
    6.伺服器會將結果回傳給LineBot
    7.LineBot會將結果回傳給用戶
