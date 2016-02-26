/**
 * Created by zzj on 2016/2/2.
 */

var crypto=require("crypto");
var filter=require("./filter");
var async=require("async");
Version=require("../models/version.js");
var fs = require('fs');
var PagedList=require("../lib/PagedList.js");


function Versions(app){
    app.post('/versions/save',Versions.save);
}

module.exports=Versions;

Versions.list= function (req,res) {
    var pagedlist=new PagedList(req);
    var params=req.query;
    async.waterfall([function (callback) {
        Version.getPagedList(pagedlist,params.search,params.searchField,params.orderBy,params.order,params.condition,{},function (err,pagedlist) {
            callback(err,pagedlist);
        });
    }],function (err,pagedlist) {
        if(pagedlist==null){
            pagedlist=[];
        }
        res.render("Versions/list",{
            action:'versions',
            title:'版本管理',
            user:req.session.user,
            pagedlist:pagedlist,
            orderBy:params.orderBy,
            order:params.order,
            success: req.flash('success'.toString()),
            error: req.flash('error'.toString())
        });
    })
}

Versions.blank= function (req,res) {
    res.render("Versions/blank",{
        title:'添加版本',
        user: req.session.user,
        success: req.flash('success'.toString()),
        error: req.flash('error'.toString())
    });
}

Versions.save= function (req,res) {
    var version=new Version(req.body.version);
        version.updateuser=req.session.user.name;
    var dirpath="./public/install_package/";
    if(req.body.version.verType=="ios"){
    var filename="vvbox"+req.body.version.verCode+".ipk";
    }else{
    var filename="vvbox"+req.body.version.verCode+".apk";
    }
    if(!fs.existsSync(dirpath)){
        fs.mkdirSync(dirpath);
    }
    var target_path="./public/install_package/"+filename;
        version.filename=filename;
        version.filepath=target_path;
    fs.renameSync(req.files.file.path,target_path);
    fs.unlink(req.files.file.path, function () {
        console.log('success');
    });
    version.save(function (err,obj) {
        if(err){
            res.render("versions/blank", {
                title: '失败',
                user: req.session.user,
                error: req.flash('error'.toString())
            });
        }else{
            var pagedlist=new PagedList(req);
            var params=req.query;
            async.waterfall([function (callback) {
                Version.getPagedList(pagedlist,params.search,params.searchField,params.orderBy,params.order,params.condition,{},function (err,pagedlist) {
                    callback(err,pagedlist);
                });
            }],function (err,pagedlist) {
                if(pagedlist==null){
                    pagedlist=[];
                }
                res.render("Versions/list",{
                    action:'versions',
                    title:'版本管理',
                    user:req.session.user,
                    pagedlist:pagedlist,
                    orderBy:params.orderBy,
                    order:params.order,
                    success: req.flash('success'.toString()),
                    error: req.flash('error'.toString())
                });
            })
        }
    })
}

Versions.edit= function (req,res) {
    var id=req.param("id");
    Version.getVersionById(id, function (err,version) {
        if(err){
            var pagedlist=new PagedList(req);
            var params=req.query;
            async.waterfall([function (callback) {
                Version.getPagedList(pagedlist,params.search,params.searchField,params.orderBy,params.order,params.condition,{},function (err,pagedlist) {
                    callback(err,pagedlist);
                });
            }],function (err,pagedlist) {
                if(pagedlist==null){
                    pagedlist=[];
                }
                res.render("Versions/list",{
                    action:'versions',
                    title:'版本管理',
                    user:req.session.user,
                    pagedlist:pagedlist,
                    orderBy:params.orderBy,
                    order:params.order,
                    success: req.flash('success'.toString()),
                    error: req.flash('error'.toString())
                });
            })
        }else{
                res.render("Versions/edit",{
                    title: '版本管理',
                    version:version,
                    user: req.session.user,
                    success: req.flash('success'.toString()),
                    error: req.flash('error'.toString())
                });
        }
    })
}

Versions.update= function (req,res) {
    var version=req.body.version;
    console.log(req.body.oldfilepath);
    if(req.files.file.path!=undefined||req.files.file.path!=null){
    fs.unlink(req.body.oldfilepath, function(){
            console.log('success');
        });
    var dirpath="./public/install_package/";
    if(req.body.version.verType=="ios") {
        var filename="vvbox"+req.body.version.verCode+".ipk";
    }else{
        var filename="vvbox"+req.body.version.verCode+".apk";
    }
    if(!fs.existsSync(dirpath)){
        fs.mkdirSync(dirpath);
    }
    var target_path="./public/install_package/"+filename;
    version.filename=filename;
    version.filepath=target_path;
    fs.renameSync(req.files.file.path,target_path);
        fs.unlink(req.files.file.path, function () {
            console.log('success');
        });
    }
    Version.findAndUpdate(version, function (err,version) {
        if(err){
            res.render("更新失败");
        }else{
            var pagedlist=new PagedList(req);
            var params=req.query;
            async.waterfall([function (callback) {
                Version.getPagedList(pagedlist,params.search,params.searchField,params.orderBy,params.order,params.condition,{},function (err,pagedlist) {
                    callback(err,pagedlist);
                });
            }],function (err,pagedlist) {
                if(pagedlist==null){
                    pagedlist=[];
                }
                res.render("Versions/list",{
                    action:'versions',
                    title:'版本管理',
                    user:req.session.user,
                    pagedlist:pagedlist,
                    orderBy:params.orderBy,
                    order:params.order,
                    success: req.flash('success'.toString()),
                    error: req.flash('error'.toString())
                });
            })
        }
    })
}

Versions.show= function (req,res) {
    var id=req.param("id");
    Version.getVersionById(id, function (err,version) {
        if(err){
            var pagedlist=new PagedList(req);
            var params=req.query;
            async.waterfall([function (callback) {
                Version.getPagedList(pagedlist,params.search,params.searchField,params.orderBy,params.order,params.condition,{},function (err,pagedlist) {
                    callback(err,pagedlist);
                });
            }],function (err,pagedlist) {
                if(pagedlist==null){
                    pagedlist=[];
                }
                res.render("Versions/list",{
                    action:'versions',
                    title:'版本管理',
                    user:req.session.user,
                    pagedlist:pagedlist,
                    orderBy:params.orderBy,
                    order:params.order,
                    success: req.flash('success'.toString()),
                    error: req.flash('error'.toString())
                });
            })
        }else{
           res.render("Versions/show",{
               title: '机构管理',
               version:version,
               user: req.session.user,
               success: req.flash('success'.toString()),
               error: req.flash('error'.toString())
           });
        }
    })
}

Versions.remove= function (req,res) {
    var id=req.param("id");
    Version.delete(id, function (err,version) {
        if(err){
            res.render("删除失败！");
        }else{
            var pagedlist=new PagedList(req);
            var params=req.query;
            async.waterfall([function (callback) {
                Version.getPagedList(pagedlist,params.search,params.searchField,params.orderBy,params.order,params.condition,{},function (err,pagedlist) {
                    callback(err,pagedlist);
                });
            }],function (err,pagedlist) {
                if(pagedlist==null){
                    pagedlist=[];
                }
                res.render("Versions/list",{
                    action:'versions',
                    title:'版本管理',
                    user:req.session.user,
                    pagedlist:pagedlist,
                    orderBy:params.orderBy,
                    order:params.order,
                    success: req.flash('success'.toString()),
                    error: req.flash('error'.toString())
                });
            })
        }
    })
}


Versions.removeCheck= function (req,res) {
    var info=req.param("info");
    var ssos=[];
    var infos=[]
    ssos=info.split(",");

    for(var i=0;i<ssos.length;i++){
        infos.push(ssos[i]);
    }

    Version.deleteList(infos, function (err,version) {
        if (err) {
            res.render("删除失败");
        } else{
        var pagedlist = new PagedList(req);
        var params = req.query;
        async.waterfall([function (callback) {
            Version.getPagedList(pagedlist, params.search, params.searchField, params.orderBy, params.order, params.condition, {}, function (err, pagedlist) {
                callback(err, pagedlist);
            });
        }], function (err, pagedlist) {
            if (pagedlist == null) {
                pagedlist = [];
            }
            res.render("Versions/list", {
                action: 'versions',
                title: '版本管理',
                user: req.session.user,
                pagedlist: pagedlist,
                orderBy: params.orderBy,
                order: params.order,
                success: req.flash('success'.toString()),
                error: req.flash('error'.toString())
            });
        })
    }
    })
}