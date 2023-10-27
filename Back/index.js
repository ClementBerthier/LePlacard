require("dotenv").config();
import {
    armiesRouter,
    boxesRouter,
    decorsRouter,
    figurinesRouter,
    gamesRouter,
    objectsRouter,
    usersRouter,
} from "../Back/app/router";

const express = require("express");
const app = express();

app.use("/armies", armiesRouter);
app.use("/boxes", boxesRouter);
app.use("/decors", decorsRouter);
app.use("/figurines", figurinesRouter);
app.use("/games", gamesRouter);
app.use("/objects", objectsRouter);
app.use("/users", usersRouter);

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
    console.log(`Server is running : http://localhost:${PORT}`);
});
