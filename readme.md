# strava-api-tool
## run
`.\run.bat`でmain.tsを実行する．
|subcommand|description|
|-|-|
|`update`|現在の集計期間の走行距離を取得し，スプシを更新する|
|`newPeriod`|集計期間を切り替える|
|`list ${clubid}`|指定したidのクラブのアクティビティを直近150件とってくる|

## init
1つ目の集計期間内に実行することを想定

### タイムゾーン設定
Asia/Tokyoにする

### 依存ソフト導入
* docker
* (optional) git

### strava API の認証データを置く
`./authInfo.json`
```
{
    "clientId": "",
    "clientSecret": "",
    "accessToken": "",
    "refreshToken": ""
}
```

### google API の認証データを置く
`./gapi_auth.json`
gcpのサービスアカウントの秘密鍵で降ってくるやつをrenameして設置

### 杯情報を置く
`./cupInfo.json`
```
{
    "sheetId": "", // string, 集計に使うspreadsheetId
    "periodDays": , // 1期間あたり日数
    "periodNames":[
        "Sep1stWeek",
        "Sep2ndWeek",
        "Sep3rdWeek",
        "Sep4thWeek",
        "Sep5thWeek"
    ]
}
```

### ギリギリ集計期間外のアクティビティを調べる
win: `./run.bat list ${clubid}`  
mac/linux: `./run.sh list ${clubid}`  
実行すると`removeme.activities.json`ができるのでギリギリ集計期間より前のアクティビティをコピー

### 1つめの期間データを置く
`./period.json`
```
[
    {
        "name": , // 文字列，集計期間名
        "startMs": , // 整数，期間開始unixタイム，ms
        "endMs": , // 整数，期間終了unixタイム，ms
        "startActivity": {}, // stravaapiから返ってくるうちの一つ，ギリギリ期間前のやつ，これの次のアクティビティから集計対象
        "columnNum": , // 整数,シートの何列目に集計結果を書き込むか,期間ごとにインクリメントされる
        "activityCount": 0,
        "sumDistance": 0
    }
]
```

### 定期実行をセットする
各環境で定期でコマンド実行できるやつを使う  
このツール自体に定期実行機能はない  
更新: `./run.sh update`  
期間切り替え: `./run.sh newPeriod`  
期間切り替えちょうどのタイミングで実行しないとアクティビティがずれるので注意

crontabの例  
`/home/took`で`git clone`  
すなわちこのファイルが`/home/took/runcup/readme.md`にある場合  
* 9月の毎日10時から24時まで毎分10秒待機してから更新実行
* 9月の月曜0時0分毎に期間切り替え実行
```
* 10-23 * 9 * sleep 10; /home/took/runcup/run.sh update
00 00 * 9 1 /home/took/runup/run.sh newPeriod
```