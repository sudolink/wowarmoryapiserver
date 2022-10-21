import {Router} from "express";
import {createNewConn, checkNameValid} from "../dbHelp.js"
import {getSkill, getAbilitySkillLineDetails, isTalent, getTalentTreesForClass} from "../dbcHelp.js";
const apiv2 = Router();


apiv2.get("/getAllChars", (req,res) => {
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

apiv2.get("/getCharAndGear", (req,res)=>{
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
                            //2nd nested query (item details) %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
                            charConn.end()//can safely close 'characters' db connection
                            let itemEntries = dbResponse.equipment.map(item => {
                                return item.item_id;
                            })
                            let itemBasesQuery = `SELECT * FROM item_template WHERE entry IN (${itemEntries}) AND class IN (2,4);`;
                            mangosConn.query(itemBasesQuery, (err,rows,fields)=>{
                                if(err){
                                    res.status(500).send(`2nd nested -> DBERR ${err}`);
                                    mangosConn.end()
                                }else{
                                    rows.forEach(re => {
                                        dbResponse.equipment = dbResponse.equipment.map(item => {
                                            return item.item_id == re.entry
                                                    ? {...item, ...re}
                                                    : {...item}
                                        })
                                    })
                                    // 3rd nested query ??????????????????????????????????????????????????????????????????????????????????????
                                    let itemDisplayIds = dbResponse.equipment.map(item => {
                                        return item.display_id;
                                    })
                                    let itemIconQuery = `SELECT id,icon FROM item_display_info WHERE id IN (${itemDisplayIds})`; //req mangos connection
                                    mangosConn.query(itemIconQuery, (err, rows, fields) => {
                                        if(err){
                                            res.status(500).send(`3rd nested => DBERR ${err}`)
                                            mangosConn.end()
                                        }else{
                                            rows.forEach(row => {
                                                dbResponse.equipment = dbResponse.equipment.map(item => {
                                                    return item.display_id == row.id
                                                            ? {...item, icon: row.icon}
                                                            : {...item}
                                                })
                                            })
                                            res.status(200).send(dbResponse);
                                            mangosConn.end()
                                        }
                                    })
                                    //????????????????????????????????????????????????????????????????????????????????????????????????????????
                                }
                            })
                            //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
                        }
                    })                    
                    //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
                }
            }
        })
    }
})

// apiv2.get("/getCharLevelBool",(req,res) => {
//     let charConn = createNewConn('characters');
//     console.log(`char guid #${req.query.guid} being requested`)
//     let levelQuery = `SELECT level FROM characters WHERE guid = ${req.query.guid}`;
//     charConn.connect();
//     charConn.query(levelQuery, (err, rows, fields) => {
//         if(err){
//             res.status(500).send(err);
//             charConn.end();
//         }else{
//             if(rows.length < 1){
//                 res.status("404").send("Query returned 0 results");
//                 charConn.end();
//             }else
//                 res.status(200).send(rows);
//                 charConn.end();
//             }
//         }
//     })
// })

apiv2.get("/getCharSkillLineAbilities", (req,res) => {
    let charConn = createNewConn('characters');
    console.log(`char guid #${req.query.guid} being requested`)
    const dbQueryRe = {class: null, skills: null, abilities: null};
    let levelQuery = `SELECT level,class FROM characters WHERE guid = ${req.query.guid}`;
    let charSkillsQuery = `SELECT * FROM character_skills WHERE guid = ${req.query.guid}`;
    charConn.connect();
    charConn.query(levelQuery, (err, rows, fields) => {
        if(err){
            res.status(500).send(err);
            charConn.end()
        }else{
            if(rows.length < 1){
                res.status("404").send("Query returned 0 results");
                charConn.end()
            }else{
                if(rows[0].level >= 10){
                    //do the rest of the queries
                    dbQueryRe.class = rows[0].class
                    getTalentTreesForClass(dbQueryRe.class);
                    charConn.query(charSkillsQuery, (err,rows,fields) => {
                        if(err){
                            res.status(500).send(err);
                            charConn.end();
                        }else{
                            if(rows.length < 1){
                                res.status(404).send("Query returned 0 results");
                                charConn.end()
                            }else{
                                dbQueryRe.skills = rows;
                                //nested query begins here
                                let charAbilitiesQuery = `SELECT * FROM character_spell WHERE guid = ${req.query.guid} AND active = 1`;
                                charConn.query(charAbilitiesQuery, (err,rows,fields) => {
                                    if(err){
                                        res.status(500).send(err);
                                        charConn.end();
                                    }else{
                                        if(rows.length < 1){
                                            res.status(404).send("Query returned 0 results");
                                            charConn.end()
                                        }else{
                                        //2nd nested query begins here
                                            //can close characters conn, because we need spell_templates from mangos now
                                            charConn.end()
                                            let mangosConn = createNewConn('mangos');
                                            let spellList = rows.map(row => row['spell']) //only spell ids
                                            let onlyTalentsSpellList = [];
                                            spellList.map(spellID => {
                                                isTalent(spellID) && onlyTalentsSpellList.push(spellID); 
                                            })
                                            let spellTemplateQuery = `SELECT * FROM spell_template WHERE entry in (${onlyTalentsSpellList})`;
                                            mangosConn.connect();
                                            mangosConn.query(spellTemplateQuery, (err,rows,fields) =>{
                                                if(err){
                                                    res.status(500).send(err);
                                                    mangosConn.end()
                                                }else{
                                                    if(rows.length < 1){
                                                        res.status(404).send("Query returned 0 results");
                                                        mangosConn.end();
                                                    }else{
                                                        dbQueryRe.abilities = rows;
                                                        let adjustForBuild = {};
                                                        dbQueryRe.abilities.map(ability => {
                                                            if(adjustForBuild.hasOwnProperty(ability)){ //if ability has already been stored (previous builds of it from the db re)
                                                                adjustForBuild[ability.entry] = ability.build > adjustForBuild[ability.entry].build ? {...ability} : adjustForBuild[ability.entry];
                                                            }else{
                                                                adjustForBuild[ability.entry] = {...ability}
                                                            }
                                                        })
                                                        dbQueryRe.abilities = adjustForBuild;
                                                        res.status(200).send(dbQueryRe);
                                                        mangosConn.end();
                                                    }
                                                }
                                            })
                                        //2nd nested query ends here
                                        }
                                    }
                                })
                                //nested query ends here
                            }
                        }
                    })
                }else{
                    //char too low level, abort
                    res.status(404).send("Character too low level")
                    charConn.end()
                }
            }
        }
    })
})

apiv2.get("/getItemInstance", (req,res) => {
    let [charConn] = [createNewConn('characters')]
    console.log("item guid #",req.query.itemGuid," being requested");
    let itemInstanceQuery = `SELECT * FROM item_instance WHERE guid=${req.query.itemGuid}`
    charConn.query(itemInstanceQuery, (err,rows,fields) =>{
        if(err != null){
            res.status(500).send(`ItemInstanceQuery DBERR -> ${err}`)
            charConn.end()
        }else{
            if(rows.length < 1){
                res.status(404).send("Query returned no results");
                charConn.end()
            }else{
                let dbRe = rows[0];
                res.status(200).send(dbRe);
                charConn.end();
            }
        }
    })
})

export {
    apiv2
}