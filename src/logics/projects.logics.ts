import { Request, Response } from "express";
import { QueryConfig } from "pg";
import format from "pg-format";

import { client } from "../database";
import { iProjectRequest, tAllowedValuesTechnology, tProjectResult, tProjectTechnologiesResult, tRequiredKeysProject, tTechnologyResult } from "../interfaces/projects.interfaces";

const createProject = async (req: Request, res:Response): Promise<Response> => {

    const { name, description, estimatedTime, repository, startDate, endDate, devId } = req.body;

    const reqData: iProjectRequest = {
        "name": name,
        "description": description,
        "estimatedTime": estimatedTime,
        "repository":repository ,
        "startDate": startDate,
        "endDate": endDate,
        "devId": devId
    };

    if (!endDate) {
        delete reqData.endDate;
    };

    const requiredKeys: tRequiredKeysProject[] = ["name", "description", "estimatedTime", "repository", "startDate", "devId"];

    const reqKeys: string [] = Object.keys(req.body);

    const hasRequiredKeys: boolean = requiredKeys.every((key) => {
        return reqKeys.includes(key);
    });

    if (!hasRequiredKeys) {
        return res.status(400).json({
            message: "The request is missing one or more required keys",
            keys: ["name", "description", "estimatedTime", "repository", "startDate", "devId"]
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

const addTechnology = async (req: Request, res: Response): Promise<Response> => {
    
    const projectId = parseInt(req.params.id);
    
    const { name } = req.body;

    const reqData = {
        name: name
    };

    if (!name) {
        return res.status(400).json({
            message: "name must be sent."
        });
    };

    const allowedValues: tAllowedValuesTechnology[] = ["CSS", "Django", "Express.js", "HTML", "JavaScript", "MongoDB", "PostgreSQL", "Python", "React"];

    const isAllowedValue = allowedValues.includes(name);

    if (!isAllowedValue) {
        return res.status(400).json({
            message: "Technology not allowed",
            options: allowedValues
        });
    };

    let queryString: string = `
        SELECT
            *
        FROM
            technologies
        WHERE
            name = $1;
    `;

    let queryConfig: QueryConfig = {
        text: queryString,
        values: [name]
    };

    const queryResult: tTechnologyResult = await client.query(queryConfig);

    // queryString = `
    //     INSERT INTO
    //         projects_technologies ()
        
    // `;

    return res.status(201).json();
};

export { createProject, listAllProjects };