require('dotenv').config();

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const port = process.env.PORT || 3001;
const {initClientDbConnection} = require("./src/helpers/dbConnection")

//API SECURITY
//app.use(helmet());

//HANDLE CORS ERROR
app.use(cors());

//LOGGER
app.use(morgan("tiny"));   

// SET BODY PARSER
app.use(bodyParser.urlencoded({ limit: '5mb',extended: true}));
app.use(bodyParser.json({limit: '5mb'}));

//Load Routers
const userRouter = require("./src/routers/user.router");
const edusourceRouter = require("./src/routers/edusource.router")
const scrapRouter = require("./src/routers/scrap.router")
const conversationRouter = require("./src/routers/conversation.router")
const collectionRouter = require("./src/routers/collection.router")
const emailRouter = require("./src/routers/emails.router")
const tokensRouter = require("./src/routers/tokens.router")

//USE ROUTERS
app.use("/v1/user", userRouter);
app.use("/v1/edusource", edusourceRouter);
app.use("/v1/scrap", scrapRouter)
app.use("/v1/conversation", conversationRouter);
app.use("/v1/collection", collectionRouter)
app.use("/v1/emails", emailRouter)
app.use("/v1/tokens", tokensRouter)


//Error handler
const handleError = require("./src/utils/errorHandler");
app.use("*", (req,res, next) =>{
   const error = new Error("Resources not found");
   error.status = 404;
   next(error) // send the error to the next router (app.use)
});


app.use((error, req, res, next) =>{
   handleError(error, res);
})

//MongoDB CONNECTION
global.clientConnection = initClientDbConnection();


app.listen(port, () =>{
   console.log("API is ready on https://localhost:${port}");
});
