/**
 * Created by lifeng on 15/3/13.
 */

var crypto=require("crypto");
var filter=require("./filter");
var async=require("async");

Nobility=require("../models/nobility.js");
var PagedList=require("../lib/PagedList.js");

function Nobilitys(app){
    
}

module.exports=Nobilitys;

Nobilitys.list= function (req, res) {
    var pagedlist=new PagedList(req);
    var params=req.query;
    async.waterfall([function (callback) {
        Nobility.getPagedList(pagedlist,params.search,params.searchField,params.orderBy,params.order,params.condition,{},function(err,pagedlist){
            //console.log(pagedlist);
            callback(err,pagedlist);
        });
    }],function(err,pagedlist){
        if(pagedlist==null){
            pagedlist=[];
        }
        res.render("Nobilitys/list",{
            action:'nobilitys',
            title:'客户列表',
            user:req.session.user,
            pagedlist:pagedlist,
            orderBy:params.orderBy,
            order:params.order,
            success: req.flash('success'.toString()),
            error: req.flash('error'.toString())
        });
    })
}