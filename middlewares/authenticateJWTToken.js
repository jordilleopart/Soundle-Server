import jwt from 'jsonwebtoken';

function authenticateJWTToken(req, res, next) {
    // Retrieve JWT Token from the header
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    // if no token, send "401 - Unauthorized"
    if (!token) return res.status(401).send();

    // verify JWT Token
    jwt.verify(token, process.env.JWT_SECRET_TOKEN, (err, user) => {
        // User has token but it is not valid, send "403 - Forbidden"
        if (err) return res.status(403).send();
        // Attach user to request object for further use
        req.user = user;
        // call next middleware
        next();
    })
}

export default authenticateJWTToken;