import { describe, it, expect } from 'vitest';
import { extractHashtags } from '../utils/hashtagUtils';

describe('extractHashtags', () => {
  it('extracts hashtags from content', () => {
    const content = 'Check #VFX and #Rendering features';
    const result = extractHashtags(content);
    expect(result).toEqual(['vfx', 'rendering']);
  });

  it('returns empty array when no hashtags are present', () => {
    expect(extractHashtags('No tags here')).toEqual([]);
  });
});
