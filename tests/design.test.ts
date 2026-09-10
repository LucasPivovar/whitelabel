import test from 'node:test';
import assert from 'node:assert/strict';
void test('payment methods reject empty and unknown choices', () => {
  const c = initialState('test@example.test').checkouts[0];
  validateCheckout({ ...c, paymentMethods: ['pix', 'card'] });
  assert.throws(() => validateCheckout({ ...c, paymentMethods: [] }));
  assert.throws(() => validateCheckout({ ...c, paymentMethods: ['pix', 'pix'] }));
});
import { initialState, validateCheckout } from '../lib/model';
import {
  withDesign,
  validateDesign,
  reorder,
  createBlock,
} from '../lib/checkout-design';
void test('existing checkouts migrate to stable, valid layouts', () => {
  const c = initialState('test@example.test').checkouts[0];
  const a = withDesign(c),
    b = withDesign(c);
  assert.deepEqual(a.design, b.design);
  validateCheckout(a);
  assert.equal(a.design.blocks.filter((b) => b.kind === 'form').length, 1);
});
void test('mobile order can differ while preserving desktop region', () => {
  const c = withDesign(initialState('test@example.test').checkouts[0]);
  const form = c.design.blocks.find((b) => b.kind === 'form')!;
  const old = c.design.blocks.map((b) => b.id);
  c.design.mobileOrder = reorder(
    c.design.mobileOrder,
    c.design.mobileOrder.indexOf(form.id),
    0,
  );
  validateDesign(c.design);
  assert.equal(c.design.mobileOrder[0], form.id);
  assert.deepEqual(
    c.design.blocks.map((b) => b.id),
    old,
  );
});
void test('invalid styles and missing form cannot be saved', () => {
  const c = withDesign(initialState('test@example.test').checkouts[0]);
  c.design.blocks[0].desktop.size = 500;
  assert.throws(() => validateDesign(c.design));
  c.design.blocks[0].desktop.size = 18;
  c.design.blocks = c.design.blocks.filter((b) => b.kind !== 'form');
  assert.throws(() => validateDesign(c.design));
});
void test('new blocks support sizing and reject duplicate ids', () => {
  const c = withDesign(initialState('test@example.test').checkouts[0]);
  const b = createBlock('image');
  c.design.blocks.push(b);
  c.design.mobileOrder.push(b.id);
  validateDesign(c.design);
  c.design.blocks.push(b);
  assert.throws(() => validateDesign(c.design));
});
void test('required email cannot be disabled or removed', () => {
  const c = withDesign(initialState('test@example.test').checkouts[0]);
  c.design.form.fields.find((f) => f.id === 'email')!.required = false;
  assert.throws(() => validateDesign(c.design));
});
