const model = {
    async findAll() {
        try {
            let games;
            const result = await client.query("SELECT * FROM games");
            games = result.rows;
        } catch (error) {}
        return games;
    },
    async findOne(id) {
        try {
            let game;
            const sqlQuery = "SELECT * FROM games WHERE id = $1";
            const values = [id];
            const result = await client.query(sqlQuery, values);
            game = result.rows[0];
        } catch (error) {}
        return game;
    },
    async insert(game) {
        let gameDB;
        try {
            const sqlQuery =
                "INSERT INTO public.games(game_name, picture_path) VALUES($1, $2) RETURNING *";
            const values = [game.game_name, game.picture_path];
            const result = await client.query(sqlQuery, values);
            gameDB = result.rows[0];
        } catch (error) {}
        return gameDB;
    },
    async update(id, game) {
        let gameDB;
        try {
            const sqlQuery =
                "UPDATE public.games SET game_name=$1, picture_path=$2 WHERE id=$3 RETURNING *";
            const values = [game.game_name, game.picture_path, id];
            const result = await client.query(sqlQuery, values);
            gameDB = result.rows[0];
        } catch (error) {}
        return gameDB;
    },
    async delete(id) {
        try {
            const sqlQuery = "DELETE FROM public.games WHERE id=$1";
            const values = [id];
            const result = await client.query(sqlQuery, values);
            return result;
        } catch (error) {}
    },
};

module.exports = model;
