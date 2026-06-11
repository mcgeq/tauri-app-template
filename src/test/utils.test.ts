import { cn } from '@/lib/utils';

describe('cn', () => {
  it('merges class names correctly', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
  });

  it('resolves tailwind conflicts (last wins)', () => {
    expect(cn('px-4', 'px-6')).toBe('px-6');
  });

  it('accepts arrays and objects', () => {
    expect(cn(['a', 'b'], { c: true, d: false })).toBe('a b c');
  });

  it('returns empty string for no inputs', () => {
    expect(cn()).toBe('');
  });
});
