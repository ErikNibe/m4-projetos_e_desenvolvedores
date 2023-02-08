import express, { Application } from "express";
import { startDatabase } from "./database";

import { createDev, createDevInfo, deleteDev, listAllDevs, listDev, updateDev, updateDevInfo } from "./logics/developers.logics";
import { verifyDevExists, verifyEmailExists, verifyPreferredOSValue } from "./middlewares/developers.middlewares";
import { createProject, listAllProjects } from "./logics/projects.logics";
import { verifyDevExistsProjects } from "./middlewares/projects.middlewares";

const app: Application = express();
app.use(express.json());

app.post("/developers", verifyEmailExists, createDev);
app.post("/developers/:id/infos", verifyDevExists, verifyPreferredOSValue, createDevInfo);
app.get("/developers", listAllDevs);
app.get("/developers/:id", verifyDevExists, listDev);
app.patch("/developers/:id", verifyDevExists, verifyEmailExists, updateDev);
app.patch("/developers/:id/infos", verifyDevExists, verifyPreferredOSValue, updateDevInfo);
app.delete("/developers/:id", verifyDevExists, deleteDev);

app.post("/projects", verifyDevExistsProjects, createProject);
app.get("/projects", listAllProjects);

app.listen(3000, async () => {
    await startDatabase();
    console.log("Server is running!");
});