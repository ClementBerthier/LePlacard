require("dotenv").config({ path: "../.env" });

const armies = require("../data/armies.json");
const boxs = require("../data/boxs.json");
const decors = require("../data/decors.json");
const figurines = require("../data/figurines.json");
const games = require("../data/games.json");
const users = require("../data/user.json");

const { Client } = require("pg");
const client = new Client();
client.connect();

// Delete all data in database

async function deleteData() {
    await client.query(
        'TRUNCATE "user", games, boxs, armies, decors, figurines RESTART IDENTITY CASCADE;'
    );
    console.log("Data successfully deleted");
}

// 1. register user

async function importUser() {
    let counter = 0;

    for (const user of users) {
        const sqlQuery = `
        INSERT INTO public.user
        (identifiant, password)
        VALUES
        ('${user.identifiant}', '${user.password}')
        RETURNING id`;

        const result = await client.query(sqlQuery);

        user.id = result.rows[0].id;

        counter++;
    }
    console.log(`nb of user imported : ${counter}`);
}

// 2. register games

async function importGames() {
    let counter = 0;

    for (const game of games) {
        const sqlQuery = `
        INSERT INTO public.games
        (name, picture_path)
        VALUES
        ('${game.name}', '${game.picture_path}')
        RETURNING id;`;

        const result = await client.query(sqlQuery);

        game.id = result.rows[0].id;
        counter++;
    }
    console.log(`nb of game imported : ${counter}`);
}

// 3. register boxs

async function importBoxs() {
    let counter = 0;

    for (const box of boxs) {
        const game = games.find((game) => game.name === box.game_name);

        const sqlQuery = `
        INSERT INTO public.boxs
        (name, picture_path, game_name, game_id)
        VALUES
        ('${box.name}', '${box.picture_path}', '${box.game_name}', '${game.id}')
        RETURNING id`;

        const result = await client.query(sqlQuery);

        box.id = result.rows[0].id;
        counter++;
    }

    console.log(`nb of box imported : ${counter}`);
}

// 4. register armies

async function importArmies() {
    let counter = 0;

    for (const army of armies) {
        const box = boxs.find((box) => box.name === army.box_name);
        const game = games.find((game) => game.name === army.game_name);

        const sqlQuery = `
        INSERT INTO public.armies
        (name, picture_path, game_name, box_name, game_id, box_id)
        VALUES
        ('${army.name}', '${army.picture_path}', '${army.game_name}', '${army.box_name}', '${game.id}', '${box.id}')
        RETURNING id`;

        const result = await client.query(sqlQuery);
        army.id = result.rows[0].id;
        counter++;
    }

    console.log(`nb of army imported : ${counter}`);
}

// 5. register decors

async function importDecors() {
    let counter = 0;

    for (const decor of decors) {
        const box = boxs.find((box) => box.name === decor.box_name);
        const user = users.find((user) => user.identifiant === decor.user_name);

        const sqlQuery = `
        INSERT INTO public.decors
        (name, picture_path, purchase, cleanMount, undercoat, paint, plinth, varnish, box_name, user_name, box_id, user_id)
        VALUES
        ('${decor.name}', '${decor.picture_path}', '${decor.purchase}', '${decor.cleanMount}', '${decor.undercoat}', '${decor.paint}', '${decor.plinth}', '${decor.varnish}', '${decor.box_name}', '${decor.user_name}', '${box.id}', '${user.id}')`;

        await client.query(sqlQuery);

        counter++;
    }

    console.log(`nb of decor imported : ${counter}`);
}

// 6. register figurines

async function importFigurines() {
    let counter = 0;

    for (const figurine of figurines) {
        const army = armies.find((army) => army.name === figurine.army_name);
        const user = users.find(
            (user) => user.identifiant === figurine.user_name
        );
        const sqlQuery = `
        INSERT INTO public.figurines
        (name, picture_path, purchase, cleanMount, undercoat, paint, plinth, varnish, army_name, user_name, army_id, user_id)
        VALUES
        ('${figurine.name}', '${figurine.picture_path}', '${figurine.purchase}', '${figurine.cleanMount}', '${figurine.undercoat}', '${figurine.paint}', '${figurine.plinth}', '${figurine.varnish}', '${figurine.army_name}', '${figurine.user_name}', '${army.id}', '${user.id}')`;

        await client.query(sqlQuery);

        counter++;
    }

    console.log(`nb of figurine imported : ${counter}`);
}

// import Data in datadase.

async function importData() {
    await deleteData();
    await importUser();
    await importGames();
    await importBoxs();
    await importArmies();
    await importDecors();
    await importFigurines();
}

importData();
