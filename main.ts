import { StravaApi } from "./StravaApi.ts";
import { GApi } from "./google_api_tool.ts";

const strava : StravaApi = await StravaApi.build();
const originalActivities = await strava.listClubActivities("took");

const oldestActivityIndex = originalActivities.findIndex((e => e.name === "し"));
const validActivities = originalActivities.slice(0,oldestActivityIndex+1);

const activitiesCount = validActivities.length;
const distanceMeterSum = validActivities.reduce(((a : number,e) => a + parseFloat(e.distance)), 0.0);
const distanceKiloMeterSum = distanceMeterSum / 1000;

console.log(`Activities: ${activitiesCount}`);
console.log(`Distance: ${distanceKiloMeterSum}`);

const gapi = new GApi();
const res = await gapi.setValue("1fvyuXc8Cwwd2Qpt8qnl57LXwSVqN6vWbkkNUFymRs-8", 0, 2, 1, distanceKiloMeterSum);