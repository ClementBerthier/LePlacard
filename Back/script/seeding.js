require("dotenv").config({ path: "../.env" });
const XLSX = require("xlsx");

const { Client } = require("pg");
const client = new Client();
client.connect();

const workbook = XLSX.readFile("../data/BDD-LePlacard.ods");

const sheetFigurines = workbook.SheetNames[0];
const sheetObjects = workbook.SheetNames[1];
const sheetDecors = workbook.SheetNames[2];

const worksheetFigurines = workbook.Sheets[sheetFigurines];
const worksheetObjects = workbook.Sheets[sheetObjects];
const worksheetDecors = workbook.Sheets[sheetDecors];

const jsonDataFigurines = XLSX.utils.sheet_to_json(worksheetFigurines, {
    header: 1,
});
const jsonDataObjects = XLSX.utils.sheet_to_json(worksheetObjects, {
    header: 1,
});
const jsonDataDecors = XLSX.utils.sheet_to_json(worksheetDecors, { header: 1 });

// Delete all data in database

async function deleteData() {
    await client.query(
        'TRUNCATE "user", armies_boxes, armies_games, games, boxes, armies, decors, figurines, objects RESTART IDENTITY CASCADE;'
    );
    console.log("Data successfully deleted");
}

//Import user

async function importUser() {
    let counter = 0;
    const sqlQuery = `
    INSERT INTO public."user"
    (identifiant, password_user)
    VALUES
    ('admin', 'admin');`;

    const result = await client.query(sqlQuery);
    counter++;

    console.log(`nb of user imported : ${counter}`);
}

// Filter armies and add to database

//Filter armies

const armies = jsonDataFigurines.map((item) => item[1]);
const armiesFilter = [...new Set(armies)];

// Add armies to database

async function importArmies() {
    let counter = 0;
    let allArmieswithIdAndNAme = [];

    for (const army of armiesFilter) {
        const sqlQuery = `
        INSERT INTO public.armies
        (army_name, picture_path)
        VALUES
        ($1, 'unknown')
        RETURNING id, army_name;`;

        const result = await client.query(sqlQuery, [army]);
        const armyId = result.rows[0].id;
        const armyName = result.rows[0].army_name;
        allArmieswithIdAndNAme.push({ armyId, armyName });
        counter++;
    }

    console.log(`nb of armies imported : ${counter}`);

    return allArmieswithIdAndNAme;
}

// Filter games and add to database

//Filter games

const gamesFig = jsonDataFigurines.map((item) => item[3]);
const gamesObj = jsonDataObjects.map((item) => item[3]);
const gamesDec = jsonDataDecors.map((item) => item[3]);
const allGames = [
    ...new Set(gamesFig),
    ...new Set(gamesObj),
    ...new Set(gamesDec),
];

const gamesFilter = [...new Set(allGames)];

// Add games to database

async function importGames() {
    let counter = 0;
    let allGameWithIdAndNames = [];

    for (const game of gamesFilter) {
        const sqlQuery = `
            INSERT INTO public.games
            (game_name, picture_path)
            VALUES
            ($1, 'unknown')
            RETURNING id, game_name;`;

        const result = await client.query(sqlQuery, [game]);

        const gameId = result.rows[0].id;
        const gameName = result.rows[0].game_name;
        allGameWithIdAndNames.push({ gameId, gameName });
        counter++;
    }
    console.log(`nb of games imported : ${counter}`);

    return allGameWithIdAndNames;
}

// Filter boxes and add to database

//Filter boxes

const boxesFig = jsonDataFigurines.map((item) => item[2]);
const boxesObj = jsonDataObjects.map((item) => item[2]);
const boxesDec = jsonDataDecors.map((item) => item[2]);

const boxesWithGamesFig = boxesFig.map((item, index) => [
    item,
    gamesFig[index],
]);
const boxesWithGamesObj = boxesObj.map((item, index) => [
    item,
    gamesObj[index],
]);
const boxesWithGamesDec = boxesDec.map((item, index) => [
    item,
    gamesDec[index],
]);

const AllBoxes = [
    ...new Set(boxesFig),
    ...new Set(boxesObj),
    ...new Set(boxesDec),
];

const boxesFilter = [...new Set(AllBoxes)];

const AllBoxesWithGames = [
    ...new Set(boxesWithGamesFig),
    ...new Set(boxesWithGamesObj),
    ...new Set(boxesWithGamesDec),
];

//delete duplicates in boxesWithGames and add game_id

const boxesFilterWithGameId = AllBoxesWithGames.filter(
    (value, index, self) =>
        self.findIndex((m) => m[0] === value[0] && m[1] === value[1]) === index
);

for (const box of boxesFilterWithGameId) {
    box[1] = gamesFilter.indexOf(box[1]) + 1;
}

console.log(boxesFilterWithGameId);
// Add boxes to database

async function importBoxes() {
    let counter = 0;

    for (const box of boxesFilterWithGameId) {
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

// Filter armies_games and add to database

//Filter armies_games

const armiesWithGames = armies.map((item, index) => [item, gamesFig[index]]);

const armiesWithGamesFilter = armiesWithGames.filter(
    (value, index, self) =>
        self.findIndex((m) => m[0] === value[0] && m[1] === value[1]) === index
);

for (const item of armiesWithGamesFilter) {
    item[0] = armiesFilter.indexOf(item[0]) + 1;
    item[1] = gamesFilter.indexOf(item[1]) + 1;
}

// Add armies_games to database

async function importArmiesGames() {
    let counter = 0;

    for (const item of armiesWithGamesFilter) {
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

// Filter armies_boxes and add to database

//Filter armies_boxes

const armiesWithBoxes = armies.map((item, index) => [item, boxesFig[index]]);

const armiesWithBoxesFilter = armiesWithBoxes.filter(
    (value, index, self) =>
        self.findIndex((m) => m[0] === value[0] && m[1] === value[1]) === index
);

for (const item of armiesWithBoxesFilter) {
    item[0] = armiesFilter.indexOf(item[0]) + 1;
    item[1] = boxesFilter.indexOf(item[1]) + 1;
}

// Add armies_boxes to database

async function importArmiesBoxes() {
    let counter = 0;

    for (const item of armiesWithBoxesFilter) {
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

// filter figurines and add to database

//Filter figurines

const figurines = jsonDataFigurines.map((item) => item[0]);

const purchaseFig = jsonDataFigurines.map((item) => item[4]);
const cleanMountFig = jsonDataFigurines.map((item) => item[5]);
const undercoatFig = jsonDataFigurines.map((item) => item[6]);
const paintFig = jsonDataFigurines.map((item) => item[7]);
const plinthFig = jsonDataFigurines.map((item) => item[8]);
const varnishFig = jsonDataFigurines.map((item) => item[9]);
const numberOfFig = jsonDataFigurines.map((item) => item[10]);

const armiesId = armies.map((item) => armiesFilter.indexOf(item) + 1);
const boxesId = boxesFig.map((item) => boxesFilter.indexOf(item) + 1);
const gamesId = gamesFig.map((item) => gamesFilter.indexOf(item) + 1);

const figurinesWithAllInfo = figurines.map((item, index) => [
    item,

    purchaseFig[index],
    cleanMountFig[index],
    undercoatFig[index],
    paintFig[index],
    plinthFig[index],
    varnishFig[index],
    armiesId[index],
    boxesId[index],
    gamesId[index],
    numberOfFig[index],
]);

async function importFigurines() {
    let counter = 0;

    for (const item of figurinesWithAllInfo) {
        for (let i = 0; i < item[10]; i++) {
            const sqlQuery = `
        INSERT INTO public.figurines
        (figurine_name, picture_path, purchase, cleanMount, undercoat, paint, plinth, varnish, army_id, box_id, game_id, user_id)
        VALUES
        ($1, 'unknown', $2, $3, $4, $5, $6, $7, $8, $9, $10, '1' );`;

            await client.query(sqlQuery, [
                item[0],
                item[1],
                item[2],
                item[3],
                item[4],
                item[5],
                item[6],
                item[7],
                item[8],
                item[9],
            ]);
            counter++;
        }
    }
    console.log(`nb of figurine imported : ${counter}`);
}

// Filter objects and add to database

const objects = jsonDataObjects.map((item) => item[0]);

const purchaseObj = jsonDataObjects.map((item) => item[4]);
const cleanMountObj = jsonDataObjects.map((item) => item[5]);
const undercoatObj = jsonDataObjects.map((item) => item[6]);
const paintObj = jsonDataObjects.map((item) => item[7]);
const plinthObj = jsonDataObjects.map((item) => item[8]);
const varnishObj = jsonDataObjects.map((item) => item[9]);
const numberOfObj = jsonDataObjects.map((item) => item[10]);

const boxesFilterWithId = boxesFilter.map((item, index) => [item, index + 1]);

const boxesObjFilter = [new Set(boxesObj)];

const objectsWithAllInfo = objects.map((item, index) => [
    item,

    purchaseObj[index],
    cleanMountObj[index],
    undercoatObj[index],
    paintObj[index],
    plinthObj[index],
    varnishObj[index],
    //boxesFilterWithId[index],
    gamesObj[index],
    numberOfObj[index],
]);

async function importObjects() {
    let counter = 0;

    for (const item of objectsWithAllInfo) {
        for (let i = 0; i < item[10]; i++) {
            const sqlQuery = `
        INSERT INTO public.figurines
        (object_name, picture_path, purchase, cleanMount, undercoat, paint, plinth, varnish, box_id, game_id, user_id)
        VALUES
        ($1, 'unknown', $2, $3, $4, $5, $6, $7, $8, $9, '1' );`;

            await client.query(sqlQuery, [
                item[0],
                item[1],
                item[2],
                item[3],
                item[4],
                item[5],
                item[6],
                item[7],
                item[8],
            ]);
            counter++;
        }
    }
    console.log(`nb of figurine imported : ${counter}`);
}

async function importData() {
    await deleteData();
    await importUser();
    await importArmies();
    await importGames();
    await importBoxes();
    await importArmiesGames();
    await importArmiesBoxes();
    await importFigurines();
}

importData();
