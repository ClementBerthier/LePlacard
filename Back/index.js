require("dotenv").config();

const gamesRouter = require("./app/routers/games.js");
const boxesRouter = require("./app/routers/boxes.js");

const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: true }));

app.use("/games", gamesRouter);
app.use("/boxes", boxesRouter);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running : http://localhost:${PORT}`);
});
