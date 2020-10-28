import { ConfigurationParamsStrict } from "../types/query";
import * as _ from "lodash";

require("isomorphic-fetch");

import { Request, Response, NextFunction } from "express";
import { decode } from "jsonwebtoken";
import { User, UserDocument } from "../models";

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

export const triggerQuery = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.params.get === "simulations" || req.params.get === "configurations") {
    res.locals.trigger = req.params.get;
  }
  return next();
};

export const getUserSimIDs = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"]; // Expecting something like: "Bearer <accessToken> <refreshToken>"
  const accessToken = authHeader.split(" ")[1];

  const username = decode(accessToken)["name"];

  User.findOne({ username: username }, async (err, userDoc: UserDocument) => {
    if (err) return (res.locals.error = err);
    const userSimIDs = userDoc.simulations;
    res.locals.userSimIDs = userSimIDs;
    return next();
  });
};

export const craftIDGQLQuery = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.locals.userSimIDs) {
    const simIDs: Array<{
      _id: any;
      simName: string;
      simID: string;
    }> = res.locals.userSimIDs;
    let queryBody = "";
    let trigger = "";
    if (res.locals.trigger === "simulations") {
      trigger = "simulationResultById";
      simIDs.forEach((obj, index) => {
        const parsedSimName = _.camelCase(obj.simName);
        const queryAddition = `${parsedSimName}_${index}: ${trigger}(simID: "${obj.simID}") {
                    simID
                    maxPortfolio
                    minPortfolio
                }
                `;
        queryBody += queryAddition;
      });
    }
    if (res.locals.trigger === "configurations") {
      trigger = "configurationById";
      simIDs.forEach((obj, index) => {
        const queryAddition = `${obj.simName}_${index}: ${trigger}(simID: "${obj.simID}") {
                    principal
                    riskDecimal
                    rewardDecimal
                    winDecimal
                    lossDecimal
                    breakEvenDecimal
                    numOfTrades
                    numOfSimulations
                }
                `;
        queryBody += queryAddition;
      });
    }
    const query = `{\n${queryBody}}`;
    res.locals.query = query;
  }
  return next();
};
