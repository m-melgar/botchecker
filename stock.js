const puppeteer = require('puppeteer-extra')
// https://rapidapi.com/restyler/api/scrapeninja
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const nReadlines = require('n-readlines')
puppeteer.use(StealthPlugin())
const fs = require('fs')
const beep = require('beepbeep')

async function CMretrieve(url){
    const browser = await puppeteer.launch();
    const page = await browser.newPage()
    await page.goto(url,{
        waitUntil: 'load',
        // Remove the timeout
        timeout: 0
    });

    // Availability
    const[el] = await page.$x('//*[@id="messageStock"]')
    const avail = await  el.getProperty('textContent');
    let srcAvailability = await avail.jsonValue();
    if (srcAvailability == 'Agotado') srcAvailability = 0
    else srcAvailability = 1

    // Price
    const[el2] = await page.$x('//*[@id="normalpricenumber"]')
    const price = await  el2.getProperty('textContent');
    const srcPrice = await price.jsonValue();

    // Name
    const[el3] = await page.$x('//*[@id="coolbody"]/div/div[2]/div[3]/div/div[2]/h1')
    const name = await  el3.getProperty('textContent');
    const srcName = await name.jsonValue();


    await page.close();
    await browser.close()

    return {srcAvailability,srcPrice, srcName}
}

async function PCretrieve(url){
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url,{
        waitUntil: 'load',
        // Remove the timeout
        timeout: 0
    });

    // const status =response.status()
    // // print status
    // console.log(response.status());

    // Availability
    const[el] = await page.$x('//*[@id="js-article-buy"]')
    const avail = await  el.getProperty('textContent');
    let srcAvailability = await avail.jsonValue();
    srcAvailability = srcAvailability.replace(/\n]|\n/gi, '')
    if (srcAvailability == 'Avísame') srcAvailability = 0
    else srcAvailability = 1


    // Price
    const[el2] = await page.$x('//*[@id="precio-main"]')
    const price = await  el2.getProperty('textContent');
    const srcPrice = await price.jsonValue();

    // Name
    const[el3] = await page.$x('//*[@id="contenedor-principal"]/div[2]/div/div[3]/div/div/div[1]/h1/strong')
    const name = await  el3.getProperty('textContent');
    const srcName = await name.jsonValue();

    await page.close();
    await browser.close()

    return {srcName, srcAvailability,srcPrice}
}

// main
// if db do not exist, create it, other wise read it
const db_path = './db.json'
var db = {};
try {
    if (fs.existsSync(db_path)) {
        // file exist
        db= require(db_path);
    }else{
        // file doesn't exist
        var dictstring = JSON.stringify(db);
        fs.writeFile(db_path, dictstring, function(err, result) {
            if(err) console.log('error', err);
        });
    }
} catch(err) {
    console.error(err)
}

let broadbandLines = new nReadlines('cm.txt');
while (line = broadbandLines.next()) {
    let output;
    (async () => {
        var url = line.toString('ascii')
        output = await CMretrieve(url);
        // if exist in db
        if (url in db){
            // if price decreased and in stock
            if(output.srcPrice < db[url][1] && output.srcAvailability === 1){
                console.log(output.srcPrice, 'IN STOCK')
                beep(3, 1000)
            }else if (db[url][0] === 0 && output.srcAvailability ===1){
                console.log(output.srcPrice, 'IN STOCK')
                beep(3, 1000)
            }else{}
        // no existe en db
        }else{
            console.log('adding to db... CM')
            db[url] = [output.srcAvailability, output.srcPrice]
            if(output.srcAvailability ===1){
                console.log(output.srcPrice, 'IN STOCK')
                beep(3, 1000)
            }
        }
        var dictstring = JSON.stringify(db);
        fs.writeFile(db_path, dictstring, function(err, result) {
            if(err) console.log('error', err);
        });
    })()

}
broadbandLines = new nReadlines('pc.txt');
while (line = broadbandLines.next()) {
    let output;
    (async () => {
        var url = line.toString('ascii')
        output = await PCretrieve(url);
        // if exist in db
        if (url in db){
            // if price decreased and in stock
            if(output.srcPrice < db[url][1] && output.srcAvailability === 1){
                console.log(output.srcPrice, 'IN STOCK')
                beep(3, 1000)
            }else if (db[url][0] === 0 && output.srcAvailability ===1){
                console.log(output.srcPrice, 'IN STOCK')
                beep(3, 1000)
            }else{}
        // no existe en db
        }else{
            console.log('adding to db...')
            db[url] = [output.srcAvailability, output.srcPrice]
            if(output.srcAvailability ===1){
                console.log(output.srcPrice, 'IN STOCK')
                beep(3, 1000)
            }
        }
        var dictstring = JSON.stringify(db);
        fs.writeFile(db_path, dictstring, function(err, result) {
            if(err) console.log('error', err);
        });
    })()

}
