import { Options } from "sequelize";

export interface DBConfig extends Options {
  username: string;
  password: string;
  database: string;
}

export default interface DBConfigs {
  [key: string]: DBConfig;
}
