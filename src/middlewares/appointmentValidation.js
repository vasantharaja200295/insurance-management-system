const { check } = require('express-validator');

const validateAppointment = [
  check('customerId').notEmpty().withMessage('Customer ID is required'),
  check('agentId').notEmpty().withMessage('Agent ID is required'),
  check('dateTime')
    .notEmpty()
    .withMessage('Date and time are required')
    .isISO8601()
    .withMessage('Invalid date format'),
  check('purpose').notEmpty().withMessage('Purpose is required'),
  check('notes').optional()
];

const validateStatusUpdate = [
  check('status')
    .isIn(['COMPLETED', 'CANCELLED'])
    .withMessage('Invalid status value'),
  check('notes').optional()
];

module.exports = { validateAppointment, validateStatusUpdate };