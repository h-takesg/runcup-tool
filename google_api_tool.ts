import { GoogleAPI } from "https://deno.land/x/google_deno_integration/mod.ts";
import { buildUrl } from "https://deno.land/x/url_builder/mod.ts";
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

    public setValues(id: string, sheetname: string, topRow: number, leftColumn: number, values: (number|string)[][]){
        const rowSize = values.length;
        const colSize = values[0].length;

        const rangeString = `\'${sheetname}\'!R${topRow}C${leftColumn}:R${topRow+rowSize}C${leftColumn+colSize}`;

        const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${rangeString}`;
        
        const builtUrl = buildUrl(endpoint,{
            queryParams: {
                valueInputOption: "RAW",
                includeValuesInResponse: false,
                responseValueRenderOption: "FORMATTED_VALUE",
                responseDateTimeRenderOption: "FORMATTED_STRING"
            }
        })

        const requestBody = {
            "majorDimension": "ROWS",
            "range": rangeString,
            "values": values
        }

        const response = this.gapi.put(builtUrl, requestBody);

        return response;
    }

    // 挿入するデータを対角線で折り返した順に指定する
    public setValuesVertical(id: string, sheetname: string, topRow: number, leftColumn: number, values: (number|string)[][]){
        const colSize = values.length;
        const rowSize = values[0].length;

        const rangeString = `\'${sheetname}\'!R${topRow}C${leftColumn}:R${topRow+rowSize}C${leftColumn+colSize}`;

        const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${rangeString}`;
        
        const builtUrl = buildUrl(endpoint,{
            queryParams: {
                valueInputOption: "RAW",
                includeValuesInResponse: false,
                responseValueRenderOption: "FORMATTED_VALUE",
                responseDateTimeRenderOption: "FORMATTED_STRING"
            }
        })

        const requestBody = {
            "majorDimension": "COLUMNS",
            "range": rangeString,
            "values": values
        }

        const response = this.gapi.put(builtUrl, requestBody);

        return response;
    }
}

export {GApi}