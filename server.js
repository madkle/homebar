const express = require("express");
const request = require("request");
const server = express();

const routes = require("./router.js")

const port = process.env.PORT || 8080;

server.set("port", port);
server.use(express.static("public"));
server.use(express.json());


server.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	next();
});

server.use(routes)
  
// start server ------------------------

server.listen(server.get("port"), function () {
	console.log("server running", server.get("port"));
});