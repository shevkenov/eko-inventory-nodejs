class Inventory {
  constructor() {
    this.articles = [];
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
      const inStock = Number(data[1]);
      const name = data[2];

      if (barcodeRegex.test(curBarcode)) {
        let article = this.articles.find(
          ({ barcode }) => barcode === curBarcode
        );

        if (article) {
          const articleIndex = this.articles.findIndex(
            ({ barcode }) => barcode === curBarcode
          );
          article.inStock += inStock;
          const difference = article.inStock - article.orpakStock;
          const amount = difference * article.price;
          article = {
            ...article,
            difference,
            amount: amount.toFixed(2)
          };

          this.articles.splice(articleIndex, 1, article);
        } else {
          this.articles.push({
            barcode: curBarcode,
            inStock,
            name
          });
        }
      }
    });

    return this.articles;
  }

  importOrpakArticles(articles) {
    articles.split("\r\n").map(line => {
      const data = line.split(";").map(e => e);

      const curSapcode = data[0];
      //when barcode is missing, sapcode will be using
      const curBarcode = data[1] ? data[1] : curSapcode;
      let orpakStock = Number(data[2]);
      const price = parseFloat(data[3]);

      const sapcodeRegex = /^\d{9}$/;
      const barcodeRegex = /^\d{1,13}$/;

      if (sapcodeRegex.test(curSapcode) && barcodeRegex.test(curBarcode)) {
        let article = this.articles.find(
          ({ barcode }) => barcode === curBarcode
        );

        if (article) {
          const articleIndex = this.articles.findIndex(
            ({ barcode }) => barcode === curBarcode
          );
          article = {
            ...article,
            orpakStock,
            price
          };

          this.articles.splice(articleIndex, 1, article);
        } else if (curBarcode === curSapcode) {
          let articleWithSapcode = this.articles.find(
            ({ sapcode }) => sapcode === curSapcode
          );

          if (articleWithSapcode) {
            const articleIndex = this.articles.findIndex(
              ({ sapcode }) => sapcode === curSapcode
            );

            articleWithSapcode = {
              ...articleWithSapcode,
              orpakStock,
              price
            };

            this.articles.splice(articleIndex, 1, articleWithSapcode);
          }
        } else {
          this.articles.push({
            barcode: curBarcode,
            sapcode: curSapcode,
            orpakStock,
            price
          });
        }
      }
    });

    return this.articles;
  }

  importSapArticles(articles) {
    articles.split("\r\n").map(line => {
      const data = line.split(";").map(e => e);

      const curBarcode = data[0][0] === '0' ? data[0].slice(1) : data[0];
      const curSapcode = data[1];
      const articleName = data[2];
      const supplier = data[3];
      const sapcodeRegex = /^\d{9}$/;
      const barcodeRegex = /^\d{1,13}$/;

      if (sapcodeRegex.test(curSapcode) && barcodeRegex.test(curBarcode)) {
        if (!this.articles.find(({ barcode }) => barcode === curBarcode)) {
          const article = {
            sapcode: curSapcode,
            barcode: curBarcode,
            name: articleName.replace('"', ""),
            supplier,
            orpakStock: 0,
            inStock: 0,
            difference: 0,
            price: 0,
            amount: 0
          };

          this.articles.push(article);
        }
      }
    });

    return this.articles;
  }

  clearData() {
    this.articles = [];
    this.fuelStation = "";
    this.result = [];
  }

  csvExport() {
    let data =
      "No;Sapcode;Barcode;Name;OrpakStock;In Stock;Differnce;Price;Amount;Supplier;\n";
    this.result.forEach((row, idx) => {
      data += `${idx + 1};${row.sapcode};${row.barcode};${row.name};${
        row.orpakStock
      };${row.inStock};${row.difference};${row.price};${row.amount};${
        row.supplier
      }\n`;
    });

    return data;
  }

  orpakExport() {
    let data = "";
    this.result.forEach(row => {
      const qty = row.inStock;

      if (qty) {
        const intQty = ("0000000000" + parseInt(qty)).slice(-10);

        const inx = qty.toString().indexOf(".");
        let decimalQty = "000";
        if (inx > 0) {
          decimalQty = qty.toString().substring(inx + 1);
          decimalQty = ("000" + decimalQty).slice(-3);
        }
        const barcode = ("000000000000" + row.barcode).slice(-13);
        data += `${barcode}${intQty}${decimalQty}\n`;
      }
    });

    return data;
  }

  inventoryReport() {
    this.result = this.articles.reduce((acc, cur) => {
      const difference = cur.inStock || cur.orpakStock || cur.difference;
      const curSapcode = cur.sapcode;
      const isSacodeExistInAcc = acc.find(
        ({ sapcode }) => sapcode === curSapcode
      );
      if (difference && !isSacodeExistInAcc) {
        const summary = this.articles.reduce((sAcc, sCur) => {
          if (sCur.sapcode === curSapcode) {
            sAcc = {
              ...sCur,
              orpakStock: sAcc.orpakStock
                ? (sAcc.orpakStock += sCur.orpakStock)
                : sCur.orpakStock,
              inStock: sAcc.inStock
                ? (sAcc.inStock += sCur.inStock)
                : sCur.inStock
            };
          }
          return sAcc;
        }, {});
        cur = {
          ...summary,
          index: acc.length + 1
        };
        acc.push(cur);
      }
      return acc;
    }, []);

    return this.result;
  }
}

module.exports = new Inventory();