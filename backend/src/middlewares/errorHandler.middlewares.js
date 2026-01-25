// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // log error for debugging

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
};

export { errorHandler };