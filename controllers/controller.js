const formidable = require("formidable");
const fs = require("fs");
const iconv = require("iconv-lite");
const inventory = require("../model/Inventory");

let arrArticles;

module.exports = {
  postUpload: (req, res) => {
    const form = new formidable.IncomingForm();
    form.uploadDir = "upload";
    form.keepExtensions = true;

    form.parse(req);
    form.on("file", (name, file) => {
      const buffer = iconv.decode(fs.readFileSync(file.path), "win1251");
      const articles = buffer.toString();

      fs.unlink(file.path, error => {
        if (error) throw error;
      });

      if (/^\d{4}\.csv$/.test(file.name)) {
        inventory.importCountedArticles(articles);
        inventory.fuelStation = "1079";
        res.write("OK");
        res.end();
      }

      if (file.name === "orpak.csv") {
        inventory.importOrpakArticles(articles);
        res.write("OK");
        res.end();
      }

      if (file.name === "sap.csv") {
        arrArticles = inventory.importSapArticles(articles);
        res.write("OK");
        res.end();
      }
    });
  },
  getInventory: (req, res) => {
    if (inventory.fuelStation) {
      const { fuelStation } = inventory;
      res.render("inventory.hbs", { arrArticles, fuelStation });
      return;
    } else {
      res.redirect("/");
    }
  },
  getHome: (req, res) => {
    if (inventory.fuelStation) {
      res.redirect("inventory");
      return;
    } else {
      const { fuelStation } = inventory;
      res.render("home.hbs", { fuelStation });
    }
  },
  getNotFound: (req, res) => {
    res.render("404.hbs");
  },
  getClearData: (req, res) => {
    inventory.clearData();
    res.redirect("/");
  },
  getDownload: (req, res) => {
    let data = inventory.reportInventory();

    fs.writeFile("inventory.csv", data, () => {
      res.download("inventory.csv");
    });
  },
  getOrpakDownload: (req, res) => {
    let data = inventory.orpakReportInventory();

    fs.writeFile("orpakInventory.csv", data, () => {
      res.download("orpakInventory.csv");
    });
  }
};
