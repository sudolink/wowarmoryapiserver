import * as dotenv from "dotenv";
dotenv.config()
import mysql from "mysql";

function createNewConn(db='characters'){
    const dbConn = mysql.createConnection({
        host: process.env.DB_IP,
        user: process.env.DB_USER,
        password: process.env.DB_PW,
        database: db // will need access to both 'characters' and 'mangos'
    })
    return dbConn
}

function checkNameValid(name){
    //regex expression here to check for spaces, special chars,
    return true //while developing...
}

function getAllChars(){
    console.log("empty")
}

function getChar(charName){
    if(checkNameValid(charName)){
        const charQuery = `SELECT guid,name,race,class,gender,level,online FROM characters WHERE name="${charName}"`;
        let curConn = createNewConn();
        curConn.query(charQuery, (err, rows, fields) => {
            if(err != null){
                curConn.end()
                return "DBERR: " + err;
            }else{
                if(rows.length < 1){
                    curConn.end()
                    return "No such character found"
                }else{
                    curConn.end()
                    return rows[0];
                }
            }
        })
    }else{
        return "Invalid name: " + charName;
    }
}

export {
    createNewConn,
    checkNameValid,
    getAllChars,
    getChar
};