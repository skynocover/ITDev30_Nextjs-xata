# Xata

## 什麼是Xata

[https://xata.io/](https://xata.io/)

Xata是一個全託管的Serverless Postgres資料庫  
不需要去管理伺服器或資料庫基礎設施

具有以下特色
- 具備多種語言的SDK 包括我們今天使用的TS
- 免費版就有15GB的Data storage, 將較於neon免費版的0.5GB多很多
- 免費版還具有2GB的File storage空間
- 可以將file當作是DB的欄位存進DB內 減少維護object storage的成本
- Database具備Branch功能 可以做資料區隔
- 具備Search engine的功能 (我們這次用不到)

先去註冊吧 他是免費的  
我在這裡等你

好了嗎? 那我們繼續

### Dashboard

workspace是工作空間  
目的是讓一群人協作 
你可以在工作空間內管理團隊成員

然後我們點擊 `Add database`  

database名稱可以選你喜歡的 我這裡填入`ithome` 位置我們選`Sydney`  
我們會透過sdk去取得DB的資源 所以不需要勾選Beta的這個選項 (你喜歡的話也可以勾起來)

建立好database之後進去你應該可以看到空的database  
你可以在這裡亂玩database  然後嘗試看看會長怎樣  
不用擔心搞壞 因為我們等一下會開branch出去

### 建立Schema

你可以點選schema之後點選Add a table  
他預設會有 `id` `xata.createdAt` `xata.updateAt` `xata.version` 等內建的column

你可以隨意建立一些column 看他有哪些型別可以用  
包含我們會用到的file及現在很紅的vector  
我這裡新增的 `name` `number` `file` 三項  
接著你可以用它內建的`Generate random data`

然後你就可以看到他給你的資料了  
你可以隨便挑一個row的file欄位 然後上傳檔案看看  

上傳完之後 你就可以在DB裡面看這個檔案了  
xata預設所有檔案都是private的 所以你可以點選最下面的Access Private 讓他變成public後 就可以點選旁邊的連結看你的檔案了

## 連上你的Xata

### 在你的本地初始化你的專案

點選右上角的Get code snippet  
應該可以看到兩行程式碼
```
npm install @xata.io/cli -g
```

```
xata init --db {你的連結}
```

執行這兩行 安裝cli並初始化xata

這裡選擇typescript  
路徑選擇預設

你應該可以在你本地端看到新增的檔案  
包括 `.xatarc` `src/xata.ts` 以及在你的.env內會有`XATA_BRANCH`及`XATA_API_KEY`兩個項目

### API Key

如果你需要建立API Key  
點選Xata dashboard右上角的頭像  
然後點選`Account settings`

往下拉到`Personal API keys`  
在這裡你可以建立自己的API Keys












