const controller = require('../controllers/controller');

module.exports = (app) => {
    
    app.post("/upload", controller.postUpload);
    
    app.get("/inventory", controller.getInventory);
    app.get('/clear', controller.getClearData);
    app.get("/download", controller.getDownload);
    app.get("/orpakDownload", controller.getOrpakDownload);
    app.post("/index/:index/inStock/:inStock/difference/:difference/amount/:amount", controller.postNewValues);
    
    app.get("/", controller.getHome);

    app.get("*", controller.getNotFound);
}

