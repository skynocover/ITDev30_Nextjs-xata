# 部署

今天我們要來部署我們的服務了
部署的平台我們選擇Vercel

## Vercel

選擇Vercel有以下幾個原因

- 無縫整合: Vercel是Next.js的創建者, 因此提供最佳的整合和支持
- 自動部署: 可以直接連接GitHub倉庫, 直接幫你做好CICD
- 零設定: 大多數情況下無需額外配置,可以直接部署
- 免費計畫: 提供高額的免費方案 相當適合side project

## 連結Github並部署

要部署到Vercel需要先將你的程式碼上到Github

由於已經有太多Git跟Github教學的文章了 這裡就不展示

先把你的Code上到Github吧 我在這裡等你

.
.
.

好 接下來我們需要到[Vercel](https://vercel.com)去註冊一個帳號

註冊好之後你應該可以來到Overview的畫面

點選右側的Add New 並選擇Project

接下來你需要import git repository

並選擇Configure Github App

之後對他授權你需要的repository
你想省事的話也可以選擇All repositories

選擇之後按下儲存

回到剛才部署的畫面就可以看到你的repository了
這裡點選import

如同剛剛說的 Vercel跟Nextjs整合度很高 因此你幾乎不需要做任何設定

只需要將你本地端的.env.local內的變數填寫道
Environment Variables即可

填寫完之後就可以按Deploy來部署了

之後等待他部署完成

## 查看你的服務

部署完成後你應該可以看到以下的畫面


我們點選Continue to Dashboard 就可以看到我們的服務了


當中有一個Domains 這個是我們部署的網址

例如附圖的網址 https://it-dev30-nextjs-xata.vercel.app/

點選上面的usage你可以來到以下的畫面


Vercel具有強大的CDN
因此你可以在這裡看到各種數據

## 總結

我們今天將服務上到了Github及Vercel
這樣你的服務就算是公開了

而且由於整合服務契合度很高 幾乎不必再做任何設定
相當方便





