/**
 * Created by lifeng on 15/3/17.
 */
/*
 * GET home page.
 */
var crypto =require("crypto");
var filter=require("./filter");
Application.users=require("./Users.js");
Application.menus=require("./Menus.js");
Application.boxes=require("./Boxes.js");
Application.brecords=require("./BRecords.js");
Application.messages=require("./Messages.js");
Application.mrecords=require("./MRecords.js");

function SocketApi(socket,socketuser){
    console.log("SocketApi开始");
    socket.on("getbox",function(){

    });
    socket.emit('connected',"你好");

    //addRoom
    socket.on("onRoom",function(roomid){
        socket.join(roomid);
    })

    socket.on("newuser",function(username){
        socket.myname=username;
        socketuser[username]=socket;
    })

    socket.on("disconnect",function(){
        socketuser[socket.myname]=null;
    })
}

module.exports= SocketApi;
