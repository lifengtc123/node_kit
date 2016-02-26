/**
 * Created by lifeng on 15/3/26.
 */
var crypto =require("crypto");
var filter=require("./filter");
var async=require('async');
Role = require("../models/role.js");

function Roles(app){

}

module.exports= Roles;

Roles.list=function(req,res){
    res.send("开发中");
}

Roles.create=function(req,res){
    res.send("开发中");
}

Roles.save=function(req,res){
    res.send("开发中");
}

Roles.blank=function(req,res){
    res.send("开发中");
}

Roles.show=function(req,res){
    res.send("开发中");
}

Roles.detail=function(req,res){
    res.send("开发中");
}