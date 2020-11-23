import * as express from "express";

require("isomorphic-fetch");

import {
  configurationsRequest,
  simulationsRequest,
  simulationInitRequest,
  craftIDGQLQuery,
  triggerQuery,
} from "./helpers";
import { authenticateToken, decodeToken } from "../auth/helpers";
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
        const response = await fetch(process.env["SIM_SERVER_URL"], {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `query ${query}`,
          }),
        });

        const responseJSON = await response.json();

        return res.status(200).send(responseJSON.data);
      } catch (error) {
        console.error(error);
        return res
          .status(500)
          .send("Something wrong happened with the simulation");
      }
    }
  }
);

router.delete("/mySimulations/:candidate", authenticateToken, async (req: express.Request, res: express.Response) => {
  const username = req.body.username;
  if (req.params.candidate) {
    if (username) {
      try {
        const userDoc = await User.findOne({ username });
        if (!userDoc) return res.status(404).send("Could not find user...");
        //@ts-ignore
        if (!userDoc.simulations) return res.status(404).send(`User ${username} has no simulations to delete`);
        //@ts-ignore
        const targetSimulation: [{ simName: string, simID: string }] = userDoc.simulations.filter((simulation: { simName: string, simID: string }) => {
          return simulation.simID === req.params.candidate;
        });
        if (!targetSimulation) return res.status(404).send(`Simulation ${req.params.candidate} no found in database`);
        //@ts-ignore
        userDoc.simulations = userDoc.simulations.filter((simulation: { simName: string, simID: string }) => {
          return simulation.simID === req.params.candidate;
        });
        await userDoc.save();
        return res.status(200).send(`Successfully deleted simulation: ${req.params.candidate} for user ${username}`);
      } catch (error) {
        console.error(error);
        return res.status(500).send(`Couldn't process request to delete simulation`);
      }
    }
  }
  return res.status(500).send(`Couldn't process request to delete simulation`);
})

router.post(
  "/simulations",
  authenticateToken,
  async (req: express.Request, res: express.Response) => {
    // Craft graphql request from client request
    const simParams = simulationsRequest(req.body);

    // Send graphql request to python graphql server and await response
    try {
      const response = await fetch(process.env["SIM_SERVER_URL"], {
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

      return res.status(200).send(responseJSON.data);
    } catch (error) {
      return res
        .status(500)
        .send("Something wrong happened with the simulation");
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
      const response = await fetch(process.env["SIM_SERVER_URL"], {
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

      return res.status(200).send(responseJSON.data);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .send("Something wrong happened with the simulation");
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
      const response = await fetch(process.env["SIM_SERVER_URL"], {
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

      return res.status(200).send(responseJSON.data);
    } catch (error) {
      return res
        .status(500)
        .send(
          `A simulation with the id: ${req.params["simID"]} could not be found.`
        );
    }
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
      const response = await fetch(process.env["SIM_SERVER_URL"], {
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

      return res.status(200).send(responseJSON.data);
    } catch (error) {
      return res
        .status(500)
        .send(
          `A configuration with the id: ${req.params["simID"]} could not be found.`
        );
    }
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
      const response = await fetch(process.env["SIM_SERVER_URL"], {
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

      const tokenPayload = decodeToken(req);

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
        }
      );

      return res.status(200).send(responseData);
    } catch (error) {
      return res
        .status(500)
        .send("Something wrong happened with the simulation");
    }
  }
);

export default router;
