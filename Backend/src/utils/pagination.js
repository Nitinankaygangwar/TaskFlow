function normalizePagination(input = {}) {
  const page = Number(input.page ?? 1);
  const limit = Number(input.limit ?? 20);

  if (!Number.isInteger(page) || page < 1) {
    throw new Error('Invalid page value');
  }
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error('Invalid limit value');
  }

  return {
    page,
    limit: Math.min(limit, 100),
  };
}

function getPaginationMeta(input = {}) {
  const { page, limit } = normalizePagination(input);
  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  };
}

function buildPaginatedResponse(data, total, page, limit) {
  return {
    data,
    total,
    page,
    limit,
  };
}

module.exports = {
  normalizePagination,
  getPaginationMeta,
  buildPaginatedResponse,
};
