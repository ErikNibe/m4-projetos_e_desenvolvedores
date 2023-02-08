import { Request, Response, NextFunction } from "express";
import { QueryConfig } from "pg";
import { client } from "../database";

import { osTypes, tDevResult } from "../interfaces/developers.interfaces";

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
};

const verifyEmailExists = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    const { email } = req.body;

    const queryString: string = `
        SELECT
            *
        FROM 
            developers
        WHERE
            email = $1;
    `;

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [email]
    };

    const queryResult: tDevResult = await client.query(queryConfig);

    if (queryResult.rowCount) {
        return res.status(409).json({
            message: "Email already exists, try another one."
        });
    };

    return next();
};

const verifyPreferredOSValue = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    
    if (req.body.preferredOS) {

        const allowedValues: osTypes[] = [osTypes.Windows, osTypes.Linux, osTypes.Macos ];

        const isAllowed = allowedValues.includes(req.body.preferredOS);
    
        if (!isAllowed) {
            return res.status(400).json({
                message: `preferredOS only allows these values: ${allowedValues}`
            });
        };
    }


    return next();
}; 

export { verifyDevExists, verifyPreferredOSValue, verifyEmailExists };