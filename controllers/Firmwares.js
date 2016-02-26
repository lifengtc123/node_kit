/**
 * Created by lifeng on 15/3/13.
 */

/*
 * GET home page.
 */
var crypto =require("crypto");
var filter=require("./filter");
var async=require('async');
var fs=require("fs");
Firmware = require("../models/firmware.js");

function Firmwares(app){

}

module.exports= Firmwares;

Firmwares.chart=function(req,res){
    res.render("Firmwares/chart",{action:'boxes',user:req.session.user});
}

Firmwares.list=function(req,res){
    res.render("Firmwares/list",{action:'boxes',user:req.session.user});
}

Firmwares.create=function(req,res){
    var obj=new Firmware(req.body.firmware);
    Firmware.getOne(obj.number,function(err,firmware) {
        if (firmware) {
            res.send("版本号已被使用");
        } else {

            var file = req.files.firmware.file;
            var data = fs.readFileSync(file.path);
            var md5 = crypto.createHash('md5');
            sjc = md5.update(data).digest('hex');
            console.log(sjc);
            obj.key = sjc;
            var filepath = "./firmware/" + file.name;
            fs.renameSync(file.path, filepath);
            obj.filepath = file.name;
            obj.save(function (err, firmware) {
                res.send(firmware);
            })
        }
    })
}

Firmwares.save=function(req,res){
    res.send("开发中");
}

Firmwares.blank=function(req,res){
    res.render("Firmwares/blank",{action:'boxes'});
}

Firmwares.show=function(req,res){
    res.send("开发中");
}

Firmwares.detail=function(req,res){
    res.send("开发中");
}
