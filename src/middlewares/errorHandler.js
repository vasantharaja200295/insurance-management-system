exports.handleError = (err, req, res, next) => {
    console.error(err.stack);

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Validation Error',
            details: Object.values(err.errors).map(e => e.message)
        });
    }

    if (err.name === 'MongoError' && err.code === 11000) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Duplicate key error',
            details: ['The provided value already exists']
        });
    }

    res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred'
    });
};
