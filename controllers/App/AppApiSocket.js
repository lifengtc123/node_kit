/**
 * Created by wbb on 15/6/30.
 */
var crypto =require("crypto");

AppApplication.messages=require('./Messages.js');
AppApplication.nobilitys=require('./Nobilitys.js');
AppApplication.jobs=require('./Jobs.js');
AppApplication.boxes=require('./Boxes.js');
AppApplication.events=require('./Events.js');
AppApplication.meRecords=require('./MeRecords.js');
AppApplication.medications=require('./Medications.js');

function AppApiSocket(socket,appsocketuser){
    socket.on('userlogin', function(username) {
        if(username){
            socket.myname=username;
            appsocketuser[username]=socket;
        }
    });
    //监听新的消息聊天内容
    socket.on('createmessage', function(obj){
       // socket.emit('message', obj);
        var content=[];
        content.push(obj.content)
        socket.in(obj.boxNumber).broadcast.emit('message',content);
    });
    //监听新的消息聊天内容
    socket.on('alertJoin', function(obj){
        //向所有客户端广播发布的消息
        socket.emit('alertJoin', obj);
    });
    //监听新的消息聊天内容
    socket.on('deleteUser', function(username){
        appsocketuser[username]=null;
    });


    socket.on("newdevice",function(deivce){
        socket.join("appdeivce");      //加入手机APP所有对象集  发给所有
        for(var i=0;i<deivce.boxNumbers.length;i++){
            socket.join(deivce.boxNumbers[i]);               //加入盒子所有对象集
        }
        socket.myname=deivce.name;
        appsocketuser[deivce.name]=socket;
    });

    socket.on("updatedevice",function(deivce){
        //console.logs(deivce.boxNumbers);
        for(var i=0;i<deivce.boxNumbers.length;i++){
            socket.join(deivce.boxNumbers[i]);               //加入盒子所有对象集
        }
    });

    socket.on('disconnect', function () {
        appsocketuser[socket.myname]=null;
    })
}

module.exports= AppApiSocket;