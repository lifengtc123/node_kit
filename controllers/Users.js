/*
 * GET home page.
 */
var crypto =require("crypto");
var filter=require("./filter");
var async=require('async');
User = require("../models/user.js");
Depart= require("../models/depart.js");
Role= require("../models/role.js");
Event = require("../models/event.js");
AjaxPagedList=require("../lib/AjaxPagedList.js");
var PagedList=require("../lib/PagedList.js");

function Users(app){
    
}

module.exports= Users;

Users.index=function(req,res){
    res.render("Users/index", {
        title: '机构管理',
        user:req.session.user,
        menus_left:"/users/left",
        menus_list:"/users/list"
    });
}

Users.list=function(req,res){
    var pagedlist=new PagedList(req);
    var params = req.query;
    async.waterfall([function(callback){
        User.getPagedList(pagedlist,params.search,params.searchField,params.orderBy,params.order,params.condition,{},function(err,pagedlist){
            //console.log(pagedlist);
            callback(err,pagedlist);
        });
    }],function(err,pagedlist){
        if(pagedlist==null){
            pagedlist=[];
        }
        res.render("Users/list", {
            action:'users',
            title: '管理员列表',
            user:req.session.user,
            pagedlist:pagedlist,
            orderBy:params.orderBy,
            order:params.order,
            success: req.flash('success'.toString()),
            error: req.flash('error'.toString())
        });
    })
}

Users.listByDepartId=function(req,res){
    var pagedlist=new PagedList(req);
    var params = req.query;
    async.waterfall([function(callback){
        User.getPagedList(pagedlist,params.search,params.searchField,params.orderBy,params.order,params.condition,{departId:params['departId']},function(err,pagedlist){
            //console.log(pagedlist);
            callback(err,pagedlist);
        });
    }],function(err,pagedlist){
        if(pagedlist==null){
            pagedlist=[];
        }
        res.render("Users/list", {
            action:'users',
            title: '管理员列表',
            user:req.session.user,
            pagedlist:pagedlist,
            orderBy:params.orderBy,
            order:params.order,
            success: req.flash('success'.toString()),
            error: req.flash('error'.toString())
        });
    })
}

Users.left=function(req,res){
    async.waterfall([function(callback){
        Depart.findAll(function(err,departs){
            callback(err,departs);
        })
    }],function(err,departs){
        if(departs==null){
            departs=[];
        }
        res.render("Users/left", {
            title: '机构管理',
            user:req.session.user,
            departs:departs
        });
    })
}

Users.ajaxlist=function(req,res){
    var ajaxPagedList=new AjaxPagedList(req);
    ajaxPagedList.find(User,{},function(err,lists){
        res.json(lists);
    });

}

Users.create=function(req,res){
    var event=new Event({});
    event.save(function(){});
	res.send("开发中");
}

Users.save=function(req,res){
    var md5=crypto.createHash('md5');
    req.body.user.password=md5.update(req.body.user.password).digest('hex');

    var user=new User(req.body.user);
    var file = req.files.user.image;
    if(file==null||file.name==""){

    }else{
        //没有该文件夹
        var filepath = "./public/firmware/" + file.name;
        fs.renameSync(file.path, filepath);
        filepath = "./firmware/" + file.name;
        user.image = filepath;
    }

    user.save(function(err,obj){
        if(err){
            console.log(err);
            req.flash('error',"保存失败")
            return res.redirect("/users/list");
        }else{
            req.flash('success',"保存成功！")
            return res.redirect("/users/list");
        }
    })
}

Users.blank=function(req,res){
    Depart.findAll(function(err,departs){
        if(!err){
            async.waterfall(
                [function(callback){
                    Role.Model().find({},function(err,roles){
                        callback(err,roles);
                    })}
                ],
                function(err,roles){
                    if(err){
                        departs=[];
                    }
                    res.render("Users/blank", {
                        title: '添加用户',
                        departs:departs,
                        roles:roles,
                        user:req.session.user,
                        success: req.flash('success'.toString()),
                        error: req.flash('error'.toString())
                    });
                }
            )
        }else{
            req.flash('error',"请先添加部门后再添加管理员");
            return res.redirect("/users/list");
        }

    })
}

Users.show=function(req,res){
	res.send("开发中");
}

Users.detail=function(req,res){
	res.send("开发中");
}


Users.remove=function(req,res){
    var id=req.param("id");
    User.Model().remove({_id:id},function(err,user1){
        if(err){
            req.flash('error',"删除失败！")
            return res.redirect("/users/list");
        }else{
            req.flash('success',"删除成功！")
            return res.redirect("/users/list");
        }
    })
}

/**
 * 批量删除
 */
Users.removeCheck=function(req,res){
    var info=req.param("info");
    var ssos=[];
    var infos=[]
    ssos=info.split(","); //字符分割

    for (var i=0;i<ssos.length ;i++ )
    {
        infos.push(ssos[i]);
    }
    User.Model().remove({_id:{$in:infos}},function(err,user1){
        if(err){
            req.flash('error',"删除失败！")
            return res.redirect("/users/list");
        }else{
            req.flash('success',"删除成功！")
            return res.redirect("/users/list");
        }
    })
}

