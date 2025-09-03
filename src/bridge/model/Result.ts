import { Contract } from "./Contract";
import { PositionHelper, Side } from "./Position";
import { Vulnerability, VulnerabilityHelper } from "./Vulnerability";

import { Scoring } from "./Scoring";
import errorMessage from "../utils/throw";

export class Result {
  public readonly tricksMade?: number;
  public readonly contract: Contract;
  public readonly vul: boolean;

  public static make(
    contract: Contract,
    vulnerability: Vulnerability,
    tricksMade?: number,
  ): Result {
    if (contract !== "passed")
      return new Result(
        contract,
        VulnerabilityHelper.IsVulnerable(contract.declarer, vulnerability),
        tricksMade,
      );
    else return new Result("passed");
  }

  constructor(contract: Contract, vulnerable = false, tricksMade?: number) {
    this.contract = contract;
    this.vul = vulnerable;

    if (contract !== "passed") this.tricksMade = tricksMade;
  }

  public get score(): number {
    return Scoring.Score(this.contract, this.vul, this.tricksMade);
  }

  public get scoreNS(): number {
    if (this.contract === "passed") return 0;
    return (
      (PositionHelper.side(this.contract.declarer) === Side.NS ? 1 : -1) *
      this.score
    );
  }

  public get tricksMadeRelative(): number {
    if (this.contract === "passed") return 0;
    if (!this.tricksMade)
      errorMessage("Invalid Result state: tricksMade is undefined");
    return this.tricksMade - this.contract.level - 6;
  }

  public get resultString(): string {
    const c = this.tricksMadeRelative;
    return c === 0 ? "=" : c > 0 ? "+" + c.toString() : c.toString();
  }
}
