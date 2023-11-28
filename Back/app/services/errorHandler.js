const errorHandler = {
    _404(req, res) {
        console.error("404 - " + req.url);
        res.json("Page non trouvée");
    },
    logError(error) {
        if (error) {
            console.error(error);
        } else {
            console.error("An error occured");
        }
    },
};

module.exports = errorHandler;
