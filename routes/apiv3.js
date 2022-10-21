import {Router} from "express";
import {createNewConn, checkNameValid} from "../dbHelp.js"
const apiv3 = Router();

apiv3.get("/getAllChars", (req,res) => {
    let curConn = createNewConn();
    const allCharQuery = 'SELECT name,class,race FROM characters';
    let dbResponse = null;
    let status = 0;
    curConn.query(allCharQuery, (err, rows, fields) =>{
        if(err != null){
            curConn.end();
            dbResponse = "DBERR: "+ err;
            status = 500;
        }else{
            if(rows.length < 0){
                curConn.end();
                dbResponse = "Query result empty...";
                status = 404;
            }else{
                dbResponse = rows;
                curConn.end();
                status=200;
            }
        }
        res.status(status).send(dbResponse); //nest inside the query, at the very end because otherwise the response happens before the query executes
    })
})

apiv3.get("/getCharAndBasicGearInfo", (req,res)=>{
    // let itemInstanceQuery = 'SELECT count, charges, enchantments FROM item_instance' //don't do this one for now
    
    let [charConn, mangosConn, reStatus, dbResponse] = [createNewConn('characters'), createNewConn('mangos'), 0, null]
    if(!checkNameValid(req.query.name)){
        res.status(404).send("Invalid name requested:" + req.query.name)
    }else{    
        let charQuery = `SELECT guid,name,race,class,gender,level,online,honor_highest_rank,health,skin,face,hair_style,hair_color,facial_hair FROM characters WHERE name="${req.query.name}"`
        charConn.query(charQuery, (err,rows,fields) => {
            if(err != null){    
                res.status(500).send("DBERR: "+err);
                charConn.end();
            }else{
                if(rows.length < 1){
                    res.status(404).send("Query returned 0 results");
                    charConn.end();
                }else{
                    dbResponse = rows[0];
                    //1st nested query (gear) $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
                    let gearQuery = `SELECT slot, item_guid, item_id FROM character_inventory WHERE guid=${rows[0].guid} AND bag=0 AND slot < 19 ORDER BY slot`;
                    charConn.query(gearQuery, (err, rows, fields) => {
                        if(err){
                            res.status(500).send(`1st Nested -> DBERR ${err}`);
                            charConn.end();
                        }else{
                            dbResponse.equipment = rows;
                            if(dbResponse.equipment.length < 1){
                                res.status(404).send("NO EQUIPMENT FOUND")
                                charConn.end()
                            }else{
                                res.status(200).send(dbResponse);
                                charConn.end()
                            }
                        }
                    })                    
                    //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
                }
            }
        })
    }
})

export {
    apiv3
}