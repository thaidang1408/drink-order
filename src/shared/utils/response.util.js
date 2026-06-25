export const sendSuccess = (res, data, statusCode = 200, meta = {}) => {
  res.status(statusCode).json({
    success: true,
    data,
    ...meta,
  });
};

export const sendCreated = (res, data) => {
  sendSuccess(res, data, 201);
};

export const sendNoContent = (res) => {
  res.status(204).send();
};
