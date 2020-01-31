const formidable = require("formidable");
const fs = require("fs");
const iconv = require("iconv-lite");
const inventory = require("../model/InventoryObj");
const fuelStationDB = require('../config/fuelStationDataBase');
let arrArticles;

module.exports = {
  postUpload: (req, res) => {
    
    const form = new formidable.IncomingForm();
    let recivedFiles = [];
    form.uploadDir = "upload";
    form.keepExtensions = true;
    form.multiples = true;
    form.maxFileSize = 10 * 1024 * 1024;

    form.parse(req, (err, fields, files) => {
      if (Array.isArray(files.fileToUpload)) {
        recivedFiles = [...files.fileToUpload];    
        return;
      }else{
        recivedFiles.push(files.fileToUpload);
      }

    });

    form.on('error', err => {
      const error = err.message;
      res.render('home.hbs', {error});
    })
    
    form.on('end', () => {
      if(recivedFiles.length !== 3){
        res.render('home.hbs', {error: "Файловете за обработка трябва да са 3!"});
        
        recivedFiles.forEach((file, inx) => {
          fs.unlink(file.path, () => console.log(`${file.name} removed!`));
        });

        return;
      };

      let error = '';
      const sapFile = recivedFiles.find(({name}) => name === 'sap.csv');
      const orpakFile = recivedFiles.find(({name}) => name === 'orpak.csv');
      const fsFile = recivedFiles.find(({name}) => {
        const fuelStation = name.slice(0,4);
        if(fuelStationDB[fuelStation]){
          return name;
        }
      });

      if(!sapFile){
        error = "Файлът от САП липсва!";
      }

      if (!orpakFile) {
        error = "Файлът от Орпак липсва!";
      }

      if(!fsFile){
        error = "Файлът с броената наличност липсва!";
      }

      if(error){
        res.render('home.hbs', {error});
        recivedFiles.forEach((file, inx) => {
          fs.unlink(file.path, () => console.log(`${file.name} removed!`));
        });
        return;
      }

      (() => {
        const buffer = iconv.decode(fs.readFileSync(sapFile.path), "win1251");
        const articles = buffer.toString();
        inventory.importSapArticles(articles);
      })();

      (() => {
        const buffer = iconv.decode(fs.readFileSync(orpakFile.path), "win1251");
        const articles = buffer.toString();
        inventory.importOrpakArticles(articles);
      })();

      (() => {
        const buffer = iconv.decode(fs.readFileSync(fsFile.path), "win1251");
        const articles = buffer.toString();
        inventory.importCountedArticles(articles);
        inventory.fuelStation = fsFile.name.slice(0, 4);
        inventory.inventoryReport();
      })();
      
      res.redirect("inventory");
      recivedFiles.forEach((file, inx) => {
        fs.unlink(file.path, () => console.log(`${file.name} removed!`));
      });
    })
  },
  getInventory: (req, res) => {
    if (inventory.fuelStation) {
      arrArticles = inventory.result;
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
    let data = iconv.encode(inventory.csvExport(), "win1251");

    fs.writeFile("inventory.csv", data, () => {
      res.download("inventory.csv");
    });
  },
  getOrpakDownload: (req, res) => {
    let data = inventory.orpakExport();

    fs.writeFile("orpakInventory.txt", data, () => {
      res.download("orpakInventory.txt");
    });
  },
  postNewValues: (req,res) => {
    const inStock = Number(req.params.inStock);
    const index = Number(req.params.index);
    const difference = Number(req.params.difference);
    const amount = Number(req.params.amount);
    
    inventory.editValues(index,inStock,difference,amount);
    res.write('OK');
    res.end();
  }
};
