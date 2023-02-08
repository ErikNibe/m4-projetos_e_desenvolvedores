import { Request, Response, NextFunction } from "express";
import { QueryConfig } from "pg";
import { client } from "../database";

import { tDevResult } from "../interfaces/developers.interfaces";

const verifyDevExistsProjects = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    const { devId } = req.body;
    console.log(devId);

    if (!devId) {
        return res.status(400).json({
            message: "the devId must be informed."
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
        values: [devId]
    };

    const queryResult: tDevResult = await client.query(queryConfig);

    if (!queryResult.rowCount) {
        return res.status(404).json({
            message: "Dev not found."
        });
    };

    return next();
};

export { verifyDevExistsProjects };