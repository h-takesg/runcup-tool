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
