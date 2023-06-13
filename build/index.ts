import path from "path";
import setConfig from "./config";

const root = path.resolve(__dirname, "../");
const configDir = path.resolve(root, "config");

setConfig(configDir);
