import * as express from "express";
import * as axios from "axios";

import coreClient from "../core/client";

const router = express.Router();

interface coreSimRequest extends express.Request {
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

interface coreSimOutputResponse {
    maxPortfolio: number;
    minPortfolio: number;
}

// /core/init
router.post("/", async (req: coreSimRequest, res: express.Response) => {
    // Craft graphql request from client request
    const coreGQLRequest = `
    {
        configurationById(simID: "b5e83578-6f28-4d3f-82ea-ed3aeb27fa0b") {
          principal
          winDecimal
          rewardDecimal
          breakEvenDecimal
          numOfTrades
        }
      }
    `;
    try {
        const rawData = await coreClient.post("", coreGQLRequest);
        console.log(rawData);
    } catch (error) {
        console.error(error);
    }
    console.log("REQUEST SENT");

    // Send graphql request to python graphql server and await response
    // Upon response from pyserver (which should be json), log request and response to database
    // Send json to client
});

export default router;
