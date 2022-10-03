import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import fs from "fs";
import cors from "cors";
import https from "https";
import {apiv1} from "./routes/apiv1.js";
import {apiv2} from "./routes/apiv2.js";


const app = express();
const PORT = process.env.PORT || 5000;

// Creating object of key and certificate
// for SSL
const options = {
  key: fs.readFileSync("server.key"),
  cert: fs.readFileSync("server.cert"),
};

//static folder for serving icons
app.use(express.static("icons"))

//middleware
app.use(cors())
app.use(express.json()) //for raw json
app.use(express.urlencoded({extended:false}))
app.all('/*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

function reportRequest(req,res,next){
    console.log(req.url);
    next()
}
app.use(reportRequest);


//ROUTES

app.use("/api/v1", apiv1);
app.use("/api/v2", apiv2);


https.createServer(options, app)
.listen(PORT, function (req, res){
    console.log(`Server running on PORT: ${PORT}`)
});

// app.listen(PORT, () => {
//     console.log(`Server running on PORT: ${PORT}`);
// })