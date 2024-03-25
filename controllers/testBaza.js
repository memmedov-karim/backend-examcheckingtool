const {convertLineToObject,checkExamResult} = require('../helpers/creatJsonObject.js');
const {Examcheckingbaza} = require('../models/examcheckingbaza.js');
const { validateRequiredFields } = require('../helpers/validateRequiredFields.js');
const teststudentinfo = async (req,res,next) => {
    try {
        const {line,selectOption} = req.body;
        await validateRequiredFields(req,res,'line','selectOption');
        if(!['studentinfo','all'].includes(selectOption)) throw {status:404,message:'Select option not found'};
        const {bazaId} = req.params;
        const baza = await Examcheckingbaza.findById(bazaId);
        if(!baza) throw {status:404,message:'Baza not found'};
        if(baza.studentprivateinfodetails.length === 0) throw {status:400,message:'Empty array'};
        let responseData;

    if (selectOption === 'studentinfo') {
      responseData = await convertLineToObject(line, baza.studentprivateinfodetails);
    } else {
      responseData = await checkExamResult(baza, line);
    }
        return res.status(200).json({success:true,message:'Line converted successfully',data:responseData});
    } catch (error) {
        next(error);
    }
}


module.exports = {teststudentinfo}