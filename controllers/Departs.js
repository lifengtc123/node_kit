
/*
 * GET home page.
 */
var crypto =require("crypto");
var filter=require("./filter");
var async=require('async');
//User = require("../models/user.js");
Depart= require("../models/depart.js");
//Menu = require("../models/menu.js");
AjaxPagedList=require("../lib/AjaxPagedList.js");


function Departs(app){
    app.post('/departs/save',Departs.save);
}

module.exports=Departs;

Departs.index=function(req,res){
	//console.log("jinlaidayin");
    res.render("Departs/index", {
        title: '机构管理',
        user:req.session.user,
        menus_left:"/departs/left",
        menus_list:"/departs/list"
    });
}

Departs.left=function(req,res){
	async.waterfall([function(callback){
		Depart.findAll(function(err,departs){
			//console.log(departs);
			callback(err,departs);
		})
	}],function(err,departs){
		if(departs==null){
			departs=[];
		}
		 res.render("Departs/left", {
		        title: '机构管理',
		        user:req.session.user,
		        departs:departs
		    });
	})
}

Departs.list=function(req,res){
    async.waterfall([function(callback){
    	Depart.findAll(function(err,departs){
			callback(err,departs);
		})
    }],function(err,departs){
        res.render("Departs/list", {
            title: '机构列表',
            user:req.session.user,
            departs:departs,
            success: req.flash('success'.toString()),
            error: req.flash('error'.toString())
        });
    })
}

Departs.listByDepartId=function(req,res){
	var cid = req.param("cid");
	//console.log(cid);
	async.waterfall([function(callback){
		Depart.listByDepartId(cid,function(err,departs){
			//console.log(departs);
			callback(err,departs);
		})
	}],function(err,departs){
		res.render("Departs/list", {
            title: '机构列表',
            user:req.session.user,
            departs:departs,
            success: req.flash('success'.toString()),
            error: req.flash('error'.toString())
        });
	})
}

Departs.blank=function(req,res){
    Depart.findAllPid(0,function(err,departs){
        if(err){
        	departs=[];
        }
        res.render("Departs/blank", {
            title: '添加机构',
            departs:departs,
            user: req.session.user,
            success: req.flash('success'.toString()),
            error: req.flash('error'.toString())
        });
    })
}

Departs.save=function(req,res){
	//console.log(req.body.depart);
	var depart=new Depart(req.body.depart);
	depart.save(function(err,obj){
		//console.log(err);
		if(err){
            res.render("Departs/blank", {
                title: '失败',
                depart:depart,
                user: req.session.user,
                error: req.flash('error'.toString())
            });
		}else{
          async.waterfall([function(callback){
                Depart.findAll(function(err,departs){
                    callback(err,departs);
                })
          }],function(err,departs){
        	  return res.redirect("/departs/list");
          })
		}
	})
	
}

Departs.show=function(req,res){
    var id=req.param('id');
    
    Depart.getDepartById(id,function(err,depart){
        if(err){
            res.render("Departs/list", {
                title: '机构管理',
                departs:departs,
                user: req.session.user,
                success: req.flash('success'.toString()),
                error: req.flash('error'.toString())
            });
        }else{
            var depart_title="";
            if(depart!=null&&depart.pid=='0'){
            	depart_title="机构管理"
                res.render("Departs/show", {
                    title: '机构管理',
                    depart:depart,
                    depart_title:depart_title,
                    user: req.session.user,
                    success: req.flash('success'.toString()),
                    error: req.flash('error'.toString())
                });
            }else{
               Depart.findOnePid(depart.pid,function(err,departs){
            	   depart_title=departs.name;
                   res.render("Departs/show", {
                       title: '学校机构',
                       depart:depart,
                       depart_title:depart_title,
                       user: req.session.user,
                       success: req.flash('success'.toString()),
                       error: req.flash('error'.toString())
                   });
               })
            }

        }
    })
}

Departs.edit=function(req,res){
    var id=req.param('id');
    Depart.getDepartById(id,function(err,depart){
        if(err){
            res.render("Departs/list", {
                title: '机构管理',
                departs:departs,
                user: req.session.user,
                success: req.flash('success'.toString()),
                error: req.flash('error'.toString())
            });
        }else{
            async.waterfall([function(callback){
                    Depart.findAll(function(err,departs){
                        callback(err,departs);
                    })
            }],function(err,departs){
                res.render("Departs/edit", {
                    title: '机构管理',
                    depart:depart,
                    departs:departs,
                    user: req.session.user,
                    success: req.flash('success'.toString()),
                    error: req.flash('error'.toString())
                });
            })
        }
    })
}


Departs.update=function(req,res){
    var depart=req.body.depart;
    depart.updateTime=new Date();
    Depart.findAndUpdate(depart,function(err,depart){
         if(err){
             res.render("更新失败");
         }else{
             async.waterfall([function(callback){
            	 Depart.findAll(function(err,departs){
                         callback(err,departs);
                     })
             }],function(err,departs){
                 //console.log(depart);
                 res.render("Departs/list", {
                     title: '机构管理',
                     departs:departs,
                     user: req.session.user,
                     success: req.flash('success'.toString()),
                     error: req.flash('error'.toString())
                 });
             })
         }
    })
}

Departs.remove=function(req,res){
    var id=req.param("id");
    //console.log("id:"+id);
    Depart.delete(id,function(err,depart){
        if(err){
            res.render("删除失败");
        }else{
            async.waterfall([function(callback){
                    Depart.findAll(function(err,departs){
                        callback(err,departs);
                    })
            }],function(err,departs){
                res.render("Departs/list", {
                    title: '机构管理',
                    departs:departs,
                    user: req.session.user,
                    success: req.flash('success'.toString()),
                    error: req.flash('error'.toString())
                });
            })
        }
    })
}

Departs.removeCheck=function(req,res){
    var info=req.param("info");
    var ssos=[];
    var infos=[]
    ssos=info.split(","); //字符分割

    for (var i=0;i<ssos.length ;i++ )
    {
        infos.push(ssos[i]);
    }
    Depart.deleteList(infos,function(err,depart){
        if(err){
            res.render("删除失败")
        }else{
            async.waterfall([function(callback){
                    Depart.findAll(function(err,departs){
                        callback(err,departs);
                    })
            }],function(err,departs){
                res.render("Departs/list", {
                    title: '机构管理',
                    departs:departs,
                    user: req.session.user,
                    success: req.flash('success'.toString()),
                    error: req.flash('error'.toString())
                });
            })
        }
    })
}