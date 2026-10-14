import test from 'node:test';
import assert from 'node:assert/strict';
import { estimateFee, money, dateTime } from './format.js';

test('billing charges each started hour with a one-hour minimum', () => {
  assert.equal(estimateFee(0, 20), 20);
  assert.equal(estimateFee(3600, 20), 20);
  assert.equal(estimateFee(3601, 20), 40);
  assert.equal(estimateFee(5400, 15), 30);
});
test('formatting handles empty and numeric values', () => {
  assert.equal(dateTime(null), '—');
  assert.match(money(40), /40/);
});
