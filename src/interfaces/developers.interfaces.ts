import { QueryResult } from "pg";

interface iDevRequest {
    name: string,
    email: string
};

interface iDev extends iDevRequest {
    id: number,
    developerInfoId: null | number
};

type tDevResult = QueryResult<iDev>;

type createDevRequiredKeys = "name" | "email";

enum osTypes {
    Windows = "Windows",
    Linux = "Linux",
    Macos = "MacOS"
};

interface iDevInfoRequest {
    developerSince: Date,
    preferredOS: osTypes
};

interface iDevInfoResult extends iDevInfoRequest {
    id: number,
};

type tDevInfoResult = QueryResult<iDevInfoResult>;

type createDevInfoRequiredKeys = "developerSince" | "preferredOS";

type tDevInfo = iDev & iDevInfoRequest;
type tDevInfoFullResult= QueryResult<tDevInfo[]>;

export { 
    iDevRequest, 
    iDev, 
    tDevResult, 
    createDevRequiredKeys, 
    iDevInfoRequest, 
    tDevInfoResult,
    createDevInfoRequiredKeys,
    tDevInfoFullResult,
    osTypes 
};