const puppeteer = require('puppeteer-extra')
// https://rapidapi.com/restyler/api/scrapeninja
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const nReadlines = require('n-readlines');
puppeteer.use(StealthPlugin())

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
    if (srcAvailability == 'Agotado') srcAvailability = 'OUT OF STOCK'
    else srcAvailability = 'IN STOCK'

    // Price
    const[el2] = await page.$x('//*[@id="normalpricenumber"]')
    const price = await  el2.getProperty('textContent');
    const srcPrice = await price.jsonValue();

    // Name
    const[el3] = await page.$x('//*[@id="coolbody"]/div/div[2]/div[3]/div/div[2]/h1')
    const name = await  el3.getProperty('textContent');
    const srcName = await name.jsonValue();

    console.log({srcAvailability,srcPrice, srcName})

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
    if (srcAvailability == 'Avísame') srcAvailability = 'OUT OF STOCK'
    else srcAvailability = 'IN STOCK'


    // Price
    const[el2] = await page.$x('//*[@id="precio-main"]')
    const price = await  el2.getProperty('textContent');
    const srcPrice = await price.jsonValue();

    // Name
    const[el3] = await page.$x('//*[@id="contenedor-principal"]/div[2]/div/div[3]/div/div/div[1]/h1/strong')
    const name = await  el3.getProperty('textContent');
    const srcName = await name.jsonValue();

    console.log({srcAvailability,srcPrice, srcName})

    await page.close();
    await browser.close()

    return {srcName, srcAvailability,srcPrice}
}

// main
let broadbandLines = new nReadlines('cm.txt');
while (line = broadbandLines.next()) {
    CMretrieve(line.toString('ascii'));
}
broadbandLines = new nReadlines('pc.txt');
while (line = broadbandLines.next()) {
    PCretrieve(line.toString('ascii'));
}
