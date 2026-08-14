'use strict';

const STATUS_BY_CODE = {
  ITEM_NOT_FOUND: 404,
  APPROVAL_CONFIRMATION_REQUIRED: 409,
  INVALID_STATUS: 400,
  NO_EDITABLE_FIELDS: 400,
  INVALID_FIELD_VALUE: 400,
  INVALID_RAW_EXCERPT: 400,
};

function handleError(res, err) {
  const status = STATUS_BY_CODE[err.code] || 500;
  res.status(status).json({ error: err.code || 'INTERNAL_ERROR', message: err.message });
}

module.exports = { handleError };
