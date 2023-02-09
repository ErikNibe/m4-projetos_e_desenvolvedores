import express, { Application } from "express";
import { startDatabase } from "./database";

import { createDev, createDevInfo, deleteDev, listAllDevs, listDev, updateDev, updateDevInfo } from "./logics/developers.logics";
import { verifyDevExists, verifyEmailExists, verifyPreferredOSValue } from "./middlewares/developers.middlewares";
import { addTechnology, createProject, deleteProject, deleteProjectTechnology, listAllProjects, listDevProjects, listProject, updateProject } from "./logics/projects.logics";
import { verifyDevExistsProjects, verifyProjectExists } from "./middlewares/projects.middlewares";

const app: Application = express();
app.use(express.json());

app.get("/developers", listAllDevs);
app.get("/developers/:id", verifyDevExists, listDev);
app.post("/developers", verifyEmailExists, createDev);
app.post("/developers/:id/infos", verifyDevExists, verifyPreferredOSValue, createDevInfo);
app.patch("/developers/:id", verifyDevExists, verifyEmailExists, updateDev);
app.patch("/developers/:id/infos", verifyDevExists, verifyPreferredOSValue, updateDevInfo);
app.delete("/developers/:id", verifyDevExists, deleteDev);

app.get("/projects", listAllProjects);
app.get("/projects/:id", verifyProjectExists, listProject);
app.post("/projects", verifyDevExistsProjects, createProject);
app.post("/projects/:id/technologies", verifyProjectExists, addTechnology);
app.patch("/projects/:id", verifyProjectExists, updateProject);
app.delete("/projects/:id", verifyProjectExists, deleteProject);
app.delete("/projects/:id/technologies/:name", verifyProjectExists, deleteProjectTechnology);

app.get("/developers/:id/projects", verifyDevExists, listDevProjects);

app.listen(3000, async () => {
    await startDatabase();
    console.log("Server is running!");
});