require("dotenv").config({ path: "../.env" });
const XLSX = require("xlsx");

const { Client } = require("pg");
const client = new Client();
client.connect();

// Read ods file
const workbook = XLSX.readFile("../data/BDD-LePlacard.ods");

// Convert to json

const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

//console.log(jsonData);

// Delete all data in database

async function deleteData() {
    await client.query(
        'TRUNCATE "user", armies_boxes, armies_games, games, boxes, armies, decors, figurines, decors RESTART IDENTITY CASCADE;'
    );
    console.log("Data successfully deleted");
}

// Filter armies and add to database

//Filter armies
const armiesData = jsonData.map((item) => item[1]);
const armiesFilter = [...new Set(armiesData)];

const excludedValuesArmies = ["Armée", "Décors", "Objets"];

const armiesList = armiesFilter.filter(
    (item) => !excludedValuesArmies.includes(item)
);

// Add armies to database

async function importArmies() {
    let counter = 0;

    for (const army of armiesList) {
        const sqlQuery = `
        INSERT INTO public.armies
        (army_name, picture_path)
        VALUES
        ($1, 'unknown')
        RETURNING id;`;

        const result = await client.query(sqlQuery, [army]);
        army.id = result.rows[0].id;
        counter++;
    }
    console.log(`nb of armies imported : ${counter}`);
}

// Filter games and add to database

//Filter games

const gamesData = jsonData.map((item) => item[3]);
const gamesFilter = [...new Set(gamesData)];

const excludedValuesGames = "Jeu";

const gamesList = gamesFilter.filter(
    (item) => !excludedValuesGames.includes(item)
);

// Add games to database

async function importGames() {
    let counter = 0;

    for (const game of gamesList) {
        const sqlQuery = `
        INSERT INTO public.games
        (game_name, picture_path)
        VALUES
        ($1, 'unknown')
        RETURNING id;`;

        const result = await client.query(sqlQuery, [game]);
        game.id = result.rows[0].id;
        counter++;
    }
    console.log(`nb of games imported : ${counter}`);
}

// Filter boxes and add to database

//Filter boxes

const boxesData = jsonData.map((item) => item[2]);

const boxesWithGames = boxesData.map((item, index) => [item, gamesData[index]]);

boxesWithGames.shift();

const boxesFilter = boxesWithGames.filter(
    (value, index, self) =>
        self.findIndex((m) => m[0] === value[0] && m[1] === value[1]) === index
);

for (const box of boxesFilter) {
    box[1] = gamesList.indexOf(box[1]) + 1;
}

console.log(boxesFilter);

// Add boxes to database

async function importBoxes() {
    let counter = 0;

    for (const box of boxesFilter) {
        const sqlQuery = `
        INSERT INTO public.boxes
        (box_name, picture_path, game_id)
        VALUES
        ($1, 'unknown', $2)
        RETURNING id;`;

        const result = await client.query(sqlQuery, [box[0], box[1]]);
        box.id = result.rows[0].id;
        counter++;
    }
    console.log(`nb of boxes imported : ${counter}`);
}

async function importData() {
    await deleteData();
    await importArmies();
    await importGames();
    await importBoxes();
}

importData();
