import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import {createNewConn} from "./dbHelp.js";

const app = express();
const PORT = process.env.PORT || 5000;

//middleware
app.use(express.json()) //for raw json
app.use(express.urlencoded({extended:false}))

app.get("/getAllCharNames", (req,res) => {
    let dbConn = createNewConn();
    dbConn.connect();
    dbConn.query("SELECT name FROM characters", (err, rows, fields) => {
            if (err) throw err;
            //send all charnames to frontend so we don't have to query the backend on every keystroke in the search field.
            //this gets requested on load on the frontend
            res.status(200).send(rows);
    });
    dbConn.end();    
})

app.get("/getchar", (req,res) => {
    console.log(req.query.name);
    if(req.query.name != undefined) {
        let dbConn = createNewConn();
        dbConn.connect()
        const queryName = req.query.name;
        dbConn.query(`SELECT guid,name,race,class,gender,level,online FROM characters WHERE name="${queryName}"`, (err,rows,fields) => {
            res.status(200).send(rows);
        })
        dbConn.end();
    }
})

app.get("/getchargear", (req,res)=> {
    console.log(req.query.guid)
    if(req.query.guid != undefined){
        let dbConn = createNewConn()
        const queryString = `SELECT slot, item, item_template FROM character_inventory WHERE guid=${req.query.guid} AND slot<19 ORDER BY slot`;
        dbConn.connect()
        dbConn.query(queryString, (err,rows,fields)=>{
            res.status(200).send(rows);
        })
        dbConn.end()
    }
})

app.get("/getbaseitem", (req,res) => {
    console.log(req.query.item_template);
    if(req.query.item_template != undefined){
        let dbConn = createNewConn("mangos") //base item info is in this DB
        const queryString = `SELECT * FROM item_template WHERE entry=${req.query.item_template}`;
        dbConn.connect()
        dbConn.query(queryString, (err,rows,fields)=>{
            res.status(200).send(rows);
        })
        dbConn.end()
    }
})

app.listen(PORT, () => {
    console.log(`Server running on PORT: ${PORT}`);
})