require("dotenv").config();
const verifyToken = require("./app/services/verifyJwtToken");

const {
    armiesRouter,
    boxesRouter,
    figurinesRouter,
    decorsRouter,
    objectsRouter,
    usersRouter,
    gamesRouter,
} = require("./app/routers");

const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: true }));

app.use("/users", usersRouter);

app.use(verifyToken);

app.use("/games", gamesRouter);
app.use("/boxes", boxesRouter);
app.use("/armies", armiesRouter);
app.use("/figurines", figurinesRouter);
app.use("/decors", decorsRouter);
app.use("/objects", objectsRouter);

const PORT = process.env.PORTLOCAL ?? 3000;

app.listen(PORT, () => {
    console.log(`Server is running : http://localhost:${PORT}`);
});
