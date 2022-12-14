import { StravaCertData } from "./dataTypes.ts";
import {Logger} from "./logger.ts";

export type SummaryActivity = {
    resource_state: number;
    athlete: {
        resource_state: number;
        firstname: string;
        lastname: string;
    }
    name: string;
    distance: number;
    moving_time: number;
    elapsed_time: number;
    total_elevation_gain: number;
    type: string;
    sport_type: string;
    workout_type: number;
};

export class StravaApi {
    ACCESSTOKEN: string;

    urlHead = "https://www.strava.com/api/v3";

    private constructor() {
        this.ACCESSTOKEN = "not initialized";
    }

    //////////////////////////////////
    // util

    public static async build() : Promise<StravaApi> {
        const _new = new StravaApi();
        _new.ACCESSTOKEN = await _new.refreshLatestAccessToken();
        return _new;
    }

    private async refreshLatestAccessToken() {
        const certData: StravaCertData = JSON.parse(Deno.readTextFileSync("./app/authInfo.json"));
        
        if(certData.expiresAt - Date.now()/1000 > 1 * 60 * 60){
            Logger.info("No need to refresh access token.")
            return certData.accessToken;
        }

        Logger.info("Refresh access token.");

        const res = await fetch("https://www.strava.com/api/v3/oauth/token", {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `client_id=${certData.clientId}&client_secret=${certData.clientSecret}&grant_type=refresh_token&refresh_token=${certData.refreshToken}`
        });

        const resData = await res.json();
        certData.accessToken = resData.access_token;
        certData.expiresAt = resData.expires_at;

        Deno.writeTextFileSync("./app/authInfo.json", JSON.stringify(certData, null, 4));

        return certData["accessToken"];
    }

    private async callApiWithGet(url: string) {
        const res = await fetch(url, {
            headers: {
                Authorization: "Bearer " + this.ACCESSTOKEN,
            }
        });
        return await res.json();
    }

    ////////////////////////////////////
    // api
    public async getClub(id: string) {
        const url = `${this.urlHead}/clubs/${id}`;
        return await this.callApiWithGet(url);
    }

    public async listClubActivities(id: string, page = 1, per_page = 150) : Promise<Array<SummaryActivity>> {
        const url = `${this.urlHead}/clubs/${id}/activities?page=${page}&per_page=${per_page}`;
        return await this.callApiWithGet(url);
    }
}