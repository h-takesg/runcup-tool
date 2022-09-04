import { SummaryActivity } from "./StravaApi.ts";

export type StravaCertData = {
    clientId: number;
    clientSecret: string;
    refreshToken: string;
    accessToken: string;
    expiresAt: number;
};

export type GoogleCertData = {
    type: string;
    project_id: string;
    private_key_id: string;
    private_key: string;
    client_email: string;
    client_id: string;
    auth_uri: string;
    token_uri: string;
    auth_provider_x509_cert_url: string;
    client_x509_cert_url: string;
};

export type CupInfo = {
    clubId: string;
    sheetId: string;
    periodDays: number;
    periodNames: Array<string>;
}

export type PeriodData = {
    name: string;
    startMs: number;
    endMs: number;
    startActivity: SummaryActivity;
    columnNum: number;
    activityCount: number;
    sumDistance: number;
}