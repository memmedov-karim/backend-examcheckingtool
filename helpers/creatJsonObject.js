//MODELS
const {Examcheckingbaza} = require('../models/examcheckingbaza.js');


async function convertLineToObject(line, fieldDefinitions) {
    const result = {};
    fieldDefinitions.forEach(({ fieldName, interval }) => {
        const [start, end] = interval;
        result[fieldName] = line.slice(start, end);
    });
    return result;
}

async function checkExamResult(baza,line){
    const {studentprivateinfodetails,allcorrectanswers,incorrectanswer} = baza;
    // console.log(d)
    // console.log(baza)
    // console.log(studentprivateinfodetails)
    const {Class:Clas,interval:classinterval} = studentprivateinfodetails.find(f=>f.fieldName === 'Class');
    const {Variant,interval:variantinterval} = studentprivateinfodetails.find(f=>f.fieldName === 'Variant');
    const {Sector,interval:sectorinterval} = studentprivateinfodetails.find(f=>f.fieldName === 'Sector');
    const {Subject,interval:subjectinterval} = studentprivateinfodetails.find(f=>f.fieldName === 'Subject');
    // console.log(variantinterval)
    const classinline = line.slice(classinterval[0],classinterval[1]);
    const variantinline = line.slice(variantinterval[0],variantinterval[1]);
    // console.log(variantinline.length)
    const sectorinline = line.slice(sectorinterval[0],sectorinterval[1]);
    const subjectinline = line.slice(subjectinterval[0],subjectinterval[1]);
    // console.log([classinline,variantinline,sectorinline,subjectinline])
    // console.log(allcorrectanswers)
    const matched = allcorrectanswers.find(answer => (
        checkImportancy(answer,variantinline,subjectinline,sectorinline,classinline) && ((answer.class === classinline || (classinline === '  ') || answer.class==='')
        && (answer.sector === sectorinline || (sectorinline === ' ') || answer.sector ==='')
        && (answer.subject === subjectinline || (subjectinline === ' ') || answer.subject==='')
        && (answer.variant === variantinline || (variantinline === ' ') || answer.variant===''))
    ));
    // console.log(matched)
    const d = await convertLineToObject(line,studentprivateinfodetails);
    // console.log(matched)
    if(matched){
    const {corretanswerseachvariant,subject} = matched;
    const end = await mountAllResult(corretanswerseachvariant,line,incorrectanswer,subject);
    const res = {...d,...end};
    // console.log(res)
    return [res,false]
    }
    else{
        return [d,true]
    }
}


async function checkResult(subject, interval, correctanswers, line, incorrectanswer, subjectchecker) {
    let totalPoint = 0;
    let totalCorrect = 0;
    let totalIncorrect = 0;

    const studentanswers = line.slice(interval[0], interval[1]);
    const studentplusminus = correctanswers.map((ans, index) =>
        ans.correctanswer === studentanswers[index] ? '+' :
            (ans.correctanswer !== studentanswers[index] && studentanswers[index] !== ' ') ? '-' : ' ').join('');

    correctanswers.forEach((ans, i) => {
        const stdans = studentanswers[i];
        const correctans = ans.correctanswer;
        const mark = ans.mark;

        if (stdans === correctans) {
            totalPoint += mark;
            totalCorrect += 1;
        } else if (stdans !== correctans && stdans !== ' ') {
            totalPoint -= incorrectanswer;
            totalIncorrect += 1;
        }
    });
    let s = {
    [`${subjectchecker !== '' ? 'fənn' : subject} doğru cavablar`]: correctanswers.map(ans => ans.correctanswer).join(''),
    [`${subjectchecker !== '' ? 'fənn' : subject} cavabınız`]: studentanswers,
    [`${subjectchecker !== '' ? 'fənn' : subject} statusunuz`]: studentplusminus,
    [`${subjectchecker !== '' ? 'fənn' : subject} ümumi say`]: studentplusminus.length,
    [`${subjectchecker !== '' ? 'fənn' : subject} ümumi doğru`]: totalCorrect,
    [`${subjectchecker !== '' ? 'fənn' : subject} ümumi yalnış`]: totalIncorrect,
    [`${subjectchecker !== '' ? 'fənn' : subject} boş`]: studentplusminus.length - totalCorrect - totalIncorrect,
    [`${subjectchecker !== '' ? 'fənn' : subject} xal`]: totalPoint,
};
if(subjectchecker){
    s['fənn'] = subjectchecker
}
    return s;
}
async function mountAllResult(corretanswerseachvariant, line, incorrectanswer, subjectchecker) {
    let endObj = {};
    let total = 0;
    let allcount = 0;
    let allcorrect = 0;
    let allincorrect = 0;
    let allemty = 0;
    let s;
    await Promise.all(corretanswerseachvariant.map(async (item) => {
        const { subject, interval, correctanswerseachsubject } = item;
        const oneObj = await checkResult(subject, interval, correctanswerseachsubject, line, incorrectanswer, subjectchecker);

        if (subjectchecker === '') {
            const keys = Object.keys(oneObj);
            const allcnt = getValueByKey(keys, 'ümumi say', oneObj);
            const allcrt = getValueByKey(keys, 'ümumi doğru', oneObj);
            const allincrt = getValueByKey(keys, 'ümumi yalnış', oneObj);
            const allempty = getValueByKey(keys, 'boş', oneObj);
            const allttl = getValueByKey(keys, 'xal', oneObj);
            allcount+=allcnt;
            allcorrect+=allcrt;
            allincorrect+=allincrt;
            allemty+=allempty;
            total += allttl;  
        }
        s = {
            'ümumi say': allcount,
            'ümumi doğru': allcorrect,
            'ümumi yalnış': allincorrect,
            'boş': allemty,
            'ümumi xal': total
        };
        Object.assign(endObj, oneObj);
    }));
    if(subjectchecker===''){
    Object.assign(endObj, s);
    }
    return endObj;
}

function getValueByKey(keys, searchStr, obj) {
    return keys.reduce((acc, key) => {
        if (key.includes(searchStr)) {
            acc = obj[key];
        }
        return acc;
    }, undefined);
}
function checkImportancy(answer,variantinline,subjectinline,sectorinline,classinline){
    const {class:clas,subject,sector,variant} = answer;
    if(clas!=='' && classinline==='  '){
        return false
    }
    if(subject!=='' && subjectinline=== ' '){
        return false
    }
    if(sector!=='' && sectorinline=== ' '){
        return false
    }
    if(variant!=='' && variantinline===' '){
        return false
    }
    return true
}













async function checkExamResultTest(bazaId,line){
    const baza = await Examcheckingbaza.findById(bazaId);
    const {studentprivateinfodetails,allcorrectanswers,incorrectanswer} = baza;
    // console.log(d)
    // console.log(baza)
    // console.log(studentprivateinfodetails)
    const {Class:Clas,interval:classinterval} = studentprivateinfodetails.find(f=>f.fieldName === 'Class');
    const {Variant,interval:variantinterval} = studentprivateinfodetails.find(f=>f.fieldName === 'Variant');
    const {Sector,interval:sectorinterval} = studentprivateinfodetails.find(f=>f.fieldName === 'Sector');
    const {Subject,interval:subjectinterval} = studentprivateinfodetails.find(f=>f.fieldName === 'Subject');
    // console.log(variantinterval)
    const classinline = line.slice(classinterval[0],classinterval[1]);
    const variantinline = line.slice(variantinterval[0],variantinterval[1]);
    // console.log(variantinline.length)
    const sectorinline = line.slice(sectorinterval[0],sectorinterval[1]);
    const subjectinline = line.slice(subjectinterval[0],subjectinterval[1]);
    // console.log([classinline,variantinline,sectorinline,subjectinline])
    // console.log(allcorrectanswers)
    const matched = allcorrectanswers.find(answer => (
        checkImportancy(answer,variantinline,subjectinline,sectorinline,classinline) && ((answer.class === classinline || (classinline === '  ') || answer.class==='')
        && (answer.sector === sectorinline || (sectorinline === ' ') || answer.sector ==='')
        && (answer.subject === subjectinline || (subjectinline === ' ') || answer.subject==='')
        && (answer.variant === variantinline || (variantinline === ' ') || answer.variant===''))
    ));
    // console.log(matched)
    const d = await convertLineToObject(line,studentprivateinfodetails);
    // console.log(matched)
    if(matched){
    const {corretanswerseachvariant,subject} = matched;
    const end = await mountAllResult(corretanswerseachvariant,line,incorrectanswer,subject);
    const res = {...d,...end};
    // console.log(res)
    return [res,false]
    }
    else{
        return [d,true]
    }
}
module.exports = {convertLineToObject,checkExamResult,checkExamResultTest}