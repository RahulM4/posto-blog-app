const buildPagination = (query = {}) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const buildSorting = (sortParam) => {
  if (!sortParam) return { createdAt: -1 };
  const sort = {};
  const fields = Array.isArray(sortParam) ? sortParam : String(sortParam).split(',');
  fields.forEach((field) => {
    const [key, dir = 'asc'] = field.split(':');
    sort[key] = dir === 'desc' ? -1 : 1;
  });
  return sort;
};

module.exports = {
  buildPagination,
  buildSorting
};
