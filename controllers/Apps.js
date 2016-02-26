/**
 * Created by lifeng on 15/3/18.
 */
/**
 * Created by lifeng on 15/3/13.
 */

/*
 * GET home page.
 */
var crypto =require("crypto");
var filter=require("./filter");
var async=require('async');

function Apps(app){

}

module.exports= Apps;

Apps.chart=function(req,res){
    res.render("Apps/chart",{action:'apps',user:req.session.user});
}

Apps.list=function(req,res){
    res.render("Apps/list",{action:'apps',user:req.session.user});
}

Apps.message=function(req,res){
    res.render("Apps/message",{action:'apps',user:req.session.user});
}


Apps.create=function(req,res){
    res.send("开发中");
}

Apps.save=function(req,res){
    res.send("开发中");
}

Apps.blank=function(req,res){
    res.send("开发中");
}

Apps.show=function(req,res){
    res.send("开发中");
}

Apps.detail=function(req,res){
    res.send("开发中");
}


