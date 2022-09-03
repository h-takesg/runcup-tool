import { StravaApi } from "./StravaApi.ts";
import { GApi } from "./google_api_tool.ts";
import { Logger } from "./logger.ts";
import { equal } from "https://deno.land/x/equal/mod.ts";

if(Deno.args.length === 0) {
    console.log("run update / run newPeriod");
    Deno.exit(1);
}

const subcommand = Deno.args[0];

switch (subcommand) {
    case "update":
        await update();        
        break;

    case "newPeriod":
        newPeriod();
        break;

    default:
        console.log("run update / run newPeriod");
        Deno.exit(1);
        break;
}

async function update(){
    // 期間データ読み込み
    const now = Date.now();
    const periodData = JSON.parse(Deno.readTextFileSync("./app/period.json"));
    const currentPeriod = periodData.find(e => e.startMs < now && now < e.endMs); // shallow copy

    // stravaデータ取得
    const strava : StravaApi = await StravaApi.build();
    const responseActivities = await strava.listClubActivities("took");

    // 集計期間アクティビティを抽出
    const startActivity = currentPeriod.startActivity;
    const oldestActivityIndex = responseActivities.findIndex((e => equal(e, startActivity)));
    const validActivities = responseActivities.slice(0,oldestActivityIndex);

    // アクティビティ数と期間内総走行距離を計算
    const activityCount = validActivities.length;
    const distanceMeterSum = validActivities.reduce(((a : number,e) => a + parseFloat(e.distance)), 0.0);
    const distanceKiloMeterSum = distanceMeterSum / 1000;

    // 結果出力
    console.log(`Activities: ${activityCount}`);
    console.log(`Distance: ${distanceKiloMeterSum}`);

    // 異常検知
    if(currentPeriod.activityCount > activityCount || currentPeriod.sumDistance > distanceKiloMeterSum){
        Logger.critical("Number decrease!");
        Logger.critical("currentPeriod");
        Logger.critical(JSON.stringify(currentPeriod, null, 4));
        Logger.critical("activityCount and distanceKiloMeterSum");
        Logger.critical([activityCount, distanceKiloMeterSum]);
        Deno.exit(1);
    }

    // spreadsheet 書き込み
    if(currentPeriod.sumDistance != distanceKiloMeterSum){
        Logger.info("Update spreadsheet")
        const gapi = new GApi();
        await gapi.setValue("1fvyuXc8Cwwd2Qpt8qnl57LXwSVqN6vWbkkNUFymRs-8", 0, 2, currentPeriod.columnNum, distanceKiloMeterSum);
    }

    // ファイル書き込み
    currentPeriod.activityCount = activityCount;
    currentPeriod.sumDistance = distanceKiloMeterSum;
    Deno.writeTextFileSync("./app/period.json", JSON.stringify(periodData, null, 4));
    Deno.writeTextFileSync(`./app/activities/${currentPeriod.name}.json`, JSON.stringify(validActivities, null, 4));
}

function newPeriod(){
    const periodData = JSON.parse(Deno.readTextFileSync("./app/period.json"));
    const lastPeriod = periodData[periodData.length - 1];
    const nameArray = [
        "Sep1stWeek",
        "Sep2ndWeek",
        "Sep3rdWeek",
        "Sep4thWeek",
        "Sep5thWeek",
    ]
    const ms7days = 7 * 24 * 60 * 60 * 1000;
    const activities = JSON.parse(Deno.readTextFileSync(`./app/activities/${lastPeriod.name}.json`));
    const lastActivity = activities[0];

    const newPeriod = {
        "name": nameArray[nameArray.findIndex(e => e === lastPeriod.name) + 1],
        "startMs": lastPeriod.startMs + ms7days,
        "endMs": lastPeriod.endMs + ms7days,
        "startActivity": lastActivity,
        "columnNum": lastPeriod.columnNum + 1,
        "activityCount": 0,
        "sumDistance": 0
    }

    periodData.push(newPeriod);
    Deno.writeTextFileSync("./app/period.json", JSON.stringify(periodData, null, 4));
}