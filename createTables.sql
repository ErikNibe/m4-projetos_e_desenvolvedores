CREATE TABLE IF NOT EXISTS developers_info (
	"id" SERIAL PRIMARY KEY,
	"developerSince" DATE NOT NULL,
	"preferredOS" "osTypes" NOT NULL
);

CREATE TABLE IF NOT EXISTS developers (
	"id" SERIAL PRIMARY KEY,
	"name" VARCHAR(50) NOT NULL,
	"email" VARCHAR(50) UNIQUE NOT NULL,
	"devInfoId" INTEGER UNIQUE,
	FOREIGN KEY ("devInfoId") REFERENCES developers_info("id") ON DELETE CASCADE
);
