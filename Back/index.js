require("dotenv").config();

const gamesRouter = require("./app/routers/games.js");
const boxesRouter = require("./app/routers/boxes.js");
const armiesRouter = require("./app/routers/armies.js");
const figurinesRouter = require("./app/routers/figurines.js");
const decorsRouter = require("./app/routers/decors.js");
const objectsRouter = require("./app/routers/objects.js");
const usersRouter = require("./app/routers/users.js");

const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: true }));

app.use("/games", gamesRouter);
app.use("/boxes", boxesRouter);
app.use("/armies", armiesRouter);
app.use("/figurines", figurinesRouter);
app.use("/decors", decorsRouter);
app.use("/objects", objectsRouter);
app.use("/users", usersRouter);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running : http://localhost:${PORT}`);
});
