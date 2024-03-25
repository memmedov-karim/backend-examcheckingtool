const express = require('express');
const router = express.Router();

const {addresult} = require('../controllers/studentResults.js')
const {upload} = require('../middleware/fileUpload.js');

router.post('/api/addresult/:userId/:examId',upload.single('file'),addresult)

module.exports  = {router}