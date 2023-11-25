require("dotenv").config();

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

app.use("/games", gamesRouter);
app.use("/boxes", boxesRouter);
app.use("/armies", armiesRouter);
app.use("/figurines", figurinesRouter);
app.use("/decors", decorsRouter);
app.use("/objects", objectsRouter);
app.use("/users", usersRouter);

const PORTLOCAL = process.env.PORTLOCAL ?? 3000;

app.listen(PORTLOCAL, () => {
    console.log(`Server is running : http://localhost:${PORTLOCAL}`);
});
