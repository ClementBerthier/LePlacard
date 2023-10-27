const { Client } = require("pg");

const client = new Client({
    user: process.env.PG_USER,
    host: process.env.HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PORT,
});
client.connect();

module.exports = client;
