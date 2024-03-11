const { HTTP_SERVER_PORT } = require("./app.config.cjs");

// Taken from https://medium.com/@amitgupta15/minimal-http-server-in-node-js-without-framework-aede70695fc0
// This is just a minimal server so we can bundle it all together
// Ideally this is hosted externally so you can update it at any time
const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");

const baseDir = path.join(__dirname, "./browser");

const httpServer = http.createServer((request, response) => {
  const parsedUrl = url.parse(request.url, true);
  let pathName =
    (parsedUrl.pathname === "/" && "/index.html") || parsedUrl.pathname;

  const responseContentType = getContentType(pathName);
  response.setHeader("Content-Type", responseContentType);
  fs.readFile(`${baseDir}${pathName}`, (error, data) => {
    if (!error) {
      response.writeHead(200);
      response.end(data);
    } else {
      response.writeHead(404);
      response.end("404 - File Not Found");
    }
  });
});

const mimeTypes = {
  ".html": "text/html",
  ".jpg": "image/jpeg",
  ".css": "text/css",
  ".js": "text/javascript",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

const getContentType = (pathName) => {
  let contentType = "application/octet-stream";
  for (var key in mimeTypes) {
    if (mimeTypes.hasOwnProperty(key)) {
      if (pathName.indexOf(key) > -1) {
        contentType = mimeTypes[key];
      }
    }
  }
  return contentType;
};

const runServer = (app, context) => {
  httpServer.listen(HTTP_SERVER_PORT, () => {
    console.log(`Server is running at http://127.0.0.1:${HTTP_SERVER_PORT}`);
  });
};

module.exports = { runServer };
