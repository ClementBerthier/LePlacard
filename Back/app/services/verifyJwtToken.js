const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET;

const verifyToken = async (req, res, next) => {
    const bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== "undefined") {
        const bearer = bearerHeader.split(" ");
        const token = bearer[1];
        try {
            const decoded = await jwt.verify(token, secretKey);
            console.log("decoded", req.user);
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).send({ message: "Invalid Token" });
        }
    } else {
        res.status(403).json("Authorization is required");
    }
};

module.exports = verifyToken;
