const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

describe('public API route consistency', () => {
  test('calendar uses the canonical reservations endpoint', () => {
    const calendar = read('calendar-fixed.js');
    expect(calendar).toContain('fetch("/api/reservations"');
    expect(calendar).not.toContain('/api/public-reservations');
  });

  test('public media clients use their matching public endpoints', () => {
    expect(read('media-public.js')).toContain('fetch("/api/public-media"');
    expect(read('home-media-public.js')).toContain('fetch("/api/public-home-media"');
  });

  test('production page does not reference the removed public reservations route', () => {
    expect(read('index.html')).not.toContain('/api/public-reservations');
  });
});
