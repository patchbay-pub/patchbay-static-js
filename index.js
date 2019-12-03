#!/usr/bin/env node

const http = require('patchbay-http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const process = require('process');
const mime = require('mime');

if (process.argv.length < 3) {
  throw new Error("Not enough args");
}

const rootChannel = process.argv[2];

const srv = http.createServer(async (req, res) => {

  const rootDir = './';

  const urlParts = url.parse(req.url);

  res.setHeader('Pb-Res-Content-Type', mime.getType(req.url));

  try {
    const childPath = path.join(rootDir, urlParts.pathname.slice(rootChannel.length));
    const stats = await fs.promises.stat(childPath);

    if (stats.isFile()) {
      const stream = fs.createReadStream(childPath);
      stream.pipe(res);
    }
    else {

      const indexPath = path.join(childPath, 'index.html');

      try {
        const indexStats = await fs.promises.stat(indexPath);
        res.setHeader('Pb-Res-Content-Type', 'text/html');
        const indexStream = fs.createReadStream(indexPath);
        indexStream.pipe(res);
      }
      catch (e) {
        console.log(e);
        res.setHeader('Pb-Status', '404');
        res.write("Not found");
        res.end();
      }
    }
  }
  catch (e) {
    console.error(e);
    res.setHeader('Pb-Status', '404');
    res.write("Not found");
    res.end();
  }
});

srv.setPatchbayServer('https://beta.patchbay.pub');
//srv.setPatchbayServer('http://localhost:9001');
srv.setPatchbayChannel(rootChannel);
// TODO: implement setNumWorkers
//srv.setNumWorkers(4);

srv.listen(3000);
