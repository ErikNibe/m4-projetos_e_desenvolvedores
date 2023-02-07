import express, { Application } from "express";
import { startDatabase } from "./database";

import { createDev, createDevInfo, listAllDevs, listDev } from "./logics/developers.logics";
import { verifyDevExists } from "./middlewares/developers.middlewares";

const app: Application = express();
app.use(express.json());

app.post("/developers", createDev);
app.post("/developers/:id/infos", verifyDevExists, createDevInfo);
app.get("/developers", listAllDevs);
app.get("/developers/:id", verifyDevExists, listDev);

app.listen(3000, async () => {
    await startDatabase();
    console.log("Server is running!");
});