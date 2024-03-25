const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const {ConnectToDb} = require('./db/db.js');
const {checkExamResultTest} = require('./helpers/creatJsonObject.js');
const {errorHandler} = require('./middleware/errorHandler.js');
const {Examcheckingbaza} = require('./models/examcheckingbaza.js')
const {router:fileRouter} = require('./routers/fileUpload.js');
const {router:userRouter} = require('./routers/user.js');
const {router:examcenterRouter} = require('./routers/examcenters.js');
const {router:resultRouter} = require('./routers/studentresult.js')
const app = express();
dotenv.config();
app.use(cors({
    origin: true,
    credentials: true
  }));
  
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

ConnectToDb();
app.use(fileRouter);
app.use(userRouter);
app.use(examcenterRouter);
app.use(resultRouter)
app.use(errorHandler);
const l = 'ZWRiF       POLADOVA      ZWKWRiYYW  297183008 ARK105130508591575Q*   CC  BEC  E     D A AA';

// checkExamResultTest('659520874e89db8b6b70fce5',l)

// console.log(parseInt(4.91+1))
// console.log(process.env.JWT_SECRET_KEY)
// console.log(l[65])
const PORT = process.env.PORT;
app.listen(PORT,()=>{
    console.log(`Server running on port:${PORT}`)
})