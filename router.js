const express = require("express")
let router = express.Router();
const pg = require("pg");
const dbURI = "postgres://chhoasjgudhfpk:65486a863c32decb4666b14c38e743cd95ffff7b66bf8d48ba236789dc75a4d6@ec2-34-246-227-219.eu-west-1.compute.amazonaws.com:5432/d7su1mm6jfs240";
const connstring = process.env.DATABASE_URL || dbURI;
const pool = new pg.Pool({
    connectionString: connstring,
    ssl:{rejectUnauthorized: false}
}); 




module.exports = router;