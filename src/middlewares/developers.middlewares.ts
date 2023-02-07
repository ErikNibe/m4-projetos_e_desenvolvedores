import { Request, Response, NextFunction } from "express";
import { QueryConfig } from "pg";
import { client } from "../database";

import { tDevResult } from "../interfaces/developers.interfaces";

const verifyDevExists = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    const devId: number = parseInt(req.params.id);

    const queryString = `
        SELECT
            *
        FROM
            developers
        WHERE
            id = $1;
    `;

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [devId]
    };

    const queryResult: tDevResult = await client.query(queryConfig);

    if (!queryResult.rowCount) {
        return res.status(404).json({
            message: "Developer not found."
        });
    };
    
    return next();
} 

export { verifyDevExists };