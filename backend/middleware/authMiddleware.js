const protect = (req, res, next) => {
    const { user } = req.session;

    if (!user) {
        return res.status(401).json({
            status: "FAILED",
            message: "unauthorized"
        });
    }

    req.user = user;

    // The next method or the next middleware win the stack
    next();
}

module.exports = protect;