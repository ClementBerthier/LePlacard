require("dotenv").config();

const gamesRouter = require("./app/routers/games.js");

const express = require("express");
const app = express();

app.use("/games", gamesRouter);

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
    console.log(`Server is running : http://localhost:${PORT}`);
});
