const { validationResult } = require('express-validator');

exports.validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Validation Error',
            details: errors.array().map(err => err.msg)
        });
    }
    next();
};
