CREATE TYPE "osTypes" AS ENUM ('Windows', 'Linux', 'MacOS');

CREATE TABLE IF NOT EXISTS developers_info (
	"id" SERIAL PRIMARY KEY,
	"developerSince" DATE NOT NULL,
	"preferredOS" "osTypes" NOT NULL
);

CREATE TABLE IF NOT EXISTS developers (
	"id" SERIAL PRIMARY KEY,
	"name" VARCHAR(50) NOT NULL,
	"email" VARCHAR(50) UNIQUE NOT NULL,
	"developerInfoId" INTEGER UNIQUE,
	FOREIGN KEY ("devInfoId") REFERENCES developers_info("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS projects (
	"id" SERIAL PRIMARY KEY,
	"name" VARCHAR(50) NOT NULL,
	"description" TEXT NOT NULL,
	"estimatedTime" VARCHAR(20) NOT NULL,
	"repository" VARCHAR(120) NOT NULL,
	"startDate" DATE NOT NULL,
	"endDate" DATE,
	"developerId" INTEGER NOT NULL,
	FOREIGN KEY ("devId") REFERENCES developers("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS technologies (
	"id" SERIAL PRIMARY KEY,
	"name" VARCHAR(30) NOT NULL
);

CREATE TABLE IF NOT EXISTS projects_technologies (
	"id" SERIAL PRIMARY KEY,
	"addedIn" DATE NOT NULL,
	"projectId" INTEGER,
	FOREIGN KEY ("projectId") REFERENCES projects("id") ON DELETE CASCADE,
	"technologyId" INTEGER,
	FOREIGN KEY ("technologyId") REFERENCES technologies("id") ON DELETE RESTRICT
);

INSERT INTO
	technologies ("name")
VALUES
	('JavaScript'),
	('Python'),
	('React'),
	('Express.js'),
	('HTML'),
	('CSS'),
	('Django'),
	('PostgreSQL'),
	('MongoDB');