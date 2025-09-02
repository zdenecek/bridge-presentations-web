import { Contract } from "@/bridge/model/Contract";
import { Position, PositionHelper } from "@/bridge/model/Position";
import { Suit } from "@/bridge/model/Suit";
import { Vulnerability } from "@/bridge/model/Vulnerability";
import { DummyOptions } from "@/bridge/model/PresentationGame";

export interface ConfiguratorOptions {
  cards: {
    north: string;
    east: string;
    south: string;
    west: string;
  };
  fake: { ns: number; ew: number };
  firstPlayer: Position;
  bidding: boolean;
  contract: Contract | undefined;
  trumps: Suit | undefined;
  dummy: DummyOptions | undefined;
  staticDummyPosition: Position | undefined;
  vulnerability: Vulnerability;
  activePositions: Array<Position>;
}

export function normalizeConfiguratorOptions(
  obj: unknown,
): ConfiguratorOptions {
  const result = {
    cards: {
      north: "",
      east: "",
      south: "",
      west: "",
    },
    fake: { ns: 0, ew: 0 },
    firstPlayer: Position.West,
    bidding: true,
    contract: undefined,
    trumps: undefined,
    dummy: undefined,
    staticDummyPosition: undefined,
    vulnerability: Vulnerability.None,
    activePositions: PositionHelper.all(),
  };

  Object.assign(result, obj);
  return result;
}

export function validateConfiguratorOptions(
  opts: ConfiguratorOptions,
): Record<string, string | Record<string, string>> {
  const errors = [] as Array<Record<string, string | Record<string, string>>>;

  if (!opts.activePositions.includes(opts.firstPlayer))
    errors.push({ firstPlayer: "First player must be active" });

  return errors.reduce((acc, cur) => ({ ...acc, ...cur }), {});
}
