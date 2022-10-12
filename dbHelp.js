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

export {
    createNewConn,
    checkNameValid
};