import { config } from "dotenv";
config();

// You must have the core server running
// Run the following command:
// $ npm run dev

import { coreSimOutputResponse } from "../../src/core";

require("isomorphic-fetch");

describe("can we delete simulations from the database?", () => {
  test("delete a recently generated simulation result", async () => {
    try {
      const response = await fetch(`${process.env["CORE_SERVER_URL"]}/init`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env["PERMANENT_ACCESS_TOKEN"]}`,
        },
        body: JSON.stringify({
          simName: "tradingUp",
          params: {
            principal: 100000,
            riskDecimal: 0.01,
            rewardDecimal: 0.03,
            winDecimal: 0.55,
            lossDecimal: 0.45,
            breakEvenDecimal: 0.25,
            numOfTrades: 50,
            numOfSimulations: 1000,
          },
        }),
      });

      const responseJSON = await response.json();
      const responseData: coreSimOutputResponse = responseJSON.data;
      const simID = responseData.simulate.result.simID;

      const response2 = await fetch(
        `${process.env["CORE_SERVER_URL"]}/mySimulations/${simID}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env["PERMANENT_ACCESS_TOKEN"]}`,
          },
        }
      );

      const response2JSON = await response2.json();
    } catch (error) {
      console.error(error);
    }
  });
});
