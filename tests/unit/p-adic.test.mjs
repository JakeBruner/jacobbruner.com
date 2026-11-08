import test from "node:test";
import assert from "node:assert/strict";
import { calcLast50Digits } from "../../src/routes/(navbar)/p-adic/padic.ts";

test("the displayed p-adic rows contain the final fifty digits, not the leading digits", () => {
  for (const exponent of [0n, 1n, 10n, 100n, 1000n, 10000n]) {
    assert.equal(calcLast50Digits(exponent), (2n ** exponent).toString().slice(-50));
  }
});
