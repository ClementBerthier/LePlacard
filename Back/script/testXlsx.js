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

async function importData() {
    await deleteData();
    await importArmies();
    await importGames();
}

importData();
