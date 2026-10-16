
const errorHandler = (err, req, res, next) => {

    console.error(err);

    // Mongoose validation error
    if (err.name === "ValidationError") {

        const errors = {};

        for (const field in err.errors) {
            errors[field] = err.errors[field].message;
        }

        return res.status(400).json({
            message: "Validation failed",
            errors: errors
        });
    }

    if (err.name === "CastError") {
        return res.status(400).json({
            message: "Invalid task ID"
        });
    }

    if (err.code === 11000) {
        return res.status(409).json({
            message: "Email is already registered"
        });
    }

    // Other errors
    res.status(500).json({
        message: "Internal Server Error"
    });
};

module.exports = errorHandler;