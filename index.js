import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import {createNewConn} from "./dbHelp.js";

const app = express();
const PORT = process.env.PORT || 5000;

//static folder for serving icons
app.use(express.static("icons"))

//middleware
app.use(express.json()) //for raw json
app.use(express.urlencoded({extended:false}))

function reportRequest(req,res,next){
    console.log(req.url);
    next()
}
//app.use(reportRequest);

app.get("/api/getAllCharNames", (req,res) => {
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

app.get("/api/getchar", (req,res) => {
    // console.log(req.query.name);
    if(req.query.name != undefined) {
        let dbConn = createNewConn();
        dbConn.connect()
        const queryName = req.query.name;
        dbConn.query(`SELECT guid,name,race,class,gender,level,online FROM characters WHERE name="${queryName}"`, (err,rows,fields) => {
            err == null ?
            rows.length < 1 ?
            res.status(404).send("No such character"):
            res.status(200).send(rows):
            res.status(404).send("Invalid input");
        })
        dbConn.end();
    }
})

app.get("/api/getchargear", (req,res)=> {
    //console.log(req.query.guid)
    if(req.query.guid != undefined){
        let dbConn = createNewConn()
        const queryString = `SELECT slot, item, item_template FROM character_inventory WHERE guid=${req.query.guid} AND bag=0 AND slot < 19 ORDER BY slot`;
        dbConn.connect()
        dbConn.query(queryString, (err,rows,fields)=>{
            res.status(200).send(rows);
            // console.log(rows);
        })
        dbConn.end()
    }
})

app.get("/api/getbaseitem", (req,res) => {
    console.log(req.query.item_template);
    if(req.query.item_template != undefined){
        let dbConn = createNewConn("mangos"); //base item info is in this DB
        const queryStringItem = `SELECT * FROM item_template WHERE entry=${req.query.item_template} AND class IN (2,4)`;
        dbConn.connect();
        dbConn.query(queryStringItem, (err,rows,fields)=>{
            res.status(200).send(rows);
        })
        dbConn.end();
    }
})

app.get("/api/getitemicon", (req,res) => {
    console.log(req.query.display_id);
    if(req.query.display_id != undefined){
        let dbConn = createNewConn("mangos"); //icon info is in here
        const queryString = `SELECT icon FROM item_display_info WHERE id=${req.query.display_id}`;
        dbConn.connect();
        dbConn.query(queryString, (err, rows, fields) => {
            res.status(200).send(rows);
        })
        dbConn.end();
    }
})

app.listen(PORT, () => {
    console.log(`Server running on PORT: ${PORT}`);
})