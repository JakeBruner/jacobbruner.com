import test from "node:test";
import assert from "node:assert/strict";
import { isPrime, EllipticCurve, getSubgroup } from "../../src/lib/math/curve.ts";

test("prime validation rejects empty/invalid, composite and fractional inputs", () => {
  for (const value of [undefined, NaN, Infinity, -3, 0, 1, 2.5, 9, 25, 49]) assert.equal(isPrime(value), false);
  for (const value of [2, 3, 5, 13, 73, 97]) assert.equal(isPrime(value), true);
});
test("the original curve has order 14 and obeys identity, closure and commutativity", () => {
  const curve = new EllipticCurve(4, 6, 13);
  assert.equal(curve.points.length, 14);
  const identity = curve.points[0];
  for (const p of curve.points) {
    assert.ok(p.plus(identity).rawequals(p));
    for (const q of curve.points) {
      const sum = p.plus(q);
      assert.ok(sum.rawequals(q.plus(p)));
      assert.ok(curve.points.some((r) => r.rawequals(sum)));
    }
  }
});
test("subgroups terminate at identity and are not truncated at twenty elements", () => {
  let foundLongSubgroup = false;
  for (const p of [13, 37, 73]) {
    const curve = new EllipticCurve(4, 6, p);
    for (const point of curve.points) {
      const subgroup = getSubgroup(point, curve);
      assert.ok(subgroup.at(-1).isIdentity);
      assert.equal(curve.points.length % subgroup.length, 0);
      if (subgroup.length > 20) foundLongSubgroup = true;
    }
  }
  assert.ok(foundLongSubgroup);
});
