/**
 * Created by lifeng on 15/3/13.
 */

/*
 * GET home page.
 */
var crypto =require("crypto");
var filter=require("./filter");
var async=require('async');
Box = require("../models/sysmusic.js");
Firmware=require("../models/firmware.js");

function Sysmusics(app){

}

module.exports= Sysmusics;

Sysmusics.create=function(req,res){
    var obj=new Box(req.body.box);
    obj.save(function(obj,err){
        res.send("保存成功。");
    });

}

Sysmusics.save=function(req,res){
    res.send("开发中");
}

Sysmusics.blank=function(req,res){
    res.render("Boxes/blank",{action:'boxes'});
}

Sysmusics.show=function(req,res){
    res.send("开发中");
}

Sysmusics.detail=function(req,res){
    res.send("开发中");
}


