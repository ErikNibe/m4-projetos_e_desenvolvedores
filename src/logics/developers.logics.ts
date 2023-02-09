import { Request, Response } from "express";
import { QueryConfig } from "pg";
import format from "pg-format";

import { client } from "../database";
import { createDevInfoRequiredKeys, createDevRequiredKeys, iDevInfoRequest, iDevRequest, tDevInfoFullResult, tDevInfoResult, tDevResult } from "../interfaces/developers.interfaces";

const createDev = async (req: Request, res: Response): Promise<Response> => {

    const { name, email } = req.body;
    
    const reqData: iDevRequest = {
        "name": name,
        "email": email
    };

    //Verify keys
    const requestKeys: string[] = Object.keys(req.body);
    const requiredKeys: createDevRequiredKeys[] = ["name", "email"];

    const hasRequiredKeys = requiredKeys.every((key) => {
        return requestKeys.includes(key);
    });
  
    if (!hasRequiredKeys) {
        return res.status(400).json({
            message: "The request must contain name and email"
        });
    };

    const queryString: string = format(
        `
            INSERT INTO
                developers (%I)
            VALUES (%L)
            RETURNING *;
        `,
        Object.keys(reqData),
        Object.values(reqData)
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
};

const updateDev = async (req: Request, res: Response): Promise<Response> => {

    const devId = parseInt(req.params.id);

    const reqData = {
        "name": req.body.name,
        "email": req.body.email
    };

    if (!req.body.name) {
        delete reqData.name;
    };

    if (!req.body.email) {
        delete reqData.email;
    };

    const requestKeys: string[] = Object.keys(reqData); 
    
    if (!requestKeys.length) {
        return res.status(400).json({
            message: "At least one of those keys must be sent.",
            keys: ["name", "email"]
        });
    };

    const queryString: string = format(
        `
            UPDATE
                developers
            SET (%I) = ROW(%L)
            WHERE
                id = $1
            RETURNING *;
        `,
        Object.keys(reqData),
        Object.values(reqData)
    );

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [devId]
    };

    const queryResult: tDevResult = await client.query(queryConfig);

    return res.status(200).json(queryResult.rows[0]);
};

const updateDevInfo = async (req: Request, res: Response): Promise<Response> => {

    const devId = parseInt(req.params.id);

    const reqData = {
        "developerSince": req.body.developerSince,
        "preferredOS": req.body.preferredOS
    };

    if (!req.body.developerSince) {
        delete reqData.developerSince;
    };
    
    if (!req.body.preferredOS) {
        delete reqData.preferredOS;
    };

    const requestKeys: string[] = Object.keys(reqData);

    if (!requestKeys.length) {
        return res.status(400).json({
            message: "At least one of those keys must be sent.",
            keys: ["developerSince", "preferredOS"]
        })
    };

    let queryString: string = `
        SELECT
            *
        FROM
            developers
        WHERE
            id = $1
    `;

    let queryConfig: QueryConfig = {
        text: queryString,
        values: [devId]
    }

    const queryResultDevInfoId: tDevResult = await client.query(queryConfig);

    queryString = format(
        `
            UPDATE
                developers_info
            SET (%I) = ROW (%L)
            WHERE
                id = $1
            RETURNING *;
        `,
        Object.keys(reqData),
        Object.values(reqData)
    )

    queryConfig = {
        text: queryString,
        values: [queryResultDevInfoId.rows[0].devInfoId]
    };

    const queryResult: tDevInfoResult = await client.query(queryConfig);

    return res.status(200).json(queryResult.rows[0]);
};

const deleteDev = async (req: Request, res: Response): Promise<Response> => {

    const devId: number = parseInt(req.params.id);

    let queryString: string = `
        SELECT
            *
        FROM
            developers
        WHERE
            id = $1;
    `;

    let queryConfig: QueryConfig = {
        text: queryString,
        values: [devId]
    };

    const queryResultDevInfoId: tDevResult = await client.query(queryConfig);

    if (!queryResultDevInfoId.rows[0].devInfoId) {
        queryString = `
            DELETE FROM
                developers
            WHERE
                id = $1;
        `;

        queryConfig = {
            text: queryString,
            values: [devId]
        };
    }
    else {
        queryString = `
            DELETE FROM
                developers_info
            WHERE 
                id = $1;
        `;
    
        queryConfig = {
            text: queryString,
            values: [queryResultDevInfoId.rows[0].devInfoId]
        };
    };

    await client.query(queryConfig);

    return res.status(204).send();
};

export { createDev, createDevInfo, listAllDevs, listDev, updateDev, updateDevInfo, deleteDev };