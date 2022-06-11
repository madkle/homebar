const express = require("express")
let router = express.Router();
const pg = require("pg");
const auth = require("./modules/auth.js");
const dbURI = "postgres://chhoasjgudhfpk:65486a863c32decb4666b14c38e743cd95ffff7b66bf8d48ba236789dc75a4d6@ec2-34-246-227-219.eu-west-1.compute.amazonaws.com:5432/d7su1mm6jfs240";
const connstring = process.env.DATABASE_URL || dbURI;
const pool = new pg.Pool({
    connectionString: connstring,
    ssl:{rejectUnauthorized: false}
}); 


// user ------------------------------------------

router.put("/user", async function(req, res, next)  {
    let updata = req.body;
    let credstring = req.headers.authorization;
    let cred = "";
    if (credstring !== "") {
        cred = auth.decodeCred(credstring);
        updata.username = cred.username;
        let hash = auth.createHash(cred.password);
        updata.password = hash.value;
        updata.salt = hash.salt;
    }
    try{
        let count = 2;
        let sql = `UPDATE users SET`;
        let values = [updata.bid];
        for (const key in updata) { 
            if (key=== "id") {continue}
            if(count === 2){
                sql += ` ${key} = $${count}`;
            }else{
                sql += `, ${key} = $${count}`;
            }
            values.push(updata[key]);
            count++;
        }
        sql += ` WHERE id = $1 returning *`;
        let result= await pool.query(sql, values);
        if(result.rows.length > 0){
            res.status(200).json({msg : "Updated the database"}).end();
        }
        else{
            throw "could not add to the database.";
        }
        
    }catch(err){
        res.status(500).json({error: err}).end();
    }
});

router.get("/user", async function(req, res, next){
    let sql = `
    SELECT * 
    FROM users
    ORDER BY id
    `;
    try {
        let result = await pool.query(sql);
        res.status(200).json(result.rows).end();
    } catch (err) {
        res.status(500).json({error:err}).end();
    }
});

//hent spesifikk user
router.get("/user/:id", async function(req, res, next){
    let inpId = req.params.id;
    let sql = `
    SELECT * 
    FROM users
    WHERE id = ${inpId}
    `;
    try {
        let result = await pool.query(sql);
        res.status(200).json(result.rows).end();
    } catch (err) {
        res.status(500).json({error:err}).end();
    }
});
// slett slet spesefik bruker
router.delete("/user/:id", async function(req, res, next){
    inpId = req.params.id;
    let sql = `
    DELETE FROM users 
    WHERE id = ${inpId} 
    RETURNING *
    `;
    try {
        let result = await pool.query(sql);
        res.status(200).json(result.rows).end();
    } catch (err) {
        res.status(500).json({error:err}).end();
    }
});
// publiserer ny bruker
router.post("/user", async function(req, res, next)  {

    let updata = req.body;
    let credstring = req.headers.authorization;
    let cred = auth.decodeCred(credstring);
    
    if (cred.username === "" || cred.password === "") {
        res.status(401).json({error: "No username or password"}).end();
        return
    }

    let hash = auth.createHash(cred.password)
    try{
        let sql = "INSERT INTO users (id, username, password, salt) VALUES (DEFAULT, $1, $2, $3) returning *";
        let values = [cred.username, hash.value, hash.salt];
        let result= await pool.query(sql, values);
        if(result.rows.length > 0){
            res.status(200).json({msg : "added to database"}).end();
        }
        else{
            throw "Could not add to the database.";
        }
    }catch(err){
        res.status(500).json({error: err}).end();
    }
    
});

// login bruker
router.post("/user/login", async function(req, res, next)  {
    let credstring = req.headers.authorization;
    let cred = auth.decodeCred(credstring);
    
    if (cred.username === "" || cred.password === "") {
        res.status(401).json({error: "No username or password"}).end();
        return
    }

    try{
        let sql = `
        SELECT * 
        FROM users
        WHERE username = $1
        `;
        let values = [cred.username];
        let result= await pool.query(sql, values);
        if(result.rows.length > 0){
            let userID = result.rows[0].id;
            let username = result.rows[0].username;
            let hashPassword = result.rows[0].password; 
            let salt = result.rows[0].salt;

            if (auth.verifyPassword(cred.password, hashPassword, salt)) {
                let newToken = auth.createToken(username,userID);
                
                res.status(200).json({
                    msg : "Successful Login",
                    token: newToken,
                    userid: userID
                }).end();
            }else{
                res.status(401).json({error: "Wrong username or password"}).end();
                return;
            }
            
        }
        else{
            res.status(401).json({error: "Wrong username and/or password"}).end();
            return;
        }
        
    }catch(err){
        res.status(500).json({error: err}).end();
    }
    
});

router.get("/auth", async function(req, res, next){
    let token = req.headers.token;
    try {
        let payload = auth.verifyToken(token)
        res.status(200).json(payload).end();
    } catch (err) {
        res.status(500).json({error:err}).end();
    }
    
});

module.exports = router;