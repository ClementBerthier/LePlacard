require("dotenv").config({ path: "../.env" });
const XLSX = require("xlsx");

const { Client } = require("pg");
const client = new Client({
    user: process.env.PG_USER,
    host: process.env.HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PORTDB,
});
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
        "TRUNCATE armies_boxes, armies_games, games, boxes, armies, decors, figurines, objects RESTART IDENTITY CASCADE;"
    );
    console.log("Data successfully deleted");
}

// Filter armies and add to database

//Filter armies

const armies = jsonDataFigurines.map((item) => item[1]);
const armiesFilter = [...new Set(armies)];
const armiesFilterWithId = armiesFilter.map((item, index) => [item, index + 1]);

// Add armies to database

async function importArmies() {
    let counter = 0;
    for (const army of armiesFilter) {
        const sqlQuery = `
        INSERT INTO public.armies
        (army_name, picture_path, user_id)
        VALUES
        ($1, 'unknown', '1')
        RETURNING id, army_name;`;

        const result = await client.query(sqlQuery, [army]);

        counter++;
    }

    console.log(`nb of armies imported : ${counter}`);
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
const gameFilterWithId = gamesFilter.map((item, index) => [item, index + 1]);

// Add games to database

async function importGames() {
    let counter = 0;

    for (const game of gamesFilter) {
        const sqlQuery = `
            INSERT INTO public.games
            (game_name, picture_path, user_id)
            VALUES
            ($1, 'unknown', '1')
            RETURNING id, game_name;`;

        const result = await client.query(sqlQuery, [game]);

        counter++;
    }
    console.log(`nb of games imported : ${counter}`);
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
const boxesFilterWithId = boxesFilter.map((item, index) => [item, index + 1]);

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
    box[1] = gameFilterWithId.filter((item) => item[0] === box[1])[0][1];
}

// Add boxes to database

async function importBoxes() {
    let counter = 0;

    for (const box of boxesFilterWithGameId) {
        const sqlQuery = `
        INSERT INTO public.boxes
        (box_name, picture_path, game_id, user_id)
        VALUES
        ($1, 'unknown', $2, '1')
        RETURNING id, box_name;`;

        const result = await client.query(sqlQuery, [box[0], box[1]]);
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

for (const army of armiesWithGamesFilter) {
    army[0] = armiesFilterWithId.filter((item) => item[0] === army[0])[0][1];
    army[1] = gameFilterWithId.filter((item) => item[0] === army[1])[0][1];
}

// Add armies_games to database

async function importArmiesGames() {
    let counter = 0;

    for (const army of armiesWithGamesFilter) {
        const sqlQuery = `
        INSERT INTO public.armies_games
        (army_id, game_id)
        VALUES
        ($1, $2);`;

        await client.query(sqlQuery, [army[0], army[1]]);
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

for (const army of armiesWithBoxesFilter) {
    army[0] = armiesFilterWithId.filter((item) => item[0] === army[0])[0][1];
    army[1] = boxesFilterWithId.filter((item) => item[0] === army[1])[0][1];
}

// Add armies_boxes to database

async function importArmiesBoxes() {
    let counter = 0;

    for (const army of armiesWithBoxesFilter) {
        const sqlQuery = `
            INSERT INTO public.armies_boxes
            (army_id, box_id)
            VALUES
            ($1, $2);`;

        await client.query(sqlQuery, [army[0], army[1]]);
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

const figurinesWithAllInfo = figurines.map((item, index) => [
    item,

    purchaseFig[index],
    cleanMountFig[index],
    undercoatFig[index],
    paintFig[index],
    plinthFig[index],
    varnishFig[index],
    armies[index],
    boxesFig[index],
    gamesFig[index],
    numberOfFig[index],
]);

for (const figurine of figurinesWithAllInfo) {
    figurine[7] = armiesFilterWithId.filter(
        (item) => item[0] === figurine[7]
    )[0][1];
    figurine[8] = boxesFilterWithId.filter(
        (item) => item[0] === figurine[8]
    )[0][1];
    figurine[9] = gameFilterWithId.filter(
        (item) => item[0] === figurine[9]
    )[0][1];
}
async function importFigurines() {
    let counter = 0;

    for (const figurine of figurinesWithAllInfo) {
        for (let i = 0; i < figurine[10]; i++) {
            const sqlQuery = `
            INSERT INTO public.figurines
            (figurine_name, picture_path, purchase, cleanMount, undercoat, paint, plinth, varnish, army_id, box_id, game_id, user_id)
            VALUES
            ($1, 'unknown', $2, $3, $4, $5, $6, $7, $8, $9, $10, '1' );`;

            await client.query(sqlQuery, [
                figurine[0],
                figurine[1],
                figurine[2],
                figurine[3],
                figurine[4],
                figurine[5],
                figurine[6],
                figurine[7],
                figurine[8],
                figurine[9],
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

const objectsWithAllInfo = objects.map((item, index) => [
    item,

    purchaseObj[index],
    cleanMountObj[index],
    undercoatObj[index],
    paintObj[index],
    plinthObj[index],
    varnishObj[index],
    boxesObj[index],
    gamesObj[index],
    numberOfObj[index],
]);

for (const objet of objectsWithAllInfo) {
    objet[7] = boxesFilterWithId.filter((item) => item[0] === objet[7])[0][1];
    objet[8] = gameFilterWithId.filter((item) => item[0] === objet[8])[0][1];
}

async function importObjects() {
    let counter = 0;

    for (const object of objectsWithAllInfo) {
        for (let i = 0; i < object[9]; i++) {
            const sqlQuery = `
            INSERT INTO public.objects
            (object_name, picture_path, purchase, cleanMount, undercoat, paint, plinth, varnish, box_id, game_id, user_id)
            VALUES
            ($1, 'unknown', $2, $3, $4, $5, $6, $7, $8, $9, '1' );`;

            await client.query(sqlQuery, [
                object[0],
                object[1],
                object[2],
                object[3],
                object[4],
                object[5],
                object[6],
                object[7],
                object[8],
            ]);
            counter++;
        }
    }
    console.log(`nb of object imported : ${counter}`);
}

// Filter decors and add to database

const decors = jsonDataDecors.map((item) => item[0]);

const purchaseDec = jsonDataDecors.map((item) => item[4]);
const cleanMountDec = jsonDataDecors.map((item) => item[5]);
const undercoatDec = jsonDataDecors.map((item) => item[6]);
const paintDec = jsonDataDecors.map((item) => item[7]);
const plinthDec = jsonDataDecors.map((item) => item[8]);
const varnishDec = jsonDataDecors.map((item) => item[9]);
const numberOfDec = jsonDataDecors.map((item) => item[10]);

const decorsWithAllInfo = decors.map((item, index) => [
    item,

    purchaseDec[index],
    cleanMountDec[index],
    undercoatDec[index],
    paintDec[index],
    plinthDec[index],
    varnishDec[index],
    boxesDec[index],
    gamesDec[index],
    numberOfDec[index],
]);

for (const decor of decorsWithAllInfo) {
    decor[7] = boxesFilterWithId.filter((item) => item[0] === decor[7])[0][1];
    decor[8] = gameFilterWithId.filter((item) => item[0] === decor[8])[0][1];
}

async function importDecors() {
    let counter = 0;

    for (const decor of decorsWithAllInfo) {
        for (let i = 0; i < decor[9]; i++) {
            const sqlQuery = `
            INSERT INTO public.decors
            (decor_name, picture_path, purchase, cleanMount, undercoat, paint, plinth, varnish, box_id, game_id, user_id)
            VALUES
            ($1, 'unknown', $2, $3, $4, $5, $6, $7, $8, $9, '1' );`;

            await client.query(sqlQuery, [
                decor[0],
                decor[1],
                decor[2],
                decor[3],
                decor[4],
                decor[5],
                decor[6],
                decor[7],
                decor[8],
            ]);
            counter++;
        }
    }
    console.log(`nb of decors imported : ${counter}`);
}

async function importData() {
    await deleteData();
    await importArmies();
    await importGames();
    await importBoxes();
    await importArmiesGames();
    await importArmiesBoxes();
    await importFigurines();
    await importObjects();
    await importDecors();

    console.log("Data successfully imported");
}

importData();
