export interface ConfigurationParams {
    principal?: number;
    riskDecimal?: number;
    rewardDecimal?: number;
    winDecimal?: number;
    lossDecimal?: number;
    breakEvenDecimal?: number;
    numOfTrades?: number;
    numOfSimulations?: number;
}

export interface ConfigurationParamsStrict {
    principal: number;
    riskDecimal: number;
    rewardDecimal: number;
    winDecimal: number;
    lossDecimal: number;
    breakEvenDecimal: number;
    numOfTrades: number;
    numOfSimulations: number;
}

export interface SimulationResultParams {
    simID: string;
    maxPortfolio: number;
    minPortfolio: number;
}
