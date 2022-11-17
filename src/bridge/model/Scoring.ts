import { Contract, ContractDoubledState } from "./Contract";
import { PositionHelper, Side } from "./Position";

export class Scoring {

    private static doubles: Record<ContractDoubledState, number> = {
        "undoubled": 0,
        "doubled": 1,
        "redoubled": 2,
    }

    static ScoreNS(contract: Contract, vul: boolean, result?: number) : number {
        if (contract === "passed") return 0;
        
        const points =  this.Score(contract, vul, result);
        return (PositionHelper.side(contract.declarer) === Side.NS) ? points: -points;
    }

    static Score(contract: Contract, vul: boolean, result?: number): number {
        if (contract === "passed") return 0;

        if (!result) throw new Error("Cannot compute score");

        // Contract Points
        const points_contract = [
            [
                [20, 40, 80],
                [20, 40, 80],
            ],
            [
                [20, 40, 80],
                [20, 40, 80],
            ],
            [
                [30, 60, 120],
                [30, 60, 120],
            ],
            [
                [30, 60, 120],
                [30, 60, 120],
            ],
            [
                [40, 80, 160],
                [30, 60, 120],
            ],
        ];

        // Overtrick Points
        const overtrick = [
            [
                [20, 100, 200],
                [20, 200, 400],
            ],
            [
                [20, 100, 200],
                [20, 200, 400],
            ],
            [
                [30, 100, 200],
                [30, 200, 400],
            ],
            [
                [30, 100, 200],
                [30, 200, 400],
            ],
            [
                [30, 100, 200],
                [30, 200, 400],
            ],
        ];

        // Undertrick Points
        const undertricks = [
            [
                [50, 50, 50, 50],
                [100, 200, 200, 300],
                [200, 400, 400, 600],
            ],
            [
                [100, 100, 100, 100],
                [200, 300, 300, 300],
                [400, 600, 600, 600],
            ],
        ];

        // Bonus Points
        const bonus_game = [
            [50, 50],
            [300, 500],
        ];
        const bonus_slam = [
            [500, 750],
            [1000, 1500],
        ];
        const bonus_double = [0, 50, 100];

        const vuln = vul ? 1 : 0;    
    
        let points = 0;
        if (result >= 0) {
            if (contract.level == 1) points += points_contract[contract.suit -1][0][this.doubles[contract.dbl]];
            else if (contract.level > 1) {
                points += points_contract[contract.suit -1][0][this.doubles[contract.dbl]];
                points += (contract.level-1) * points_contract[contract.suit -1][1][this.doubles[contract.dbl]];
            }

            if (points < 100) points += bonus_game[0][vuln];
            else points += bonus_game[1][vuln];

            if (contract.level >= 6) points += bonus_slam[contract.level - 6][vuln];

            points += bonus_double[this.doubles[contract.dbl]];

            if (result > 0) points += result * overtrick[contract.suit -1][vuln][this.doubles[contract.dbl]];
        } else if (result < 0) {
            for (let i = 0; i < -result; i++) {
                const j = i > 3 ? 3 : i;
                points -= undertricks[vuln][this.doubles[contract.dbl]][j];
            }
        }
        return points;
    }
}
