import bunyan from "bunyan";
import {appType} from "./envs";

export const logger = bunyan.createLogger({name: appType});
