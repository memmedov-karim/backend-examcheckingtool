//MODELS
const {Examcheckingbaza} = require('../models/examcheckingbaza.js');
const { User } = require('../models/user.js');
const {Checkingmodel} = require('../models/checkingmodel.js');
//EXTERNAL LIBRARUES
const fs = require('fs');
const { saveAs } = require('file-saver');
const xlsx = require('xlsx');
// const PDFDocument = require('pdfkit');
const PDFTable = require('voilab-pdf-table');
// const excel = require('exceljs');
//HELPERS
const {convertLineToObject,checkExamResult} = require('../helpers/creatJsonObject.js');
const { validateRequiredFields } = require('../helpers/validateRequiredFields.js');
//MIDLEWARES
const {cloudinaryUpload} = require('../middleware/fileUpload.js')
const axios = require('axios');
const { validateId } = require('../helpers/objectIdValidator.js');

const uploadfile = async (req,res,next) => {
    // console.log(req.file)
    try {
        if(req.file){
            console.log(req.file)
            const {buffer,originalname} = req.file
            const ress = await cloudinaryUpload(buffer,originalname);
            const cloudinaryUrl = ress.secure_url;
            const cloudinaryResponse = await axios.get(cloudinaryUrl, { responseType: 'text' });
            const fileContent = cloudinaryResponse.data;
            const data = fileContent.toString().split('\n').map((line) => line.replace(/\r/g, ''));
            const result = await Promise.all(data.map(async (line, index) => {
                return new Promise(async (resolve) => {
                    setTimeout(async () => {
                        const object = await convertLineToObject(line);
                        resolve(object);
                    }, index * 2);
                });
            }));
            return res.status(200).json({success:true,message:'Uploaded and did',data:result});
        }
        else{
            throw {status:400,message:'Incorrect file format'}
        }
    } catch (error) {
        next(error);
    }
}


const creatbaza = async (req,res,next) => {
    try {
        const {name}  = req.body;
        const {user:userId} = req.user;
        await validateRequiredFields(req,res,'name');
        if(!await validateId(userId)) throw {status:400,message:'Invalid Id format'};
        const user = await User.findById(userId);
        if(!user) throw {status:404,message:'User not found'};
        const exsistingbaza = await Examcheckingbaza.findOne({user:userId,name});
        if(exsistingbaza) throw {status:400,message:`${name} baza already exsist`};
        const newbazainstance = new Examcheckingbaza({
            user:userId,name
        });
        const savedBaza = await newbazainstance.save();
        return res.status(200).json({success:true,message:`${name} baza created succesfully!`,data:savedBaza});
    } catch (error) {
        next(error)
    }
}

const getbazas = async (req,res,next) => {
    // console.log("ok",req.user)
    const {user:userId} = req.user;
    try {
        if(!await validateId(userId)) throw {status:400,message:'Invalid Id format'};
        const bazas = await Examcheckingbaza.find({user:userId}).select('_id name createdAt txtfile incorrectanswer');
        return res.status(200).json({success:true,message:'Bazas fetched successfully',data:bazas})
    } catch (error) {
        next(error)
    }
}

const getbazaswithid = async (req,res,next)=>{
    const {bazaId} = req.params;
    try {
        const baza = await Examcheckingbaza.findById(bazaId);
        if(!baza) throw {status:404,message:'Baza not found'};

        return res.status(200).json({success:true,message:`${baza.name} fetched succesfully`,data:baza})
    } catch (error) {
        next(error);
        
    }
}
const addstudentprivateinfotobaza = async (req, res, next) => {
    try {
        const { infoArray } = req.body;
        const { bazaId } = req.params;
        const { user: userId } = req.user;

        if (!await validateId(bazaId)) throw { status: 400, message: 'Invalid Id format' };

        const user = await User.findById(userId);
        if (!user) throw { status: 404, message: 'User not found' };

        const baza = await Examcheckingbaza.findOne({ _id: bazaId, user: userId });
        if (!baza) throw { status: 404, message: 'Baza not found' };

        if (!infoArray || !Array.isArray(infoArray) || infoArray.length === 0) {
            throw { status: 400, message: 'Invalid or empty infoArray in the request body' };
        }

        console.log(infoArray);

        // Remove items from baza.studentprivateinfodetails that don't exist in infoArray
        const infoToRemove = baza.studentprivateinfodetails.filter(info => !infoArray.some(arrInfo => arrInfo.fieldName === info.fieldName));
        for (const info of infoToRemove) {
            baza.studentprivateinfodetails.pull(info);
        }

        // Update or add items from infoArray to baza.studentprivateinfodetails
        for (const { fieldName, interval } of infoArray) {
            const existingInfo = baza.studentprivateinfodetails.find(info => info.fieldName === fieldName);
            if (existingInfo) {
                // If the info already exists, update the interval
                existingInfo.interval = interval;
            } else {
                // If the info doesn't exist, add it to the array
                baza.studentprivateinfodetails.push({ fieldName, interval });
            }
        }

        await baza.save();
        return res.status(200).json({ success: true, message: 'Information saved successfully', data: baza.studentprivateinfodetails });
    } catch (error) {
        next(error);
    }
};

const fetchstudentprivateinfo = async (req,res,next) => {
    try {
        const { bazaId } = req.params;
        const { user: userId } = req.user;
        if (!await validateId(bazaId)) throw { status: 400, message: 'Invalid Id format' };
        const user = await User.findById(userId);
        if (!user) throw { status: 404, message: 'User not found' };
        const baza = await Examcheckingbaza.findOne({ _id: bazaId, user: userId });
        if (!baza) throw { status: 404, message: 'Baza not found' };
        return res.status(200).json({ success: true, message: 'Info fetched', data: baza.studentprivateinfodetails });
    } catch (error) {
        next(error);
    }
}

const addcorrectanswerstobaza = async (req, res, next) => {
    try {
      const { correctanswersObject } = req.body; // Change variable name to correctanswersObject
      const { userId, bazaId } = req.params;
  
      if (!await validateId(userId) || !await validateId(bazaId)) {
        throw { status: 400, message: 'Invalid Id format' };
      }
      const user = await User.findById(userId);
  
      if (!user) {
        throw { status: 404, message: 'User not found' };
      }
      const baza = await Examcheckingbaza.findOne({ _id: bazaId, user: userId });
      if (!baza) {
        throw { status: 404, message: 'Baza not found' };
      }
  
      if (!correctanswersObject) {
        throw { status: 400, message: 'Invalid or empty correctanswersObject in the request body' };
      }
  
      const { variant, class: clas, subject, sector } = correctanswersObject;
      const existingAnswer = baza.allcorrectanswers.find(answer => (
        (answer.variant === variant || (variant === undefined && answer.variant === ''))
        && (answer.class === clas || (clas === undefined && answer.class === ''))
        && (answer.subject === subject || (subject === undefined && answer.subject === ''))
        && (answer.sector === sector || (sector === undefined && answer.sector === ''))
      ));
  
      if (existingAnswer) {
        throw { status: 400, message: 'Answers with the same properties already exist' };
      }
      baza.allcorrectanswers.push(correctanswersObject);
      await baza.save();
      return res.status(200).json({ success: true, message: 'Correct answers added successfully', data: baza.allcorrectanswers });
    } catch (error) {
      next(error);
    }
  };

  
  const addinterval = async (req, res, next) => {
    try {
      const { correctanswersObject } = req.body; // Change variable name to correctanswersObject
      const { bazaId,vId } = req.params;
  
      if (!await validateId(bazaId)) {
        throw { status: 400, message: 'Invalid Id format' };
      }
      const baza = await Examcheckingbaza.findOne({ _id: bazaId});
      if (!baza) {
        throw { status: 404, message: 'Baza not found' };
      }
      if (!correctanswersObject) {
        throw { status: 400, message: 'Invalid or empty correctanswersObject in the request body' };
      }
      const { corretanswerseachvariant,variant, class: clas, subject, sector} = correctanswersObject;
      const existingAnswer = baza.allcorrectanswers.find(answer => (
        (answer.variant === variant || (variant === undefined && answer.variant === ''))
        && (answer.class === clas || (clas === undefined && answer.class === ''))
        && (answer.subject === subject || (subject === undefined && answer.subject === ''))
        && (answer.sector === sector || (sector === undefined && answer.sector === ''))
      ));
  
      if (existingAnswer) {
        const filtered = corretanswerseachvariant.filter(vr=>!vr._id);
      console.log(filtered)
      console.log(baza)
      const vIndex = baza.allcorrectanswers.findIndex(v=>v._id.toString()===vId);
      console.log(vId)
      console.log(baza.allcorrectanswers[vIndex])
      if(filtered.length>0){
        for(let i of filtered){
            baza.allcorrectanswers[vIndex].corretanswerseachvariant.push(i)
        }
        await baza.save();
        return res.status(200).json({ success: true,ch:'up', message: 'New interval added succesfully', data: baza.allcorrectanswers[vIndex] });
      }else{
        return res.status(200).json({ success: true, message: 'There is not update'});
      }
    }else{
        if(!variant && !clas && !subject && !sector) throw {status:400,message:'You must select minimum 1 argument'}
        baza.allcorrectanswers.push(correctanswersObject);
      await baza.save();
      return res.status(200).json({ success: true,ch:'ad', message: 'Correct answers added successfully', data: baza.allcorrectanswers[baza.allcorrectanswers.length-1] });
    }
    //   baza.allcorrectanswers.push(correctanswersObject);
      
    } catch (error) {
      next(error);
    }
  };
  

const fetchcorrectanswers = async (req,res,next) => {
    try {
        const { bazaId } = req.params;
        // const { user: userId } = req.user;
        if (!await validateId(bazaId)) throw { status: 400, message: 'Invalid Id format' };
        // const user = await User.findById(userId);
        // if (!user) throw { status: 404, message: 'User not found' };
        const baza = await Examcheckingbaza.findById(bazaId);
        if (!baza) throw { status: 404, message: 'Baza not found' };
        return res.status(200).json({success:true,message:'suc',data:baza.allcorrectanswers})
    } catch (error) {
        next(error);
    }
}
const addfiletobaza = async (req,res,next) => {
    try {
        if(req.file){
            const {bazaId} = req.params;
            if(!await validateId(bazaId)) throw {status:400,message:'Invalid Id format'};
            // const user = await User.findById(userId);
            // if(!user) throw {status:404,message:'User not found'};
            const baza = await Examcheckingbaza.findOne({_id:bazaId});
            if(!baza) throw {status:404,message:'Baza not found'};
            const {buffer,originalname} = req.file
            console.log(req.file)
            const ress = await cloudinaryUpload(buffer,originalname);
            const cloudinaryUrl = ress.secure_url;
            baza.txtfile = cloudinaryUrl;
            await baza.save();
            return res.status(200).json({success:true,message:'File added to baza succesfully',data:cloudinaryUrl})
        }
        else{
            throw {status:400,message:'Incorrect file format'}
        }
    } catch (error) {
        next(error);
    }
}

const updatecorrectanswer = async (req,res,next) =>{
    try {
    const { bazaId, variantId:correctanswerseachvariantid,undervairantId } = req.params;
    const { updatedAnswer } = req.body;

    const baza = await Examcheckingbaza.findOne({ _id: bazaId});

    if (!baza) {
      throw { status: 404, message: 'Baza not found' };
    }
    // console.log(baza)
    const correctanswersvariantindex = baza.allcorrectanswers.findIndex(answer => answer._id.toString() === correctanswerseachvariantid);
    // console.log(answerIndex)
    const eachvariantobject = baza.allcorrectanswers[correctanswersvariantindex];
    const {corretanswerseachvariant} = eachvariantobject;
    const undervariantindex = corretanswerseachvariant.findIndex(un=>un._id.toString() === undervairantId);
    // console.log(eachvariantobject)
    console.log(corretanswerseachvariant[undervariantindex])
    const answers = corretanswerseachvariant[undervariantindex].correctanswerseachsubject;
    const updateableanswerindex = answers.findIndex(ans=>ans._id.toString() === updatedAnswer._id);
    // console.log(answers[updateableanswerindex])
    baza.allcorrectanswers[correctanswersvariantindex].corretanswerseachvariant[undervariantindex].correctanswerseachsubject[updateableanswerindex] = updatedAnswer

    await baza.save();

    res.status(200).json({ success: true, message: 'Correct answer updated successfully', data: baza.allcorrectanswers[correctanswersvariantindex] });
    } catch (error) {
        next(error)
    }
}
const startcheckingprocess = async (req,res,next) => {
    // console.log(req.file)
    try {

        const {bazaId} = req.params
        if(!await validateId(bazaId)) throw {status:400,message:'Invalid Id format'};
        // const user = await User.findById(userId);
        // if(!user) throw {status:404,message:'User not found'};
        const baza = await Examcheckingbaza.findOne({_id:bazaId});
        if(!baza) throw {status:404,message:'Baza not found'};
        const {txtfile} = baza;
        // console.log(txtfile)
        if(!txtfile) throw {status:404,message:'Txt file not found'};
        const cloudinaryResponse = await axios.get(txtfile, { responseType: 'text' });
        const fileContent = cloudinaryResponse.data;
        const data = fileContent.toString().split('\n').map((line) => line.replace(/\r/g, ''));
        const errorArray = [];
        const resultsArray = [];
        const result = await Promise.all(data.map(async (line, index) => {
            return new Promise(async (resolve) => {
                setTimeout(async () => {
                    const [object, isError] = await checkExamResult(baza, line);
                    if (isError) {
                        errorArray.push(line);
                    } else {
                        resultsArray.push(object);
                    }
                        resolve(object);
                    }, index * 3);
            });
        }));
        const errorTxtContent = errorArray.join('\n');
        const errorBuffer = Buffer.from(errorTxtContent, 'utf-8');
        let errorFileUrl=''
        if(errorBuffer.length>0){
        const cloudinaryResponseError = await cloudinaryUpload(errorBuffer, 'error_txt_file');
        errorFileUrl = cloudinaryResponseError.secure_url;
        }
        const max_byte_for_uploading = 10485760;
        // const jsonContent = JSON.stringify(resultsArray, null, 2);
        // const buffer = Buffer.from(jsonContent, 'utf-8');
        // console.log(buffer.length)
        // const cloudinaryResponseJSON = await cloudinaryUpload(buffer, 'results_json');
        // console.log(cloudinaryResponseJSON)
        // const jsonFileUrl = cloudinaryResponseJSON.secure_url;
        const workbook = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(resultsArray);
        const columnWidths = Object.values(resultsArray[0]).map(column => ({ wch: column.length+5 }));
        ws['!cols'] = columnWidths;
        xlsx.utils.book_append_sheet(workbook, ws, 'Results');
        const excelBuffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });
        const fileUrls = [];
        if (excelBuffer.length <= max_byte_for_uploading) {
            const cloudinaryResponseExcel = await cloudinaryUpload(excelBuffer, 'results_excel');
            fileUrls.push(cloudinaryResponseExcel.secure_url);
        } 
        else 
        {
        const indicator = parseInt(excelBuffer.length/max_byte_for_uploading + 1);
        const chunkSize = parseInt(resultsArray.length/indicator);
        let offset = 0;
        let chunkNumber = 1;
        while (offset < resultsArray.length) {
          const chunkData = resultsArray.slice(offset, offset + chunkSize);
          const chunkWorkbook = xlsx.utils.book_new();
          const chunkWs = xlsx.utils.json_to_sheet(chunkData);
          chunkWs['!cols'] = columnWidths;
          xlsx.utils.book_append_sheet(chunkWorkbook, chunkWs, 'Results');
          const chunkBuffer = xlsx.write(chunkWorkbook, { bookType: 'xlsx', type: 'buffer' });
          const cloudinaryResponseExcel = await cloudinaryUpload(chunkBuffer, `results_excel_chunk_${chunkNumber}`);
          fileUrls.push(cloudinaryResponseExcel.secure_url);
          offset += chunkSize;
          chunkNumber += 1;
        }
      }

        const newcheckingmodelinstance = new Checkingmodel({
            baza:bazaId,resultfiles:fileUrls,successcount:resultsArray.length,errorcount:errorArray.length,errorfile:errorFileUrl
        })
        const savedcheckingmodel = await newcheckingmodelinstance.save();
        return res.status(200).json({success:true,message:'Proceess ended succefully',data:savedcheckingmodel});
    } catch (error) {
        next(error);
    }
}

const generatepdf = async (req,res,next)=>{
    try {
        const { data } = req.body;
        // console.log(data)
    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'Invalid data' });
    }

    // Create a PDF document
    const pdfDoc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=generated_pdf.pdf');
    res.setHeader('Content-Encoding', 'binary');
    // Set starting position
    let yPos = 50;

    let valuearr = Object.values(data).map(val=>pdfDoc.widthOfString(val.toString()))
    let keyarr = Object.keys(data).map(val=>pdfDoc.widthOfString(val.toString()))
    let maxv = Math.max(...valuearr);
    let maxk = Math.max(...keyarr)
    let mink = Math.min(...keyarr)
    // Asynchronous function to add each key-value pair with borders
    const addKeyValuePairWithBorders = async (key, value) => {
      const keyWidth = pdfDoc.widthOfString(`${key}:`);
      const valueWidth = pdfDoc.widthOfString(value.toString());

      // Draw rectangle around value
    //   pdfDoc.rect(19, yPos, maxk+maxv+200-mink, pdfDoc.heightOfString(value.toString()) + 10).stroke();

      pdfDoc.fontSize(12).text(`${key}:`, 20, yPos + 5);
      pdfDoc.fontSize(12).text(value.toString(), 200, yPos + 5);

      yPos += pdfDoc.heightOfString(value.toString()) + 20;
    };

    // Add content to the PDF document
    pdfDoc.fontSize(14).text('Generated PDF from Data', 50, yPos);
    yPos += pdfDoc.heightOfString('Generated PDF from Data') + 20;

    // Loop through each key-value pair
    for (const [key, value] of Object.entries(data)) {
        console.log(key,value)
      await addKeyValuePairWithBorders(key, value);
    }

    // Pipe the PDF to the response
    pdfDoc.pipe(res);
    pdfDoc.end();
    res.end()
    } catch (error) {
        next(error)
    }
}
const PDFDocument = require("pdfkit-table");
  const gentable = async (req, res, next) => {
    try {
      const { data } = req.body;
      const {a,b,c} = data;
      const header = Array.from({ length: a.length }, (_, index) => (index + 1).toString());
      console.log(c.split(""))
      const pdfDoc = new PDFDocument();
      if (!data) {
        return res.status(400).json({ error: 'Invalid data' });
      }
      // Set headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=generated_pdf.pdf');
      res.setHeader('Content-Encoding', 'binary');
      const table = {
        title: "Title",
        headers: header,
        rows: [
          a.split(""),
          b.split(""),
          c.split("")
        ],
      };
      await pdfDoc.table(table, { 
        width: 380,
      });
      await pdfDoc.fontSize(12).text("Hello world",200,100)
      // or columnsSize
    //   await pdfDoc.table(table, { 
    //     columnsSize: [ 200, 100, 100 ],
    //   });
      // done!
      pdfDoc.pipe(res);
      pdfDoc.end();
    } catch (error) {
      next(error);
    }
  };
module.exports = {
    uploadfile,
    creatbaza,
    addstudentprivateinfotobaza,
    addcorrectanswerstobaza,
    addfiletobaza,
    startcheckingprocess,
    getbazas,
    getbazaswithid,
    fetchstudentprivateinfo,
    fetchcorrectanswers,
    updatecorrectanswer,
    addinterval,
    generatepdf,gentable
}