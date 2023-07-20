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
const boxesFilter = [...new Set(boxesData)];

const boxesWithGames = boxesData.map((item, index) => [item, gamesData[index]]);

boxesWithGames.shift();

const boxesList = boxesWithGames.filter(
    (value, index, self) =>
        self.findIndex((m) => m[0] === value[0] && m[1] === value[1]) === index
);

for (const box of boxesList) {
    box[1] = gamesList.indexOf(box[1]) + 1;
}

// Add boxes to database

async function importBoxes() {
    let counter = 0;

    for (const box of boxesList) {
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

// Filter armies_games ans add to database

//Filter armies_games

const armiesWithGames = armiesData.map((item, index) => [
    item,
    gamesData[index],
]);

armiesWithGames.shift();

const armiesWithGamesFilter = armiesWithGames.filter(
    (value, index, self) =>
        self.findIndex((m) => m[0] === value[0] && m[1] === value[1]) === index
);

const excludedValuesArmiesWithGames = ["Décors", "Objets"];

const armiesWithGamesList = armiesWithGamesFilter.filter(
    (item) => !excludedValuesArmiesWithGames.includes(item[0])
);

for (const item of armiesWithGamesList) {
    item[0] = armiesList.indexOf(item[0]) + 1;
    item[1] = gamesList.indexOf(item[1]) + 1;
}

// Add armies_games to database

async function importArmiesGames() {
    let counter = 0;

    for (const item of armiesWithGamesList) {
        const sqlQuery = `
        INSERT INTO public.armies_games
        (army_id, game_id)
        VALUES
        ($1, $2);`;

        await client.query(sqlQuery, [item[0], item[1]]);
        counter++;
    }
    console.log(`nb of armies_games imported : ${counter}`);
}

// Filter armies_boxes ans add to database

//Filter armies_boxes

const armiesWithBoxes = armiesData.map((item, index) => [
    item,
    boxesData[index],
]);

armiesWithBoxes.shift();

const armiesWithBoxesFilter = armiesWithBoxes.filter(
    (value, index, self) =>
        self.findIndex((m) => m[0] === value[0] && m[1] === value[1]) === index
);

const excludedValuesArmiesWithBoxes = ["Décors", "Objets"];

const armiesWithBoxesList = armiesWithBoxesFilter.filter(
    (item) => !excludedValuesArmiesWithBoxes.includes(item[0])
);

for (const item of armiesWithBoxesList) {
    item[0] = armiesList.indexOf(item[0]) + 1;
    item[1] = boxesFilter.indexOf(item[1]);
}

console.log(armiesWithBoxesList);

// Add armies_boxes to database

async function importArmiesBoxes() {
    let counter = 0;

    for (const item of armiesWithBoxesList) {
        const sqlQuery = `
        INSERT INTO public.armies_boxes
        (army_id, box_id)
        VALUES
        ($1, $2);`;

        await client.query(sqlQuery, [item[0], item[1]]);
        counter++;
    }
    console.log(`nb of armies_boxes imported : ${counter}`);
}

async function importData() {
    await deleteData();
    await importArmies();
    await importGames();
    await importBoxes();
    await importArmiesGames();
    await importArmiesBoxes();
}

importData();
