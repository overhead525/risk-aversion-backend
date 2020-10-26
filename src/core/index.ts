import * as express from "express";
import * as mongoose from "mongoose";
import * as jwt from "jsonwebtoken";
import * as fs from "fs";

require("isomorphic-fetch");

import {
  configurationsRequest,
  simulationsRequest,
  simulationInitRequest,
  craftIDGQLQuery,
  triggerQuery,
} from "./helpers";
import { authenticateToken, decodeToken } from "../auth/helpers";
import { useDB } from "../../database";
import { User, UserDocument } from "../models";
import { getUserSimIDs } from "./helpers";

const router = express.Router();

interface coreConfigurationsRequest extends express.Request {
  body: {
    simName: string;
    params: {
      principal: number;
      riskDecimal: number;
      rewardDecimal: number;
      winDecimal: number;
      lossDecimal: number;
      breakEvenDecimal: number;
      numOfTrades: number;
      numOfSimulations: number;
    };
  };
}

interface coreQueryRequest extends express.Request {
  body: Array<any>;
}

interface coreSimOutputResponse {
  simulate: {
    result: {
      simID: string;
      maxPortfolio: number;
      minPortfolio: number;
    };
  };
}

router.get(
  "/mySimulations/:get",
  authenticateToken,
  triggerQuery,
  getUserSimIDs,
  craftIDGQLQuery,
  async (req: express.Request, res: express.Response) => {
    if (res.locals.query) {
      const query: string = res.locals.query;
      try {
        const response = await fetch(process.env["CORE_SERVER_URL"], {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `query ${query}`,
          }),
        });

        const responseJSON = await response.json();

        res.status(200).send(responseJSON.data);
      } catch (error) {
        res.status(500).send("Something wrong happened with the simulation");
      }
    }
  }
);

router.delete(
  "/mySimulations/:simID",
  authenticateToken,
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.params.simID) {
      const authHeader = req.headers["authorization"]; // Expecting something like: "Bearer <accessToken> <refreshToken>"
      const accessToken = authHeader.split(" ")[1];

      const username = jwt.decode(accessToken)["name"];

      try {
        useDB(async () => {
          const user = await User.findOne({ username: username });
          if (user) {
            // @ts-ignore
            user.simulations = user.simulations.filter((simulation) => {
              return simulation.simID !== req.params.simID;
            });
            await user.save();
            return res
              .status(200)
              .send(
                `Successfully deleted simID: ${req.params.simID} for user: ${username}`
              );
          }
          return res
            .status(404)
            .send(`Could not find a user with username: ${username}`);
        });
      } catch (error) {
        return res
          .status(500)
          .send(
            `Could not delete simulation: ${req.params.simID} for user: ${username}...something went wrong`
          );
      }
    }
  }
);

router.post(
  "/simulations",
  authenticateToken,
  async (req: express.Request, res: express.Response) => {
    // Craft graphql request from client request
    const simParams = simulationsRequest(req.body);

    // Send graphql request to python graphql server and await response
    try {
      const response = await fetch(process.env["CORE_SERVER_URL"], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `query { 
                        allSimulationResults {
                            ${simParams}
                        }
                    }`,
        }),
      });

      const responseJSON = await response.json();

      res.status(200).send(responseJSON.data);
    } catch (error) {
      res.status(500).send("Something wrong happened with the simulation");
    }
  }
);

router.post(
  "/configurations",
  authenticateToken,
  async (req: express.Request, res: express.Response) => {
    // Craft graphql request from client request
    const configurationParams = configurationsRequest(req.body);

    // Send graphql request to python graphql server and await response
    try {
      const response = await fetch(process.env["CORE_SERVER_URL"], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `query { 
                        allConfigurations {
                            ${configurationParams}
                        }
                    }`,
        }),
      });

      const responseJSON = await response.json();

      res.status(200).send(responseJSON.data);
    } catch (error) {
      res.status(500).send("Something wrong happened with the simulation");
    }
  }
);

router.post(
  "/simulations/:simID",
  authenticateToken,
  async (req: express.Request, res: express.Response) => {
    // Craft graphql request from client request
    const simIDRequestParams = simulationsRequest(req.body);

    // Send graphql request to python graphql server and await response
    try {
      const response = await fetch("http://localhost:8000/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `query { 
                    simulationResultById(
                        simID: "${req.params["simID"]}"
                    ) { 
                        ${simIDRequestParams}
                    }
                }`,
        }),
      });

      const responseJSON = await response.json();

      res.status(200).send(responseJSON.data);
    } catch (error) {
      res
        .status(500)
        .send(
          `A simulation with the id: ${req.params["simID"]} could not be found.`
        );
    }

    // Upon response from pyserver (which should be json), log request and response to database
    // Send json to client
  }
);

router.post(
  "/configurations/:simID",
  authenticateToken,
  async (req: express.Request, res: express.Response) => {
    // Craft graphql request from client request
    const simIDRequestParams = configurationsRequest(req.body);

    // Send graphql request to python graphql server and await response
    try {
      const response = await fetch("http://localhost:8000/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `query { 
                    configurationById(
                        simID: "${req.params["simID"]}"
                    ) { 
                        ${simIDRequestParams}
                    }
                }`,
        }),
      });

      const responseJSON = await response.json();

      res.status(200).send(responseJSON.data);
    } catch (error) {
      res
        .status(500)
        .send(
          `A configuration with the id: ${req.params["simID"]} could not be found.`
        );
    }

    // Upon response from pyserver (which should be json), log request and response to database
    // Send json to client
  }
);

router.post(
  "/init",
  authenticateToken,
  async (
    req: coreConfigurationsRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    // Craft graphql request from client request
    const mutationParams = simulationInitRequest(req.body.params);

    // Send graphql request to python graphql server and await response
    try {
      const response = await fetch(process.env["CORE_SERVER_URL"], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `mutation { 
                    simulate(
                        ${mutationParams}
                    ) { 
                        result {
                            simID,
                            maxPortfolio,
                            minPortfolio
                        }
                    }
                }`,
        }),
      });

      const responseJSON = await response.json();
      const responseData: coreSimOutputResponse = responseJSON.data;

      const response2 = await fetch(
        `${process.env["RESOURCE_SERVER_URL"]}/image/${responseData.simulate.result.simID}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env["PERMANENT_ACCESS_TOKEN"]}`,
          },
        }
      );
      console.log(response2);

      const tokenPayload = decodeToken(req);

      useDB(() => {
        User.findOne(
          { username: tokenPayload["name"] },
          async (err, userDoc: UserDocument) => {
            if (err) return next(err);
            if (!userDoc) {
              res.status(404).json("user not found");
              return next(err);
            }
            const currentUserSimulations = userDoc.get("simulations");
            const newUserSimulationsArr = [
              ...currentUserSimulations,
              {
                simName: req.body.simName,
                simID: responseData.simulate.result.simID,
              },
            ];
            // @ts-ignore
            userDoc.simulations = newUserSimulationsArr;
            await userDoc.save();
            await mongoose.connection.close();
          }
        );
      });

      res.status(200).send(responseData);
    } catch (error) {
      res.status(500).send("Something wrong happened with the simulation");
    }

    // Upon response from pyserver (which should be json), log request and response to database
    // Send json to client
  }
);

export default router;
