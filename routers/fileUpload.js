const express = require('express');
const router = express.Router();
const {uploadfile,creatbaza,addstudentprivateinfotobaza,addcorrectanswerstobaza,addfiletobaza,startcheckingprocess,getbazas,getbazaswithid,fetchstudentprivateinfo,fetchcorrectanswers,updatecorrectanswer,addinterval,generatepdf,gentable} = require('../controllers/fileUpload.js');
const {teststudentinfo} = require('../controllers/testBaza.js')
const {upload} = require('../middleware/fileUpload.js');
const {auth} = require('../middleware/auth.js')

router.post('/api/upload',upload.single('file'),uploadfile);
router.post('/api/addbaza/',auth,creatbaza);
router.post('/api/adduserprivateinfotobaza/:bazaId',auth,addstudentprivateinfotobaza);
router.post('/api/addcorrectanswerstobaza/:userId/:bazaId',addcorrectanswerstobaza);
router.post('/api/addfiletobaza/:bazaId',upload.single('file'),auth,addfiletobaza);
router.get('/api/startcheckingprocess/:bazaId',auth,startcheckingprocess);
router.get('/api/bazas',auth,getbazas)
router.get('/api/bazas/:bazaId',auth,getbazaswithid);
router.get('/api/studentprivateinfo/:bazaId',auth,fetchstudentprivateinfo);
router.post('/api/teststudentinfo/:bazaId',auth,teststudentinfo);
router.get('/api/correctanswers/:bazaId',fetchcorrectanswers);
router.put('/api/update-correctanswer/:bazaId/:variantId/:undervairantId',updatecorrectanswer);
router.post('/api/addinterval/:bazaId/:vId',addinterval)
router.post('/api/generatepdf',generatepdf)
router.post('/api/gentable',gentable)
module.exports = {router};