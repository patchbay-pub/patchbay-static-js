#!/usr/bin/env node

const http = require('patchbay-http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const process = require('process');

if (process.argv.length < 3) {
  throw new Error("Not enough args");
}

const rootChannel = process.argv[2];

const srv = http.createServer(async (req, res) => {

  const urlParts = url.parse(req.url);

  const rootDir = './';

  try {
    const filePath = path.join(rootDir, urlParts.pathname.slice(rootChannel.length));
    const stats = await fs.promises.stat(filePath);
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  }
  catch (e) {
    console.error(e);
    res.write("Fail");
    res.end();
  }
});

srv.setPatchbayServer('https://beta.patchbay.pub');
//srv.setPatchbayServer('http://localhost:9001');
srv.setPatchbayChannel(rootChannel);

srv.listen(3000);
