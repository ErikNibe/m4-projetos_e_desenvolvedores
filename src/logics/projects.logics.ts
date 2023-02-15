import { Request, Response } from "express";
import { QueryConfig } from "pg";
import format from "pg-format";

import { client } from "../database";
import { iProjectRequest, iProjectTechnologyResult, iTechnologyProjectRequest, tAllowedValuesTechnology, tDevProjectsResult, tProjectResult, tProjectTechnologiesResult, tRequiredKeysProject, tTechnologyResult } from "../interfaces/projects.interfaces";

const listAllProjects = async (req: Request, res: Response): Promise<Response> => {

    const queryString: string = `
        SELECT 
            p.*,
            pt."addedIn",
            pt."technologyId",
            t."name" AS "technologyName"  
        FROM 
            projects p 
        LEFT JOIN
            projects_technologies pt ON p.id = pt."projectId"
        LEFT JOIN 
            technologies t ON pt."technologyId" = t.id; 
    `;

    const queryResult: tProjectTechnologiesResult = await client.query(queryString);

    return res.status(200).json(queryResult.rows);
};

const listProject = async (req: Request, res: Response): Promise<Response> => {

    const projectId: number = parseInt(req.params.id);

    const queryString: string = `
        SELECT 
            p.*,
            pt."addedIn",
            pt."technologyId",
            t."name" AS "technologyName" 
        FROM 
            projects p 
        LEFT JOIN
            projects_technologies pt ON p.id = pt."projectId"
        LEFT JOIN 
            technologies t ON pt."technologyId" = t.id
        WHERE 
            p.id = $1;
    `;

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [projectId]
    };

    const queryResult: tProjectTechnologiesResult = await client.query(queryConfig);

    return res.status(200).json(queryResult.rows);
};

const createProject = async (req: Request, res:Response): Promise<Response> => {

    const { name, description, estimatedTime, repository, startDate, endDate, developerId } = req.body;

    const reqData: iProjectRequest = {
        "name": name,
        "description": description,
        "estimatedTime": estimatedTime,
        "repository":repository ,
        "startDate": startDate,
        "endDate": endDate,
        "developerId": developerId
    };

    if (!endDate) {
        delete reqData.endDate;
    };

    const requiredKeys: tRequiredKeysProject[] = ["name", "description", "estimatedTime", "repository", "startDate", "developerId"];

    const reqKeys: string [] = Object.keys(req.body);

    const hasRequiredKeys: boolean = requiredKeys.every((key) => {
        return reqKeys.includes(key);
    });

    if (!hasRequiredKeys) {

        const missingKeys = requiredKeys.filter((key) => {
            if (!reqKeys.includes(key)) {
                return key;
            }
        });

        return res.status(400).json({
            message: "The request is missing one or more required keys",
            missingKeys: missingKeys
        });
    };

    const queryString: string = format(
        `
            INSERT INTO
                projects (%I)
            VALUES (%L)
            RETURNING *;
        `,
        Object.keys(reqData),
        Object.values(reqData)
    );

    const queryResult: tProjectResult = await client.query(queryString);

    return res.status(201).json(queryResult.rows[0]);
};

const addTechnology = async (req: Request, res: Response): Promise<Response> => {
    
    const projectId: number = parseInt(req.params.id);
    
    const { name, addedIn } = req.body;

    const reqData: iTechnologyProjectRequest = {
        name: name,
        addedIn: addedIn
    };

    // Verify required keys
    if (!name || !addedIn) {
        return res.status(400).json({
            message: "Request must contain required keys",
            keys: Object.keys(reqData)
        });
    };

    // Verify allowed values for technology
    const allowedValues: tAllowedValuesTechnology[] = ["CSS", "Django", "Express.js", "HTML", "JavaScript", "MongoDB", "PostgreSQL", "Python", "React"];

    const isAllowedValue = allowedValues.includes(name);

    if (!isAllowedValue) {
        return res.status(400).json({
            message: "Technology not allowed",
            options: allowedValues
        });
    };

    // Retrive technology id
    let queryString: string = `
        SELECT
            *
        FROM
            technologies
        WHERE
            "name" = $1;
    `;

    let queryConfig: QueryConfig = {
        text: queryString,
        values: [name]
    };

    const queryResultTechnology: tTechnologyResult = await client.query(queryConfig);

    // Verify if technology is already registrated in the project
    const queryStringVerifyTechnologyProject: string = `
        SELECT
            *
        FROM
            projects_technologies pt
        WHERE
            "projectId" = $1 AND "technologyId" = $2;
    `;

    const queryConfigVerifyTechnologyProject: QueryConfig = {
        text: queryStringVerifyTechnologyProject,
        values: [projectId, queryResultTechnology.rows[0].id]
    }

    const queryResultVerifyTechnologyProject: iProjectTechnologyResult = await client.query(queryConfigVerifyTechnologyProject);

    if (queryResultVerifyTechnologyProject.rowCount) {
        return res.status(400).json({
            message: "This name is already registred in this project, try another one."
        });
    };

    queryString = `
        INSERT INTO
            projects_technologies ("addedIn", "projectId", "technologyId")
        VALUES
            ($1, $2, $3); 
    `;

    queryConfig = {
        text: queryString,
        values: [addedIn, projectId, queryResultTechnology.rows[0].id]
    };

    await client.query(queryConfig);

    queryString = `
        SELECT 
            p.*,
            pt."addedIn",
            pt."technologyId",
            t."name" AS "technologyName" 
        FROM 
            projects p 
        LEFT JOIN
            projects_technologies pt ON p.id = pt."projectId"
        LEFT JOIN 
            technologies t ON pt."technologyId" = t.id
        WHERE 
            pt."technologyId" = $1 AND p.id = $2;    
    `;

    queryConfig = {
        text: queryString,
        values: [queryResultTechnology.rows[0].id, projectId]
    };

    const queryResult: tProjectTechnologiesResult = await client.query(queryConfig);

    return res.status(201).json(queryResult.rows[0]);
};

const updateProject = async (req: Request, res: Response): Promise<Response> => {

    const projectId: number = parseInt(req.params.id);

    const reqData = req.body;

    const reqkeys: string[] = Object.keys(reqData);
    const allowedKeys: string[] = ["description", "estimatedTime", "name", "repository", "startDate", "endDate"];

    reqkeys.forEach((key) => {
        if (!allowedKeys.includes(key)) {
            delete reqData[key]
        };
    });

    if (!Object.keys(reqData).length) {
        return res.status(400).json({
            message: "At least one of those keys must be sent.",
            keys: allowedKeys
        });
    };

    const queryString = format(
        `
            UPDATE
                projects
            SET (%I) = ROW (%L)
            WHERE
                id = $1
            RETURNING *;
        `,
        Object.keys(reqData),
        Object.values(reqData)
    );

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [projectId]
    };

    const queryResult: tProjectResult = await client.query(queryConfig);

    return res.status(200).json(queryResult.rows[0]);
};

const deleteProject = async (req: Request, res: Response): Promise<Response> => {

    const projectId: number = parseInt(req.params.id);

    const queryString: string = `
        DELETE FROM
            projects
        WHERE
            id = $1;
    `;

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [projectId]
    };

    await client.query(queryConfig);

    return res.status(204).send();
};

const listDevProjects = async (req: Request, res: Response): Promise<Response> => {

    const devId: number = parseInt(req.params.id);

    const queryString: string = `
        SELECT 
            d.*,
            di."developerSince",
            di."preferredOS",
            p.id AS "projectId",
            p."name" AS "projectName",
            p."description" AS "projectDescription",
            p."estimatedTime",
            p."repository",
            p."startDate",
            p."endDate",
            pt."addedIn",
            pt."technologyId",
            t."name" AS "technologyName" 
        FROM 	
            developers d
        LEFT JOIN
            developers_info di ON d."developerInfoId" = di.id
        LEFT JOIN
            projects p ON d.id = p."developerId"
        LEFT JOIN
            projects_technologies pt ON p.id = pt."projectId"
        LEFT JOIN 
            technologies t ON pt."technologyId" = t.id
        WHERE 
            d.id = $1;
    `;

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [devId]
    };

    const queryResult: tDevProjectsResult = await client.query(queryConfig);

    if (!queryResult.rows[0].projectId) {
        return res.status(404).json({
            message: "The developer does not have any projects yet."
        });
    };

    return res.status(200).json(queryResult.rows);
};

const deleteProjectTechnology = async (req: Request, res: Response): Promise<Response> => {

    const projectId: number = parseInt(req.params.id);
    const technologyName: string = req.params.name;

    const queryStringVerifyTechExists: string = `
        SELECT
            *
        FROM
            technologies
        WHERE
            "name" = $1;
    `;

    const queryConfigVerifyTechExists: QueryConfig = {
        text: queryStringVerifyTechExists,
        values: [technologyName]
    };

    const queryResultVerifyTechExists: tTechnologyResult = await client.query(queryConfigVerifyTechExists);

    const allowedValues: tAllowedValuesTechnology[] = ["CSS", "Django", "Express.js", "HTML", "JavaScript", "MongoDB", "PostgreSQL", "Python", "React"];

    if (!queryResultVerifyTechExists.rowCount) {
        return res.status(404).json({
            message: "Technology not supported",
            options: allowedValues
        });
    };

    let queryString: string = `
        SELECT
            *
        FROM
            projects_technologies
        WHERE
            "projectId" = $1 AND "technologyId" = $2;
    `;

    let queryConfig: QueryConfig = {
        text: queryString,
        values: [projectId, queryResultVerifyTechExists.rows[0].id]
    };

    const queryResult = await client.query(queryConfig);

    if (!queryResult.rowCount) {
        return res.status(404).json({
            message: `Technology ${technologyName} not found on this project.`
        });
    };

    queryString = `
        DELETE FROM 
            projects_technologies
        WHERE
            "projectId" = $1 AND "technologyId" = $2;
    `;

    queryConfig = {
        text: queryString,
        values: [projectId, queryResultVerifyTechExists.rows[0].id]
    };

    await client.query(queryConfig);

    return res.status(204).send();
};

export { createProject, listAllProjects, listProject, addTechnology, updateProject, deleteProject, listDevProjects, deleteProjectTechnology };