import { GoogleAPI } from "https://deno.land/x/google_deno_integration/mod.ts";
import {Logger} from "./logger.ts";

class GApi {
    gapi;

    constructor(){
        const certStr = Deno.readFileSync("./app/gapi_auth.json");
        const decoder = new TextDecoder("utf-8");
        const certStrDec = decoder.decode(certStr);
        const certData = JSON.parse(certStrDec);

        this.gapi = new GoogleAPI({
            email: certData.client_email,
            scope: ["https://www.googleapis.com/auth/spreadsheets"],
            key: certData.private_key,
        });
    }

    public setValue(id: string, sheet: number, row: number, column: number, value: string | number){
        const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${id}:batchUpdate`

        let settingValue;
        if(typeof value == "string"){
            settingValue = {
                stringValue: value
            }
        }else{
            settingValue = {
                numberValue: value
            }
        }
        const requestData = {
            requests:[
                {
                    updateCells:{
                        rows:[
                            {
                                values:[
                                    {
                                        userEnteredValue: settingValue
                                    }
                                ]
                            }
                        ],
                        start:{
                            rowIndex: row,
                            columnIndex: column,
                            sheetId: sheet
                        },
                        fields: "*"
                    }
                }
            ]
        }

        const response = this.gapi.post(endpoint,requestData);
        return response;
    }
}

export {GApi}