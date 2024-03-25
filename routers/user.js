const express = require('express');
const router = express.Router();
const {registeruser,loginuser,loggedIn,logoutuser} = require('../controllers/user.js');
const {auth} = require('../middleware/auth.js')
router.post('/api/registeruser',registeruser);
router.post('/api/login',loginuser);
router.get('/api/loggedin',auth,loggedIn);
router.get('/api/logout',logoutuser);


module.exports = {router};