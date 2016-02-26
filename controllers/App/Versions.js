/**
 * Created by zhoufang on 16/1/28.
 */

var crypto =require("crypto");
var async=require('async');
Version = require("../../models/version.js");
var schedule = require("node-schedule");

function Versions(app){

}

module.exports= Versions;

Versions.findOne=function(req,res){
    var verType=req.param("verType");
    Version.findOne({verType:verType},function(err,version){
        res.json(version);
    })
}