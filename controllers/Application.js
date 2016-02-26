
/*
 * GET home page.
 */
var crypto =require("crypto");
var filter=require("./filter");
var async=require('async');
Application.users=require("./Users.js");
Application.menus=require("./Menus.js");
Application.boxes=require("./Boxes.js");
Application.apps=require("./Apps.js");
Application.brecords=require("./BRecords.js");
Application.messages=require("./Messages.js");
Application.mrecords=require("./MRecords.js");
Application.departs=require("./Departs.js");
Application.roles=require("./Roles.js");
Application.jobs=require("./Jobs.js");
Application.firmwares=require("./Firmwares.js");
Application.newsInfos=require("./NewsInfos.js");
Application.nobilitys=require("./Nobilitys.js");
Application.versions=require("./Versions.js");

function Application(app){

	app.get('/',filter.checkLogin,Application.index);
	app.get('/dx',Application.dx);

}

module.exports= Application;

Application.index=function(req, res){
    var forwardedIpsStr =req.ip;//req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    var user=req.session.user;
    var role;
    async.waterfall([function(callback){
        role=req.session.user.roleId;
        Role.Model().findOne({_id:role._id},function(err,role){
            callback(err,role);
        })
    }],function(err,role){
        var menu_p=[];
        var menu_c=[];
        if(role!=null&&role.menu!=null){
            var menulist=[];
            for(var key in role.menu){
                menulist.push(key);
            }
            Menu.Model().find({_id:{$in:menulist},flag:1},function(err,menus){
                if(err){
                    res.render("error/404");
                }else{
                    for(var i=0;i<menus.length;i++){
                        if(menus[i].pid=='0'){
                            menu_p.push(menus[i]);
                        }else{
                            menu_c.push(menus[i]);
                        }
                    }
                    res.render('Application/index', {
                        title:'首页',
                        user:req.session.user,
                        main:"/frist",
                        menus_left:"",
                        menus_list:"",
                        menus_p: menu_p,
                        menus_c: menu_c,
                        success:req.flash('success'.toString()),
                        error:req.flash('error'.toString())
                    });
                }
            })
        }else{
            res.render('Application/index', {
                title:'首页',
                user:req.session.user,
                main:"",
                menus_left:"",
                menus_list:"",
                menus_p: menu_p,
                menus_c: menu_c,
                success:req.flash('success'.toString()),
                error:req.flash('error'.toString())
            });
        }
        //})
    })
}

Application.error=function(req, res){
    //console.log("首页");
    res.render('error/404', {
        title:'首页',
        user:req.session.user,
        success:req.flash('success'.toString()),
        error:req.flash('error'.toString())
    });
}


Application.dx=function(req,res){
	res.json(1);
}