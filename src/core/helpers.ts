import { config } from "dotenv/types";
import {
    ConfigurationParams,
    ConfigurationParamsStrict,
    SimulationResultParams,
} from "../types/query";

const parseQueryArgToString = (arr: Array<any>, separator: string) => {
    return arr.join(separator);
};

const parseMutationArgToString = (object: object, separator: string) => {
    const keys = Object.keys(object);
    const values = Object.values(object);
    const pairs: string[] = keys.map((key: string, index: number) => {
        return `${key}: ${values[index]}`;
    });
    return `${pairs.join(separator)}`;
};

export const configurationsRequest = (configParams: Array<any>) => {
    return parseQueryArgToString(configParams, "\n");
};

export const simulationsRequest = (simParams: Array<any>) => {
    return parseQueryArgToString(simParams, "\n");
};

export const simulationInitRequest = (simConfig: ConfigurationParamsStrict) => {
    return parseMutationArgToString(simConfig, "\n");
};
