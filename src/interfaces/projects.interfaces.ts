import { QueryResult } from "pg";

interface iProjectRequest {
    name: string,
    description: string,
    estimatedTime: string,
    repository: string,
    startDate: Date,
    endDate?: Date,
    devId: number
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

type tProjectTechnologiesResult = QueryResult<iProjectTechnologies>;

type tRequiredKeysProject = "name" | "description" | "estimatedTime" | "repository" | "startDate" | "devId";

type tAllowedValuesTechnology = "JavaScript" | "Python" | "React" | "Express.js" | "HTML" | "CSS" | "Django" | "PostgreSQL" | "MongoDB"; 

interface iTechnology {
    id: number,
    name: string
};

type tTechnologyResult = QueryResult<iTechnology>;

export { 
    iProjectRequest, 
    tProjectResult, 
    tRequiredKeysProject, 
    tProjectTechnologiesResult,
    tAllowedValuesTechnology,
    tTechnologyResult 
};