# CRON

如果你在特定時間或特定週期需要執行特定的腳本或任務
Vercel有CRON可以使用

## 什麼是CRON

CRON 是一個在 Unix-like 操作系統中廣泛使用的時間排程工具
允許用戶在特定的時間或時間間隔自動運行命令或腳本

系統將會每分鐘檢查一次 crontab 文件中的任務。
如果發現當前時間匹配某個任務的執行時間，它就會執行該任務

### CRON的表達式

```
* * * * * command_to_execute
```

五個星號分別代表

- 分鐘 (0-59)
- 小時 (0-23)
- 日期 (1-31)
- 月份 (1-12)
- 星期幾 (0-7，其中 0 和 7 都表示星期日)

如果你想在每天早上七點執行特定腳本

```
0 7 * * * /path/to/script.sh
```

或是每隔十五分鐘執行腳本

```
*/15 * * * * /path/to/script.sh
```

### CRON的用途

通常用於

- 系統維護 (如日誌、臨時文件清理)
- 數據備份
- 發送定期報告或郵件
- 更新系統
- 網站維護任務


## Vercel的CRON

Vercel CRON 是 Vercel 平台提供的一項功能 (注意不是nextjs提供的)
這個功能與傳統 Unix-like 系統中的 CRON 類似，但專門為 Vercel 的雲端環境優化。

### 設定給CRON的api

先到你的`src/app/api/cron/route.ts`內建立檔案

你也可以設定自己喜歡的路徑

```ts
export function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }
  const currentTime = new Date().toISOString();
  return new Response(`Current time: ${currentTime}`);
}
```

然後在你的根目錄 建立檔案`vercel.json`

在這裡的path要跟你希望vercel的api路徑相同

這裡我們設定每天十二點執行一次

```json
{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "0 12 * * *"
    }
  ]
}

```

要注意的是vercel的免費版有以下限制

- 最多兩個CRON的job
- 每天最多執行一次

詳細可以看[這裡](https://vercel.com/docs/cron-jobs/usage-and-pricing)

然後我們到`.env.local`去設定環境變數

```
CRON_SECRET="你的secret"
```

你可以使用hash來幫你生亂數
[sha256 online](https://emn178.github.io/online-tools/sha256.html)

這是為了避免有其他不認識的人來call你的cron api
但你需要提供給Nextjs知道 好讓他來call你的api

## 總結

Vercel CRON是Vercel提供的功能

讓你不必額外準備CRON的服務

現在也有很多做CRON的服務
例如 Cloudflare Workers Cron Triggers, AWS的EventBridge, GCP的Cloud Scheduler, Azure Functions 的 Timer trigger

但是Vercel提供了你可以集成服務 讓你的服務管理起來更方便


