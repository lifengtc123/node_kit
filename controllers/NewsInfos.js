/**
 * Created by zzj on 2016/2/1.
 */


var crypto=require("crypto");
var filter=require("./filter");
var async=require("async");
News=require("../models/news.js");
Box=require("../models/box.js");


function NewsInfos(app){

}

module.exports=NewsInfos;

NewsInfos.index= function (req,res) {
    res.render("NewsInfos/index",{
        title:'消息管理',
        user:req.session.user,
        menus_left:"/newsInfos/left",
        menus_list:"/newsInfos/list"
    });
}

NewsInfos.left=function(req,res){
    async.waterfall([function (callback) {
        Box.getAllBox(function (err,boxs) {
            callback(err,boxs);
        })
    }], function (err,boxs) {
        if(boxs==null){
            boxs=[];
        }
        res.render("NewsInfos/left",{
            title:'盒子列表',
            user:req.session.user,
            boxs:boxs
        });
    })
}


NewsInfos.list= function (req,res) {
    async.waterfall([function (callback) {
        News.findAll(function (err,news) {
            callback(err,news);
        });
    }], function (err,news) {
        res.render("NewsInfos/list",{
            title:'消息列表',
            user:req.session.user,
            news:news,
            success:req.flash('success'.toString()),
            error:req.flash('error'.toString())
        });
    })
}

NewsInfos.listByBoxId= function (req,res) {
    var boxnumber=req.param("boxnumber");
    async.waterfall([function (callback) {
        News.getNewsByBoxNumber(boxnumber, function (err,news) {
            callback(err,news);
        })
    }], function (err,news) {
        res.render("NewsInfos/list",{
            title:'消息列表',
            user:req.session.user,
            news:news,
            success:req.flash('success'.toString()),
            error:req.flash('error'.toString())
        });
    })
}