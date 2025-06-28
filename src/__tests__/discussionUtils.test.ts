import { afterEach, describe, expect, it, vi } from 'vitest';
import { formatTimeAgo } from '../utils/discussionUtils';

afterEach(() => {
  vi.useRealTimers();
});

describe('formatTimeAgo', () => {
  it('returns "Just now" when timestamp is current time', () => {
    vi.useFakeTimers();
    const now = new Date('2023-01-01T00:00:00Z');
    vi.setSystemTime(now);
    expect(formatTimeAgo('2023-01-01T00:00:00Z')).toBe('Just now');
  });

  it('formats minutes ago correctly', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-01-01T01:00:00Z'));
    expect(formatTimeAgo('2023-01-01T00:30:00Z')).toBe('30m ago');
  });

  it('formats hours ago correctly', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-01-02T00:00:00Z'));
    expect(formatTimeAgo('2023-01-01T12:00:00Z')).toBe('12h ago');
  });

  it('formats days ago correctly', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-01-05T00:00:00Z'));
    expect(formatTimeAgo('2023-01-01T00:00:00Z')).toBe('4d ago');
  });
});
