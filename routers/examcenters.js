const express = require('express');
const router = express.Router();
const {addexamcenter,updateexamcenter} = require('../controllers/examcenters.js');


router.post('/api/addexamcenter/:userId',addexamcenter);
router.put('/api/updateexamcenter/:userId/:examcenterId',updateexamcenter)


module.exports = {router}