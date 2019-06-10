const fs = require('fs');
//fs = file system
const http = require('http');
const url = require('url');

const json = fs.readFileSync(`${__dirname}/data/data.json`, 'utf-8')
//readFileSync is a method of 'fs'
// utf-8 = character encoding () | if we don't specify this code, instead of returning a file, it will return a buffer
// sync = blocking, it makes the entire code stop, for the time that the function is doing its work

const laptopData = JSON.parse(json);    //parse into Array[Object{properties}] JavaScript format

// console.log(__dirname);     //  ...\99-bonus-1\starter
// console.log(json);       //still json format
// console.log(laptopData);     

const server = http.createServer((req, res) => {
    // req = request Object, res= response Object

    // console.log('Someone did access the server!');
    // console.log(req.url);   //get URL that we typed
    // for example : we type 127.0.0.1/products
    // req.url = /products

    const pathName = url.parse(req.url, true).pathname;
    // pathName = /products
    // console.log(pathName);

    /* 
        id=4 | id=1 -> query
        console.log(url.parse(req.url, true))
        url {
            query: { id: '4' },
        }

        for example we typed:
        127.0.0.1:1337/laptop?id=4&name=apple&date=today
        console.log(url.parse(req.url, true))
        url {
            query: { id: '4', name: 'apple', date: 'today' },
        }
    */
    const id = url.parse(req.url, true).query.id;   // id = 4

    // PRODUCTS OVERVIEW
    if (pathName === '/products' || pathName === '/') {
        res.writeHead(200, {'Content-type': 'text/html'});
        // writeHead = write a header
        // 200 = HTTP status code (okay)    (404 = error)

        fs.readFile(`${__dirname}/templates/template-overview.html`, 'utf-8', (err, data) => {
            // Wait until node finish reading our file, then calls our callback, and passes the 'data' into that callback
            let overviewOutput = data;
        

            fs.readFile(`${__dirname}/templates/template-card.html`, 'utf-8', (err, data) => {
                // Wait until node finish reading our file, then calls our callback, and passes the 'data' into that callback
                
                const cardsOutput = laptopData.map(el => replaceTemplate(data, el)).join('');
                // data = originalHtml, el = laptopData[el]
                // from array -> .join('') -> string

                overviewOutput = overviewOutput.replace('{%CARDS%}' ,cardsOutput)

                res.end(overviewOutput);
            });
        });
    } 

    // LAPTOP DETAIL
    else if ( pathName === '/laptop' && id < laptopData.length) {
        res.writeHead(200, {'Content-type': 'text/html'});
        // res.end(`This is the LAPTOP page for laptop ${id} !`);

        fs.readFile(`${__dirname}/templates/template-laptop.html`, 'utf-8', (err, data) => {
            // Wait until node finish reading our file, then calls our callback, and passes the 'data' into that callback
            const laptop = laptopData[id];
            const output = replaceTemplate(data, laptop);
            // data = originalHtml | laptop = Object

            res.end(output);
        });
    } 
    // IMAGES REQUEST
    else if ((/\.(jpg|jpeg|png|gif)$/i).test(pathName)) { 
    /*
        Test if our pathName contains .(jpg) or .(jpeg) or (png) or (gif)
        /macbook-pro-15.jpg
        /dell-xps-13.png
        /asus-zenbook-flip-s.jpg
        All images = pathName
    */
        fs.readFile(`${__dirname}/data/img${pathName}`, (err, data) => {
            res.writeHead(200, {'Content-type': 'image/jpg'});
            res.end(data);

        });
        // Image doesn't need character encoding
    }

    // URL NOT FOUND
    else {
        res.writeHead(404, {'Content-type': 'text/html'});
        res.end('URL was not found on the server!');
    }   
})


server.listen(1337, '127.0.0.1', () => {
    console.log('Listening for requests now!')
})
// To tell node.js to always keep listening on a certain port on a certain IP address
// 1337 = standard PORT in Node (maybe 3000, 8000, 80)
// localHost gets this standard IP address(127.0.0.1)

// request port 1337, and 127.0.0.1 IP address
// When we access 127.0.0.1:1337 on browser, it will return 'Someone did access the server!' on console

// Routing = respond in different ways for different URLs

function replaceTemplate(originalHtml, laptop) {
    let output = originalHtml.replace(/{%PRODUCTNAME%}/g, laptop.productName);
    output = output.replace(/{%IMAGE%}/g, laptop.image);
    output = output.replace(/{%PRICE%}/g, laptop.price);
    output = output.replace(/{%SCREEN%}/g, laptop.screen);
    output = output.replace(/{%CPU%}/g, laptop.cpu);
    output = output.replace(/{%STORAGE%}/g, laptop.storage);
    output = output.replace(/{%RAM%}/g, laptop.ram);
    output = output.replace(/{%DESCRIPTION%}/g, laptop.description);
    output = output.replace(/{%ID%}/g, laptop.id);
    // console.log(output);    //All template=laptop HTML sentences with replaced data
    // all is using RegEx/
    //.replace = returns a new string

    return output;
}