import { ConfigurationParamsStrict } from "../src/types/query";
import { simulationInitRequest } from "../src/core/helpers";

describe("test request builders", () => {
    test("test simulationInitRequest", () => {
        const mockConfigurationObject: ConfigurationParamsStrict = {
            principal: 100000,
            riskDecimal: 0.01,
            rewardDecimal: 0.03,
            winDecimal: 0.55,
            lossDecimal: 0.45,
            breakEvenDecimal: 0.25,
            numOfTrades: 50,
            numOfSimulations: 1000,
        };

        const expectedArr = [
            `principal: ${mockConfigurationObject.principal}`,
            `riskDecimal: ${mockConfigurationObject.riskDecimal}`,
            `rewardDecimal: ${mockConfigurationObject.rewardDecimal}`,
            `winDecimal: ${mockConfigurationObject.winDecimal}`,
            `lossDecimal: ${mockConfigurationObject.lossDecimal}`,
            `breakEvenDecimal: ${mockConfigurationObject.breakEvenDecimal}`,
            `numOfTrades: ${mockConfigurationObject.numOfTrades}`,
            `numOfSimulations: ${mockConfigurationObject.numOfSimulations}`,
        ];

        expect(simulationInitRequest(mockConfigurationObject)).toBe(
            `${expectedArr.join(", ")}`
        );
    });
});
