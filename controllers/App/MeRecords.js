/**
 * Created by wbb on 15/6/24.
 */

var crypto =require("crypto");
var async=require('async');
MeRecord = require("../../models/meRecord.js");
var schedule = require("node-schedule");

function MeRecords(app){

}

module.exports= MeRecords;

MeRecords.list=function(req,res){
    res.send("开发中");
}

MeRecords.getListByDate=function(req,res){
    var boxNumber=req.body.boxNumber;
    var year=req.body.year;
    var month=req.body.month;
    MeRecord.getListByDate(boxNumber,year,month,function(err,meRecord){
        res.json(meRecord);
    });
}

MeRecords.getList=function(req,res){
    var boxNumber=req.body.boxNumber;
    var year=req.body.year;
    var pmonth=req.body.month+"";
    var nmonth=req.body.month+2+"";
    if(pmonth.length<2)pmonth="0"+pmonth;
    if(nmonth.length<2)nmonth="0"+nmonth;
    var pdate=year+"-"+pmonth+"-01";
    var ndate=year+"-"+nmonth+"-01";
    MeRecord.getList(boxNumber,pdate,ndate,function(err,meRecord){
        res.json(meRecord);
    });
}

