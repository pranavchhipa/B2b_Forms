import { describe, it, expect } from 'vitest';
import { isValidPhone, validateQuestion } from './validation';
import type { Question } from './types';

describe('isValidPhone', () => {
  it('accepts a 10-digit Indian mobile', () => {
    expect(isValidPhone('9876543210')).toBe(true);
  });
  it('accepts +91 / spaced / 0-prefixed formats', () => {
    expect(isValidPhone('+91 98765 43210')).toBe(true);
    expect(isValidPhone('09876543210')).toBe(true);
  });
  it('rejects numbers not starting 6-9', () => {
    expect(isValidPhone('1234567890')).toBe(false);
  });
  it('rejects too-short input', () => {
    expect(isValidPhone('98765')).toBe(false);
  });
});

const q = (over: Partial<Question>): Question => ({
  id: 'x',
  label: 'X',
  type: 'short-text',
  ...over,
});

describe('validateQuestion', () => {
  it('flags required empty fields', () => {
    expect(validateQuestion(q({ required: true }), undefined)).toBe('This field is required');
    expect(validateQuestion(q({ required: true }), '   ')).toBe('This field is required');
  });
  it('allows optional empty fields', () => {
    expect(validateQuestion(q({}), '')).toBeNull();
  });
  it('flags an invalid phone but accepts a valid one', () => {
    expect(validateQuestion(q({ type: 'phone' }), '123')).toBe('Enter a valid phone number');
    expect(validateQuestion(q({ type: 'phone' }), '9876543210')).toBeNull();
  });
  it('enforces number validity and bounds', () => {
    expect(validateQuestion(q({ type: 'number' }), 'abc')).toBe('Enter a valid number');
    expect(validateQuestion(q({ type: 'number', min: 0 }), '-5')).toBe('Must be at least 0');
    expect(validateQuestion(q({ type: 'number', max: 100 }), '200')).toBe('Must be at most 100');
    expect(validateQuestion(q({ type: 'number' }), '42')).toBeNull();
  });
  it('treats an empty multi-choice array as empty', () => {
    expect(validateQuestion(q({ type: 'multi-choice', required: true }), [])).toBe(
      'This field is required',
    );
    expect(validateQuestion(q({ type: 'multi-choice', required: true }), ['a'])).toBeNull();
  });
});
