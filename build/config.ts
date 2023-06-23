import fs from "fs";
import path from "path";
import crpyto from "crypto";

const dbConfigs = {
  production: {
    db_url: process.env.PROD_DB_URL || "",
  },
  development: {
    db_url: process.env.DEV_DB_URL || "",
  },
  test: {
    db_url: process.env.TEST_DB_URL || "",
  },
};

function setDbUrl() {
  if (!process.env.DATABASE_URL) {
    const node_env = process.env.NODE_ENV || "development";
    console.log("node_env:", node_env);
    const db_url = dbConfigs[node_env as keyof typeof dbConfigs].db_url;
    console.log("db_url:", db_url);
    fs.appendFileSync(
      path.resolve(__dirname, "../.env"),
      `\nDATABASE_URL="${db_url}"\n`
    );
    process.env.DATABASE_URL = db_url;
  }
}

function setTokenConfig(tokenConfig: string) {
  if (!process.env.ACCESS_TOKEN || !process.env.REFRESH_TOKEN) {
    // generate random token
    const access = crpyto.randomBytes(64).toString("hex");
    const refresh = crpyto.randomBytes(64).toString("hex");
    // save in .env
    fs.appendFileSync(
      path.resolve(__dirname, "../.env"),
      `\nACCESS_TOKEN="${access}"\nREFRESH_TOKEN="${refresh}"\n`
    );
    // set env
    process.env.ACCESS_TOKEN = access;
    process.env.REFRESH_TOKEN = refresh;
  }
  const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
  const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
  fs.writeFile(
    tokenConfig,
    `export default {ACCESS_TOKEN: "${ACCESS_TOKEN}",REFRESH_TOKEN: "${REFRESH_TOKEN}"};`,
    "utf-8",
    (err) => {
      if (err) console.log(err);
    }
  );
}

export default async function setConfig(configDir: string) {
  // create config directory
  fs.mkdirSync(configDir, { recursive: true });
  const tokenConfig = path.resolve(configDir, "token.ts");

  setDbUrl();
  setTokenConfig(tokenConfig);
}
