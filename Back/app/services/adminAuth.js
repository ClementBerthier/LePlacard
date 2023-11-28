const client = require("../models/dbClient.js");

const adminAuth = async (req, res, next) => {
    const identifiant = req.user.identifiant;

    try {
        const sqlQuery = `SELECT * FROM public.user WHERE identifiant = $1`;
        const values = [identifiant];
        const result = await client.query(sqlQuery, values);
        const userData = result.rows[0];

        if (userData.is_admin === true) {
            next();
        } else {
            res.status(403).json(
                "Vous n'avez pas les droits pour accéder à cette page"
            );
        }
    } catch (error) {}
};

module.exports = adminAuth;
