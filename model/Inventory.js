class Inventory {
  constructor() {
    this.articles = [];
    this.fuelStation = '';
  }

  set fuelStation(code){
    this._fuelStation = code;
  }

  get fuelStation(){
    return this._fuelStation;
  }

  importCountedArticles(articles) {
    articles
      .split("\r\n")
      .slice(0, -1)
      .map(line => {
        const data = line.split(";").map(e => e);

        const pattern = /\d+/;
        const curBarcode = data[0];
        const count = Number(data[1]);

        if (!pattern.test(curBarcode)) {
          throw new Error(`${curBarcode} is invalid barcode!`);
        }

        let article = this.articles.find(
          ({ barcode }) => barcode === curBarcode
        );

        if (article) {
          const inStock = article.inStock + count;
          const difference = inStock - article.orpakStock;
          const amount = difference * article.price
          article = {
            ...article,
            inStock,
            amount: amount.toFixed(2),
            difference
          };

          const articleIndex = this.articles.findIndex(
            ({ barcode }) => barcode === curBarcode
          );
          this.articles.splice(articleIndex, 1, article);
        } else {
          this.articles.push({
            barcode: curBarcode,
            orpakStock: 0,
            inStock: count,
            difference: count
          });
        }
      });

    return this.articles;
  }

  importOrpakArticles(articles) {
    articles
      .split("\r\n")
      .slice(1, -1)
      .map(line => {
        const data = line.split(";").map(e => e);

        const sapcode = data[0];
        //when barcode is missing, sapcode will be using
        const barcode = data[1] ? data[1] : sapcode;
        const orpakStock = Number(data[2]);
        const price = parseFloat(data[3]);
        const regex = /\d+/;
        const inStock = 0;
        const difference = inStock - orpakStock;
        const amount = difference * price;

        if (!regex.test(sapcode) && sapcode.length !== 9) {
          throw Error(`SAP code (${sapcode}) is not valid!`);
        }

        if (!regex.test(barcode) && barcode.length > 13) {
          throw Error(`BARCODE (${barcode}) is not valid!`);
        }

        const article = {
          sapcode,
          barcode,
          orpakStock,
          inStock,
          difference,
          price,
          amount: amount.toFixed(2)
        };

        this.articles.push(article);
      });

    return this.articles;
  }

  importSapArticles(articles) {
    articles
      .split("\r\n")
      .slice(1, -1)
      .map(line => {
        const data = line.split(";").map(e => e);

        const curSapcode = data[0];
        const name = data[1];
        const supplier = data[2];
        const pattern = /\d+/;

        if (!pattern.test(curSapcode)) {
          throw Error(`${curSapcode} is not a valid SAP code`);
        }

        let article = this.articles.find(
          ({ sapcode }) => sapcode === curSapcode
        );
        if (article) {
          article = {
            ...article,
            name,
            supplier
          };
          const articleIndex = this.articles.findIndex(
            ({ sapcode }) => sapcode === curSapcode
          );

          this.articles.splice(articleIndex, 1, article);
        }
      });

    return this.articles;
  }

  clearData(){
    this.articles = [];
    this.fuelStation = '';
  }

  reportInventory(){
    let data = 'Sapcode;Barcode;Name;OrpakStock;In Stock;Differnce;Price;Amount;Supplier;\n';
    this.articles.forEach(row => {
      data += `${row.sapcode};${row.barcode};${row.name};${row.orpakStock};${row.inStock};${row.difference};${row.price};${row.amount};${row.supplier}\n`;
    });

    return data;
  }

  orpakReportInventory(){
    let data = '';
    this.articles.forEach(row => {
      const qty = row.inStock;
      const intQty = ('0000000000' + parseInt(qty)).slice(-10);

      const inx = qty.toString().indexOf(".");
      let decimalQty = ('000')
      if(inx > 0){
        decimalQty = qty.toString().substring(inx+1);
        decimalQty = ('000' + decimalQty).slice(-3);
      }
      const barcode = ('000000000000'+row.barcode).slice(-13);
      data += `${barcode}${intQty}${decimalQty}\n`;
    })

    return data;
  }
}

// const inventry = new Inventory();

// inventry.importOrpakArticles(`Sapcode;Barcode;stock;price\r\n
// 112000271;5205350520928;2;24.13\r\n
// 112000272;5205350520924;2;86.00\r\n
// 112000273;5205350520931;5;19.12\r\n`);

// debugger

// inventry.importCountedArticles(`5205350520928;8;Koka Kola 1.250 l\r\n5205350520924;2;Koka Kola lait 1.250 l\r\n5205350520931;10;Fanta portokal 1.250 l\r\n`);
// debugger;

// inventry.importSapArticles(`Material;Material Description;Name 1\r\n
// 112000271;NOT Зеле, моркови, майонеза 1кг;Еко България ЕАД\r\n
// 112000272;Роле за сандвичи 1кг;Саранда дистрибюшън ООД\r\n
// 112000273;Филе за сандвичи 1кг;Новира ЕООД\r\n`);

// debugger;

module.exports = new Inventory();