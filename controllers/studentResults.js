const {Studentresult} = require('../models/studentresult.js');
const {User} = require('../models/user.js');
const xlsx = require('xlsx');


const addresult = async (req,res,next) => {
    const {userId,examId} = req.params;
    try {
        // console.log(req.file)
        const result = await Studentresult.findOne({user:userId,exam:examId});
        if(!result) throw {status:404,message:'Res not found'}
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const userDataFromExcel = xlsx.utils.sheet_to_json(sheet);
        const updateddata = await Studentresult.findOneAndUpdate({user:userId,exam:examId},{$push:{results:{$each:userDataFromExcel}}},{new:true});
        // console.log(userDataFromExcel)
        return res.status(200).json({success:true,message:'Founded',data:updateddata})
    } catch (error) {
        next(error);
    }
}
module.exports = {addresult}