import { Request, Response, NextFunction } from "express";
import { QueryConfig } from "pg";
import { client } from "../database";

import { tDevResult } from "../interfaces/developers.interfaces";
import { tProjectResult } from "../interfaces/projects.interfaces";

const verifyDevExistsProjects = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    const { developerId } = req.body;
  

    if (!developerId) {
        return res.status(400).json({
            message: "the developerId must be informed."
        });
    };

    const queryString: string = `
        SELECT
            *
        FROM
            developers
        WHERE
            id = $1;
    `;

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [developerId]
    };

    const queryResult: tDevResult = await client.query(queryConfig);

    if (!queryResult.rowCount) {
        return res.status(404).json({
            message: "Dev not found."
        });
    };

    return next();
};

const verifyProjectExists = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    const projectId: number = parseInt(req.params.id);

    const queryString: string = `
        SELECT
            *
        FROM
            projects
        WHERE
            id = $1;
    `;

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [projectId]
    };

    const queryResult: tProjectResult = await client.query(queryConfig);

    if (!queryResult.rowCount) {
        return res.status(404).json({
            message: "Project not found."
        });
    };

    return next();
};

export { verifyDevExistsProjects, verifyProjectExists };