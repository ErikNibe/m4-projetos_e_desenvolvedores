import { Request, Response } from "express";
import { QueryConfig } from "pg";
import format from "pg-format";

import { client } from "../database";
import { createDevInfoRequiredKeys, createDevRequiredKeys, iDevInfoRequest, iDevRequest, tDevInfoFullResult, tDevInfoResult, tDevResult } from "../interfaces/developers.interfaces";

const createDev = async (req: Request, res: Response): Promise<Response> => {

    const devData: iDevRequest = req.body;

    //Verify keys
    const requestKeys: string[] = Object.keys(devData);
    const requiredKeys: createDevRequiredKeys[] = ["name", "email"];

    const hasRequiredKeys = requiredKeys.every((key) => {
        return requestKeys.includes(key);
    });

    if (!hasRequiredKeys || requestKeys.length > requiredKeys.length) {
        return res.status(400).json({
            message: "The request must and should contain only name and email"
        })
    }

    //Verify if email already exist
    const queryStringVerify = `
        SELECT
            *
        FROM 
            developers
        WHERE
            email = $1;
    `;

    const queryConfigVerify: QueryConfig = {
        text: queryStringVerify,
        values: [devData.email]
    };

    const queryResultVerify: tDevResult = await client.query(queryConfigVerify);

    if (queryResultVerify.rowCount) {
        return res.status(409).json({
            message: "Email already exists, try another one."
        })
    }

    const queryString: string = format(
        `
            INSERT INTO
                developers (%I)
            VALUES (%L)
            RETURNING *;
        `,
        Object.keys(devData),
        Object.values(devData)
    );

    const queryResult: tDevResult = await client.query(queryString);
    
    return res.status(201).json(queryResult.rows[0]);
};

const createDevInfo = async (req: Request, res: Response): Promise<Response> => {

    const devId: number = parseInt(req.params.id);

    const devInfoData: iDevInfoRequest = {
        "developerSince": req.body.developerSince, 
        "preferredOS": req.body.preferredOS
    };

    // Verify keys
    const requestKeys: string[] = Object.keys(req.body);
    const requiredKeys: createDevInfoRequiredKeys[] = ["developerSince", "preferredOS"];

    const hasRequiredKeys = requiredKeys.every((key) => {
        return requestKeys.includes(key);
    });

    if (!hasRequiredKeys) {
        return res.status(400).json({
            message: "Request must contain developerSince and preferredOS"
        });
    };

    // Verify if dev already have devInfoId
    const queryStringVerify: string = `
        SELECT 
            *
        FROM
            developers 
        WHERE 
            id = $1;
    `;

    const queryConfigVerify: QueryConfig = {
        text: queryStringVerify,
        values: [devId]
    }

    const queryResultVerify: tDevResult = await client.query(queryConfigVerify);

    if (queryResultVerify.rows[0].devInfoId !== null) {
        return res.status(404).json({
            message: "Developer already have dev info."
        })
    };

    //Insert values
    let queryString: string = format(
        `
            INSERT INTO 
                developers_info (%I)
            VALUES (%L)
            RETURNING *;
        `,
        Object.keys(devInfoData),
        Object.values(devInfoData)
    )

    let queryResult: tDevInfoResult = await client.query(queryString);

    queryString = `
        UPDATE
            developers
        SET
            "devInfoId" = $1
        WHERE
            id = $2
        RETURNING *;
    `;

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [queryResult.rows[0].id, devId]
    };

    await client.query(queryConfig);

    return res.status(201).json(queryResult.rows[0]);
};

const listAllDevs = async (req: Request, res: Response): Promise<Response> => {

    const queryString = `
        SELECT 
            d.*,
            di."developerSince",
            di."preferredOS" 
        FROM
            developers d
        LEFT OUTER JOIN
            developers_info di ON d."devInfoId" = di.id;
    `;

    const queryResult: tDevInfoFullResult = await client.query(queryString);

    return res.json(queryResult.rows);
};

const listDev = async (req: Request, res: Response): Promise<Response> => {

    const devId: number = parseInt(req.params.id);

    const queryString: string = `
        SELECT
            d.*,
            di."developerSince",
            di."preferredOS"
        FROM
            developers d    
        LEFT OUTER JOIN
            developers_info di ON d."devInfoId" = di.id
        WHERE
            d.id = $1;  
    `;

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [devId]
    };

    const queryResult: tDevInfoFullResult = await client.query(queryConfig);

    return res.json(queryResult.rows[0]);
}

export { createDev, createDevInfo, listAllDevs, listDev };