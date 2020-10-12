import * as express from "express";

require("isomorphic-fetch");

import {
    configurationsRequest,
    simulationsRequest,
    simulationInitRequest,
} from "./helpers";
import { authenticateToken } from "../auth/helpers";

const router = express.Router();

interface coreConfigurationsRequest extends express.Request {
    body: {
        principal: number;
        riskDecimal: number;
        rewardDecimal: number;
        winDecimal: number;
        lossDecimal: number;
        breakEvenDecimal: number;
        numOfTrades: number;
        numOfSimulations: number;
    };
}

interface coreQueryRequest extends express.Request {
    body: Array<any>;
}

interface coreSimOutputResponse {
    maxPortfolio: number;
    minPortfolio: number;
}

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
            res.status(500).send(
                "Something wrong happened with the simulation"
            );
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
            res.status(500).send(
                "Something wrong happened with the simulation"
            );
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
            res.status(500).send(
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
            res.status(500).send(
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
    async (req: coreConfigurationsRequest, res: express.Response) => {
        // Craft graphql request from client request
        const mutationParams = simulationInitRequest(req.body);

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
                            maxPortfolio,
                            minPortfolio
                        }
                    }
                }`,
                }),
            });

            const responseJSON = await response.json();

            res.status(200).send(responseJSON.data);
        } catch (error) {
            res.status(500).send(
                "Something wrong happened with the simulation"
            );
        }

        // Upon response from pyserver (which should be json), log request and response to database
        // Send json to client
    }
);

export default router;
