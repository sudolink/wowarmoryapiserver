import {Router} from "express";
import fs from "fs";
import path from "path";
import {createNewConn} from "../dbHelp.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ICON_DIR = path.join(__dirname, "/icons/")

const apiv1 = Router();

apiv1.get("/getAllCharNames", (req,res) => {
    let dbConn = createNewConn();
    dbConn.connect();
    dbConn.query("SELECT name FROM characters", (err, rows, fields) => {
            if (err) throw err;
            //send all charnames to frontend so we don't have to query the backend on every keystroke in the search field.
            //this gets requested on load on the frontend
            res.status(200).send(rows);
            console.log("fetched all chars...")
    });
    dbConn.end();    
})

apiv1.get("/getchar", (req,res) => {
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

apiv1.get("/getchargear", (req,res)=> {
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

apiv1.get("/getbaseitem", (req,res) => {
    //console.log(req.query.item_template);
    if(req.query.item_template != undefined){
        let dbConn = createNewConn("mangos"); //base item info is in this DB
        const queryStringItem = `SELECT * FROM item_template WHERE entry=${req.query.item_template} AND class IN (2,4)`;
        dbConn.connect();
        dbConn.query(queryStringItem, (err,rows,fields) => {
            if(err == null){
                if(rows.length > 0){
                    let iconQuery = `SELECT icon FROM item_display_info WHERE id=${rows[0].display_id}`;
                    dbConn.query(iconQuery, (errInner,rowsInner,fieldsInner)=> {
                        if(errInner == null){
                            if(rowsInner.length > 0){
                                rows[0].icon = rowsInner[0].icon;
                                res.status(200).send(rows);
                                dbConn.end()
                            }else{
                                res.status(404).send("Item icon not found")
                                dbConn.end()
                            }
                        }else{
                            res.status(500).send("DBERR: "+errInner)
                            dbConn.end()
                        }
                    })
                }else{
                    res.status(404).send("Item not found");
                    dbConn.end()
                }
            }else{
                res.status(500).send("DBERR: "+err);
                dbConn.end()
            }
        });
    }
})

apiv1.get("/getitemicon", (req,res) => {
    //console.log(req.query.display_id);
    if(req.query.display_id != undefined){
        let dbConn = createNewConn("mangos"); //icon info is in here
        const queryString = `SELECT icon FROM item_display_info WHERE id=${req.query.display_id}`;
        dbConn.connect();
        dbConn.query(queryString, (err, rows, fields) => {
            //check if icon exists
            if(err == null){
                if(rows.length > 0){
                    let iconName = `${rows[0].icon}.png`;
                    let iconPath =   path.join(ICON_DIR, iconName);
                    if(fs.existsSync(iconPath)){
                        rows[0].url = `${req.protocol}://${req.get('host')}/${iconName}`;
                    }else{
                        rows[0].url = null;
                    }
                    console.log(rows[0]);
                    res.status(200).send(rows);
                }else{
                    res.status(404).send("not found");
                }
            }else{
                res.status(500).send("server Err: "+err);
            }
        })
        dbConn.end();
    }
})


export {
    apiv1
};