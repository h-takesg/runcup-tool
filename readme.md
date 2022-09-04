# strava-api-tool
## run
`.\run.bat`でmain.tsを実行する．

## init
strava API の認証データを置く
`project-root/authInfo.json`
```
{
    "clientId": "",
    "clientSecret": "",
    "accessToken": "",
    "refreshToken": ""
}
```

google API の認証データを置く
`project-root/gapi_auth.json`
gcpのサービスアカウントの秘密鍵で降ってくるやつをrenameして設置

杯情報を置く
`project-root/cupInfo.json`
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

1つめの期間データを置く
`project-root/period.json`
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
