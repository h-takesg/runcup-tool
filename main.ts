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

    case "list":
        await listActivities(Deno.args[1]);
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

    // 杯情報読み込み
    const cupData = JSON.parse(Deno.readTextFileSync("./app/cupInfo.json"));
    
    // アスリート情報読み込み
    const athletes = JSON.parse(Deno.readTextFileSync("./app/athletes.json"));

    // stravaデータ取得
    const strava : StravaApi = await StravaApi.build();
    const responseActivities = await strava.listClubActivities(cupData.clubId);

    // 集計期間アクティビティを抽出
    const startActivity = currentPeriod.startActivity;
    const oldestActivityIndex = responseActivities.findIndex((e => equal(e, startActivity)));
    const validActivities = responseActivities.slice(0,oldestActivityIndex);

    // 名前ごとの期間内総走行距離を計算
    const athletesDistances = validActivities.reduce(
        (result, currentActivity) => {
            const athleteName = currentActivity.athlete.lastname + " " + currentActivity.athlete.firstname;
            if(Object.keys(result).includes(athleteName)){
                result[athleteName] += currentActivity.distance;
            }else{
                result[athleteName] = currentActivity.distance;
            }
            return result;
        },
        {}
    );

    // 既存リストに合わせてソート
    let sortedDistances = athletes.map(x => {return {"name": x, "distance": 0}});
    for(let athlete of Object.keys(athletesDistances)){
        const i = sortedDistances.findIndex(x => athlete == x.name);
        if(i > -1){
            sortedDistances[i].distance = athletesDistances[athlete];
        }else{
            sortedDistances.push({"name":athlete, "distance": athletesDistances[athlete]});
        }
    }

    // 書き込み用データ作成
    const newAthletes = sortedDistances.map(x => x.name);
    const newAthletesDistances = sortedDistances.map(x => x.distance);
    
    // spreadsheet 書き込み
    Logger.info("Update spreadsheet")
    const gapi = new GApi();
    await gapi.setValuesVertical(cupData.sheetId, "master", 2, 1, [newAthletes]);
    await gapi.setValuesVertical(cupData.sheetId, "master", 2, currentPeriod.columnNum, [newAthletesDistances]);

    // ファイル書き込み
    Deno.writeTextFileSync(`./app/activities/${currentPeriod.name}.json`, JSON.stringify(validActivities, null, 4));
    Deno.writeTextFileSync(`./app/athletes.json`, JSON.stringify(newAthletes, null, 4));

}

function newPeriod(){
    const cupData = JSON.parse(Deno.readTextFileSync("./app/cupInfo.json"));
    const periodData = JSON.parse(Deno.readTextFileSync("./app/period.json"));
    const lastPeriod = periodData[periodData.length - 1];
    const nameArray = cupData.periodNames;
    const msPeriodDays = cupData.periodDays * 24 * 60 * 60 * 1000;
    const activities = JSON.parse(Deno.readTextFileSync(`./app/activities/${lastPeriod.name}.json`));
    let allActivities = JSON.parse(Deno.readTextFileSync("/app/activities/all.json"));
    allActivities = activities.concat(allActivities);
    const lastActivity = allActivities[0];

    const newPeriod = {
        "name": nameArray[nameArray.findIndex(e => e === lastPeriod.name) + 1],
        "startMs": lastPeriod.endMs + 1,
        "endMs": lastPeriod.endMs + msPeriodDays,
        "startActivity": lastActivity,
        "columnNum": lastPeriod.columnNum + 1,
        "activityCount": 0,
        "sumDistance": 0
    }

    periodData.push(newPeriod);
    Deno.writeTextFileSync("./app/period.json", JSON.stringify(periodData, null, 4));
    Deno.writeTextFileSync("./app/activities/all.json", JSON.stringify(allActivities, null, 4));
}

async function listActivities(clubId: string){
    // stravaデータ取得
    const strava : StravaApi = await StravaApi.build();
    const responseActivities = await strava.listClubActivities(clubId);

    Deno.writeTextFileSync("./app/removeme.activities.json", JSON.stringify(responseActivities, null, 4));
}
