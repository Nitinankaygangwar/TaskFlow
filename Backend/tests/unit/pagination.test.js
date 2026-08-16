const { normalizePagination, getPaginationMeta } = require('../../src/utils/pagination');

describe('Pagination helper', () => {
  test('uses defaults when input missing', () => {
    expect(normalizePagination({})).toEqual({ page: 1, limit: 20 });
  });

  test('uses custom values within bounds', () => {
    expect(normalizePagination({ page: 2, limit: 10 })).toEqual({ page: 2, limit: 10 });
  });

  test('caps maximum limit', () => {
    expect(normalizePagination({ limit: 500 })).toEqual({ page: 1, limit: 100 });
  });

  test('rejects invalid page and limit values', () => {
    expect(() => normalizePagination({ page: 0, limit: 20 })).toThrow();
    expect(() => normalizePagination({ page: 1, limit: 0 })).toThrow();
  });

  test('calculates skip and take', () => {
    const meta = getPaginationMeta({ page: 3, limit: 15 });
    expect(meta.skip).toBe(30);
    expect(meta.take).toBe(15);
  });
});
