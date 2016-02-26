
/*
 * GET home page.
 */
var crypto =require("crypto");
var filter=require("./filter");
var async=require('async');
User = require("../models/user.js");
Menu = require("../models/menu.js");
AjaxPagedList=require("../lib/AjaxPagedList.js");


function Menus(app){
    
}

module.exports= Menus;

Menus.index=function(req,res){
    res.render("Menus/index", {
        title: '菜单管理页面',
        user:req.session.user,
        menus_left:"/menus/left",
        menus_list:"/menus/list"
    });
}

Menus.left=function(req,res){
    async.waterfall([function(callback){
        Menu.Model().find({pid:'0'}).sort({"sort":1}).exec(function(err,menup){
            callback(err,menup);
        })
    },function(menup,callback){
        Menu.Model().find({pid:{$ne:'0'}}).sort({"sort":1}).exec(function(err,menuc){
            var menus={
                menup:menup,
                menuc:menuc
            }
            callback(err,menus);
        })
    }],function(err,menus){
        res.render("Menus/left", {
            title: '菜单管理页面',
            user:req.session.user,
            menus:menus,
            menus_p: menus.menup,
            menus_c: menus.menuc,
            success: req.flash('success'.toString()),
            error: req.flash('error'.toString())
        });
    })
}

Menus.list=function(req,res){
	res.render("Menus/list",{action:'menus',user:req.session.user});
}

Menus.ajaxlist=function(req,res){
    var ajaxPagedList=new AjaxPagedList(req);
    where={};
    if(req.param("pid")!=null){
        where={pid:req.param("pid")}
    }
    ajaxPagedList.find(Menu,where,function(err,lists){
        res.json(lists);
    });
}


Menus.save=function(req,res){
    req.body.menu.url=req.body.menu.url.toLowerCase();
    var menus=new Menu(req.body.menu);
    menus.save(function(err,obj){
        if(err){
            req.flash('error', "保存失败,请重新填写后再次尝试添加!");
            return res.redirect("/menus/blank");
        }else{
            req.flash('success', "保存成功!");
            return res.redirect("/menus/list");
        }
    })
}



Menus.blank=function(req,res){
    Menu.Model().find({pid:0},function(err,menus){
        if(err){
            menus=[];
        }
        res.render("Menus/blank", {
            title: '菜单管理页面',
            menus:menus,
            user: req.session.user,
            success: req.flash('success'.toString()),
            error: req.flash('error'.toString())
        });
    })
}

Menus.show=function(req,res){
    var id=req.param('id');
    Menu.Model().find({_id:id},function(err,menu){
        if(err){
            req.flash("error","查无此数据！")
            return res.redirect("/menus/list");
        }else{
            var menu_title="";
            if(menu.pid=='0'){
                menu_title="一级菜单"
                res.render("Menus/show", {
                    title: '菜单管理页面',
                    menu:menu,
                    menu_title:menu_title,
                    user: req.session.user,
                    success: req.flash('success'.toString()),
                    error: req.flash('error'.toString())
                });
            }else{
                Menu.Model().find({pid:menu.pid},function(err,menus){
                    menu_title=menus.name;
                    res.render("Menus/show", {
                        title: '菜单管理页面',
                        menu:menu,
                        menu_title:menu_title,
                        user: req.session.user,
                        success: req.flash('success'.toString()),
                        error: req.flash('error'.toString())
                    });
                })
            }

        }
    })
}

Menus.edit=function(req,res){
    var id=req.param('id');
    Menu.Model().find({_id:id},function(err,menu){
        console.log(menu);
        if(err){
            req.flash("error","查无此数据！")
            return res.redirect("/menus/list");
        }else{
            async.waterfall([function(callback){
                var role=req.session.user.roleId;
                Menu.Model().find({pid:0},function(err,menus){
                    callback(err,menus);
                })
            }],function(err,menus){
                res.render("Menus/edit", {
                    title: '菜单管理页面',
                    menu:menu,
                    menus:menus,
                    user: req.session.user,
                    success: req.flash('success'.toString()),
                    error: req.flash('error'.toString())
                });
            })
        }
    })
}

Menus.update=function(req,res){
    var menu=req.body.menu;
    Menu.findAndUpdate(menu,function(err){
        if(err){
            req.flash('error',"更新失败,请重新填写后再次尝试更新");
            res.redirect("/menus/edit",{id:menu._id});
        }else{
            req.flash('success',"更新成功");
            res.redirect("/menus/list");
        }
    })
}

Menus.detail=function(req,res){
	res.send("开发中");
}

Menus.load=function(req,res){
	res.render("Menus/load");
}

Menus.test=function(req,res){
	res.render("Menus/test");
}

Menus.remove=function(req,res){
    var id=req.param("id");
    Menu.Model().remove({_id:id},function(err,menu){
        if(err){main_list.html
            req.flash('error',"删除失败");
            return res.redirect("/menus/list");
        }else{
            req.flash('success',"删除成功");
            res.redirect("/menus/list");
        }
    })
}
Menus.removeCheck=function(req,res){
    var info=req.param("info");
    var ssos=[];
    var infos=[]
    ssos=info.split(","); //字符分割
    for (var i=0;i<ssos.length ;i++ )
    {
        infos.push(ssos[i]);
    }
    Menu.Model().remove({_id:{$in:infos}},function(err,menu){
        if(err){
            res.render("删除失败");
            res.redirect("/menus/list");
        }else{
            req.flash('success',"删除成功");
            res.redirect("/menus/list");
        }
    })
}

