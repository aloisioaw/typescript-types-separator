#!/usr/bin/env node

import * as core from "./core";
import { Config } from "./config";
import { readFileSync } from "fs";

const configFileStr: string = readFileSync("./types-separator.json").toString();
const config: Config = JSON.parse(configFileStr);

core.process(config);
