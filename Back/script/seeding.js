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

// 1. register user

async function importUser() {
    for (const user of users) {
        const sqlQuery = `
        INSERT INTO public.user
        (identifiant, password)
        VALUES
        ('${user.identifiant}', '${user.password}')
        RETURNING id`;

        const result = await client.query(sqlQuery);

        user.id = result.rows[0].id;
    }
}

// 2. register games

async function importGames() {
    for (const game of games) {
        const sqlQuery = `
        INSERT INTO public.games
        (name, picture_path)
        VALUES
        ('${game.name}', '${game.picture_path}')
        RETURNING id;`;

        const result = await client.query(sqlQuery);

        game.id = result.rows[0].id;
    }
}

// 3. register boxs

async function importBoxs() {
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
    }
}

// 4. register armies

async function importArmies() {
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
    }
}

// 5. register decors

async function importDecors() {
    for (const decor of decors) {
        const box = boxs.find((box) => box.name === decor.box_name);
        const user = users.find((user) => user.identifiant === decor.user_name);

        const sqlQuery = `
        INSERT INTO public.decors
        (name, picture_path, purchase, cleanMount, undercoat, paint, plinth, varnish, box_name, user_name, box_id, user_id)
        VALUES
        ('${decor.name}', '${decor.picture_path}', '${decor.purchase}', '${decor.cleanMount}', '${decor.undercoat}', '${decor.paint}', '${decor.plinth}', '${decor.varnish}', '${decor.box_name}', '${decor.user_name}', '${box.id}', '${user.id}')`;

        await client.query(sqlQuery);
    }
}

// 6. register figurines

async function importFigurines() {
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
    }
}

// import Data in datadase

async function importData() {
    await importUser();
    await importGames();
    await importBoxs();
    await importArmies();
    await importDecors();
    await importFigurines();
}

importData();
