/**
 * Created by lifeng on 15/3/20.
 */
var crypto =require("crypto");
var filter=require("./filter");
var async=require('async');
WeixinApplication=require("./weixin/WeixinApplication.js");

function Weixins(app){

}

module.exports= Weixins;

Weixins.index=function(req,res){
    res.render("Weixin/index");
}


Weixins.sao=function(req,res){
    getJsToken(function(obj){
        console.log(obj);
        res.render("Weixin/sao",obj);
    });
}
