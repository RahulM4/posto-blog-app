const success = (res, statusCode, data, meta) => {
  const payload = { success: true, data };
  if (meta) payload.meta = meta;
  return res.status(statusCode).json(payload);
};

const failure = (res, statusCode, message, errors) => {
  const payload = { success: false, message };
  if (errors) payload.errors = errors;
  return res.status(statusCode).json(payload);
};

module.exports = {
  success,
  failure
};
