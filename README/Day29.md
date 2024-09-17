# 來做另外一個服務吧

## Xata的Branch

對Xata來說 他有一個很方便的功能叫做branch

他可以讓你的服務做好資料分離

先下指令做一個新的branch

```
xata branch create newbranch
```

然後到Xata的網站上確認你的branch有被正確建立

這時候你會發現資料庫內的所有資料都是空的

接著我們建立一個service 然後啟動你的服務 `pnpm dev`

### 新的服務

到網址`http://localhost:3000/service/newbranch` 你可以看到完全新的服務

如果你建立的branch名稱不是newbranch 記得要換掉你的網址

然後你可以嘗試在這個新服務內新增資料

新增完後 回到原本的服務`http://localhost:3000/service/main`

你會發現資料並沒有被同步過去

這就是Xata的Branch的資料隔離功能

## 你可以使用以下的方式規劃你的branch

- main 你的正式的服務
- newbranch 你新的服務
- dev 你開發的服務, 以後要修改DB的話 就從這邊修改

方式會跟你使用git的方式類似

### DB的migration

點擊branch 然後你可以看到 `Add a branch` `Manage branches` `Manage migrations`三個選項

點選`Manage migrations` 

你可以在這裡看到所有migration的紀錄

點選右上角的`Create a migration request` 你就可以選擇是要從哪一個branch migrate到另外一個branch

## 總結

Xata的branch功能可以讓你很方便的做資料隔離
而且又有免費的10個branch可以使用
相當於10個獨立的DB可以使用


