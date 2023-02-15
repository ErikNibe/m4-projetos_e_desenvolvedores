import { QueryResult } from "pg";

interface iProjectRequest {
    name: string,
    description: string,
    estimatedTime: string,
    repository: string,
    startDate: Date,
    endDate?: Date,
    developerId: number
};

interface iProject extends iProjectRequest {
    id: number,
}

type tProjectResult = QueryResult<iProject>;

interface iProjectTechnologies extends iProject {
    addedIn: Date | null,
    technologyId: number | null,
    technologyName: string | null
};

interface iProjectTechnology {
    id: number,
    addedIn: Date,
    projectId: number,
    technologyId: number
};

type iProjectTechnologyResult = QueryResult<iProjectTechnology>;

type tProjectTechnologiesResult = QueryResult<iProjectTechnologies>;

type tRequiredKeysProject = "name" | "description" | "estimatedTime" | "repository" | "startDate" | "developerId";

type tAllowedValuesTechnology = "JavaScript" | "Python" | "React" | "Express.js" | "HTML" | "CSS" | "Django" | "PostgreSQL" | "MongoDB"; 

interface iTechnologyProjectRequest {
    name: string,
    addedIn: Date
};

interface iTechnology {
    id: number,
    name: string
};

type tTechnologyResult = QueryResult<iTechnology>;

interface iDevProjects {
    id: number,
    name: string,
    developerInfoId: number | null,
    developerSince: Date | null,
    preferredOS: string | null,
    projectId: number | null,
    projectName: string | null,
    description: string | null,
    estimatedTime: string | null,
    repository: string | null,
    startDate: Date | null,
    endDate?: Date | null,
    addedIn: Date | null,
    technologyId: number | null,
    technologyName: number | null
};

type tDevProjectsResult = QueryResult<iDevProjects>;

export { 
    iProjectRequest, 
    tProjectResult, 
    tRequiredKeysProject, 
    tProjectTechnologiesResult,
    tAllowedValuesTechnology,
    iTechnologyProjectRequest,
    tTechnologyResult,
    iProjectTechnologyResult,
    tDevProjectsResult
};