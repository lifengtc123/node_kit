/**
 * Created by lifeng on 15/3/13.
 */

/*
 * GET home page.
 */
var crypto =require("crypto");
var filter=require("./filter");
var async=require('async');
Box = require("../models/box.js");
Firmware=require("../models/firmware.js");
Nobility=require("../models/nobility.js");
var PagedList=require("../lib/PagedList.js");

function Boxes(app){
    app.post("/Boxes/getlist",Boxes.postlist);
    app.get("/Boxes/getlist",Boxes.postlist);
}

module.exports= Boxes;

Boxes.chart=function(req,res){
    res.render("Boxes/chart",{action:'boxes',user:req.session.user});
}

Boxes.postlist=function(req,res){
    var username=req.body.username;
    var boxIds=[];
    Nobility.getUsername(username,function(err,user){
        if(user!=null){
            boxIds=user.boxIds;
        }
    });
    //将所有app用户对应的盒子ID保存，进行
    var boxs=[];
    if(boxIds.length<0){
        for (var i = 0; i <boxIds.length; i++) {
            //console.logs(boxIds[i])
            Box.getAll(boxIds[i],function(err,box){
                //console.logs(box);
                boxs.push(box);
            })
        }
        res.end(JSON.stringify(boxs));
    }
}

Boxes.list=function(req,res){
    var pagedlist=new PagedList(req);
    var params = req.query;
    async.waterfall([function(callback){
        Box.getPagedList(pagedlist,params.search,params.searchField,params.orderBy,params.order,params.condition,{"online":1},function(err,pagedlist){
            //console.log(pagedlist);
            callback(err,pagedlist);
        });
    }],function(err,pagedlist){
        if(pagedlist==null){
            pagedlist=[];
        }
        res.render("Boxes/list", {
            action:'boxes',
            title: '小盒列表',
            user:req.session.user,
            pagedlist:pagedlist,
            orderBy:params.orderBy,
            order:params.order,
            success: req.flash('success'.toString()),
            error: req.flash('error'.toString())
        });
    })
}

Boxes.list2=function(req,res){
    var pagedlist=new PagedList(req);
    var params = req.query;
    async.waterfall([function(callback){
        Box.getPagedList(pagedlist,params.search,params.searchField,params.orderBy,params.order,params.condition,{"online":0},function(err,pagedlist){
            //console.log(pagedlist);
            callback(err,pagedlist);
        });
    }],function(err,pagedlist){
        if(pagedlist==null){
            pagedlist=[];
        }
        res.render("Boxes/list2", {
            action:'boxes',
            title: '小盒列表',
            user:req.session.user,
            pagedlist:pagedlist,
            orderBy:params.orderBy,
            order:params.order,
            success: req.flash('success'.toString()),
            error: req.flash('error'.toString())
        });
    })
}

Boxes.list3=function(req,res){
    var pagedlist=new PagedList(req);
    var params = req.query;
    async.waterfall([function(callback){
        Box.getPagedList(pagedlist,params.search,params.searchField,params.orderBy,params.order,params.condition,{},function(err,pagedlist){
            //console.log(pagedlist);
            callback(err,pagedlist);
        });
    }],function(err,pagedlist){
        if(pagedlist==null){
            pagedlist=[];
        }
        res.render("Boxes/list3", {
            action:'boxes',
            title: '小盒列表',
            user:req.session.user,
            pagedlist:pagedlist,
            orderBy:params.orderBy,
            order:params.order,
            success: req.flash('success'.toString()),
            error: req.flash('error'.toString())
        });
    })
}

Boxes.create=function(req,res){
    var obj=new Box(req.body.box);
    obj.save(function(obj,err){
        res.send("保存成功。");
    });

}

Boxes.save=function(req,res){
    Nobility.getBoxid("010101010101",function(err,obj){
       console.log(err);
        console.log(obj);
    });
    res.send("开发中");
}

Boxes.blank=function(req,res){
    res.render("Boxes/blank",{action:'boxes'});
}

Boxes.show=function(req,res){
    res.send("开发中");
}

Boxes.detail=function(req,res){
    res.send("开发中");
}

Boxes.update=function(req,res){
    res.render("Boxes/update",{action:'boxes'});
}

Boxes.updateOK=function(req,res){
    var password=Math.ceil(Math.random()*100000000)+"";
    while(password.length<8){
        password+="0";
    }
    var updatebb=req.body.box.updatebb;
    Firmware.getOne(updatebb,function(err,obj){
        if(obj){
            Box.updateGx(req.body.box.number,password,updatebb,function(err,box){
                res.send("OK");
            })
        }else{
            res.send("无此版本号");
        }
    })


}

//所有盒子都更新
Boxes.updateAll=function(req,res){
    var password=Math.ceil(Math.random()*100000000)+"";
    while(password.length<8){
        password+="0";
    }
    var updatebb=req.param("updatebb");
    var state=req.param("state");
    Firmware.getOne(updatebb,function(err,obj){
        if(obj){
            Box.updateOpt({},{ $set: { updatebox: state,updatepassword:password},updatebb:updatebb},function(err,box){
                res.send("OK");
            })
        }else{
            res.send("无此版本号");
        }
    })
}

//删除
Boxes.remove=function(req,res){
    var id=req.param("id");
    Box.Model().remove({_id:id},function(err,role){
        if(err){
            req.flash('error',"删除失败！")
            return res.redirect("/boxes/list");
        }else{
            req.flash('success',"删除成功！")
            return res.redirect("/boxes/list");
        }
    })
}

//批量删除
Boxes.removeCheck=function(req,res){
    var info=req.param("info");
    var ssos=[];
    var infos=[]
    ssos=info.split(","); //字符分割
    for (var i=0;i<ssos.length ;i++ )
    {
        infos.push(ssos[i]);
    }
    Box.Model().remove({_id:{$in:infos}},function(err,boxes){
        if(err){
            req.flash('error',"删除失败！")
            return res.redirect("/boxes/list");
        }else{
            req.flash('success',"删除成功！")
            return res.redirect("/boxes/list");
        }
    })
}
