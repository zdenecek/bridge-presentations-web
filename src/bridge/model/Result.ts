import { Contract, ContractDoubledState } from "./Contract";
import { Position, PositionHelper, Side } from "./Position";
import { Vulnerability, VulnerabilityHelper } from "./Vulnerability";

import { Scoring } from "./Scoring";

export class Result {

    public readonly tricksNS?: number;
    public readonly contract: Contract;
    public readonly vul: boolean;

    public static  make(contract: Contract, vulnerability: Vulnerability, tricksNS?: number): Result {
        if(contract !== "passed")
            return new Result(contract, VulnerabilityHelper.IsVulnerable(contract.declarer, vulnerability), tricksNS);
        else
            return new Result("passed");
    }

    constructor(contract: Contract, vulnerable = false, tricksNS?: number) {
        this.contract = contract;
        this.vul =vulnerable;

        if(contract !== "passed") this.tricksNS = tricksNS;
    }

    public get declarersTricks(): number | undefined {
        if(this.contract === "passed") return undefined;
        return PositionHelper.side(this.contract.declarer) === Side.NS ? this.tricksNS : 13 - this.tricksNS!;
    }

    /**
     * Returns number of trict made relative to contract
     */
    public get madeTricks(): number | undefined {
        if(this.contract === "passed") return undefined;

        return this.contract.level + 6 - this.declarersTricks!;
    }


    public get scoreNS(): number {
        return Scoring.ScoreNS(this.contract, this.vul, this.madeTricks);
    }

    public get scoreDeclarer(): number {
        if(this.contract === "passed") return 0;
        return (PositionHelper.side(this.contract.declarer) === Side.NS ? 1 : -1) * this.scoreNS;
    }


}