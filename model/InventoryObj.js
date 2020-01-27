class Inventory {
  constructor() {
    this.articles = {};
    this.fuelStation = "";
    this.result = [];
  }

  set fuelStation(code) {
    this._fuelStation = code;
  }

  get fuelStation() {
    return this._fuelStation;
  }

  editValues(index, newInStock, newDifference, newAmount) {
    let article = this.result[index];

    article = {
      ...article,
      inStock: newInStock.toFixed(2),
      difference: newDifference,
      amount: newAmount.toFixed(2)
    };

    this.result.splice(index, 1, article);

    return article;
  }

  importCountedArticles(articles) {
    articles.split("\r\n").map(line => {
      const data = line.split(";").map(e => e);

      const barcodeRegex = /^\d{1,13}$/;
      const curBarcode = data[0];
      const count = Number(data[1]);
      const name = data[2];
      let isBarcodeFound = false;

      if (barcodeRegex.test(curBarcode)) {
        Object.keys(this.articles).forEach(k => {
          if (
            this.articles[k].barcode &&
            this.articles[k].barcode.includes(curBarcode)
          ) {
            this.articles[k].inStock += count;
            const difference = this.articles[k].inStock - this.articles[k].orpakStock;
            this.articles[k].difference = difference;
            const amount = difference * this.articles[k].price;
            this.articles[k].amount = amount.toFixed(2);
            isBarcodeFound = true;
          }
        });

        if (!isBarcodeFound) {
          const difference = count;
          this.articles[curBarcode] = {
            name,
            inStock: count,
            orpakStock: 0,
            difference,
            price: 0,
            amount: 0,
            supplier: "-"
          };
        }
      }
    });

    return "Counted data is improted successfully!";
  }

  importOrpakArticles(articles) {
    articles.split("\r\n").map(line => {
      const data = line.split(";").map(e => e);

      const curSapcode = data[0];
      //when barcode is missing, sapcode will be using
      const curBarcode = data[1] ? data[1] : curSapcode;
      let orpakStock = Number(data[2]);
      const price = Number(data[3]);

      const sapcodeRegex = /^\d{9}$/;
      const barcodeRegex = /^\d{1,13}$/;

      if (sapcodeRegex.test(curSapcode) && barcodeRegex.test(curBarcode)) {
        if (this.articles[curSapcode]) {
          if (!this.articles[curSapcode].barcode.includes(curBarcode)) {
            this.articles[curSapcode].barcode.unshift(curBarcode);
          } else {
            const barcodeIndex = this.articles[curSapcode].barcode.findIndex(b => 
              b === curBarcode
            );
            if (barcodeIndex >= 1) {
              this.articles[curSapcode].barcode.splice(barcodeIndex, 1);
              this.articles[curSapcode].barcode.unshift(curBarcode);
            }
          }

          orpakStock += this.articles[curSapcode].orpakStock;
          const difference = this.articles[curSapcode].inStock - orpakStock;
          const amount = difference * price;

          this.articles[curSapcode] = {
            ...this.articles[curSapcode],
            orpakStock,
            difference,
            price,
            amount: amount.toFixed(2)
          };
        } else if (this.articles[curBarcode]) {
          orpakStock += this.articles[curBarcode].orpakStock;
          const difference = this.articles[curBarcode].inStock - orpakStock;
          const amount = difference * price;

          this.articles[curBarcode] = {
            ...this.articles[curBarcode],
            price,
            orpakStock,
            difference,
            amount: amount.toFixed(2)
          };
        } else {
          const difference = -orpakStock;
          const amount = difference * price;
          this.articles[curSapcode] = {
            orpakStock,
            inStock: 0,
            price,
            amount: amount.toFixed(2),
            difference,
            barcode: [curSapcode]
          };
        }
      }
    });

    return "Orpack data is imported successfully!";
  }

  importSapArticles(articles) {
    articles.split("\r\n").map(line => {
      const data = line.split(";").map(e => e);

      const barcode = data[0][0] === "0" ? data[0].slice(1) : data[0];
      const sapcode = data[1];
      const name = data[2];
      const supplier = data[3];
      const sapcodeRegex = /^\d{9}$/;
      const barcodeRegex = /^\d{1,13}$/;

      if (sapcodeRegex.test(sapcode) && barcodeRegex.test(barcode)) {
        if (!this.articles[sapcode]) {
          this.articles[sapcode] = {
            name,
            barcode: [],
            supplier,
            orpakStock: 0,
            inStock: 0,
            price: 0,
            difference: 0,
            amount: 0
          };
        }

        if (!this.articles[sapcode].barcode.includes(barcode)) {
          this.articles[sapcode].barcode.push(barcode);
        }
      }
    });

    return "SAP data is imported successfully!";
  }

  clearData() {
    this.articles = {};
    this.fuelStation = "";
    this.result = [];
  }

  csvExport() {
    let data =
      "No;Sapcode;Barcode;Name;OrpakStock;In Stock;Differnce;Price;Amount;Supplier;\n";
    this.result.forEach(row => {
      data += `${row.index};${row.sapcode};${row.barcode};${row.name};${row.orpakStock};${row.inStock};${row.difference};${row.price};${row.amount};${row.supplier}\n`;
    });

    return data;
  }

  orpakExport() {
    let data = "";
    this.result.forEach(row => {
      const qty = row.inStock;
      const intQty = ("0000000000" + parseInt(qty)).slice(-10);

      const inx = qty.toString().indexOf(".");
      let decimalQty = "000";
      if (inx > 0) {
        decimalQty = qty.toString().substring(inx + 1);
        decimalQty = ("000" + decimalQty).slice(-3);
      }
      const barcode = row.barcode === '-' ? "0000000000000" : ("000000000000" + row.barcode).slice(-13);
      data += `${barcode}${intQty}${decimalQty}\n`;
    });

    return data;
  }

  inventoryReport() {
    this.result = Object.keys(this.articles).reduce((acc, k) => {
      const difference =
        this.articles[k].inStock ||
        this.articles[k].orpakStock ||
        this.articles[k].difference;
      if (difference) {
        acc.push({
          ...this.articles[k],
          barcode: this.articles[k].barcode ? this.articles[k].barcode[0] : "-",
          sapcode: k,
          index: acc.length + 1
        });
      }

      return acc;
    }, []);

    return this.result;
  }
}

module.exports = new Inventory();
