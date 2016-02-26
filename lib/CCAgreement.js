/**
 * Created by lifeng on 15/4/28.
 */
/**
 * 即时任务和定时任务下发  即时任务 无孔参数 无任务ID  操作类型增 0  无操作间隔  声音名称 时间戳加.amr
 *                      定时任务
 * @type {exports}
 */
var crypto = require('crypto');

module.exports=CCAgreement;


function CCAgreement(deviceID,my){
    this.deviceID=deviceID;
    this.my=my;
    this.paramdata="";
    this.timeval="";
}
/**
 *  任务下发
 * @param type   任务类型 1 定时 0 即时
 * @param k    大小孔  0  无孔 1 小孔 2 大孔
 * @param id   任务ID  0--255
 * @param state  操作类型  0 增 1 删 2 改
 * @param jg  操作的时间间隔 分钟单位
 * @param filepath  文件名
 */
CCAgreement.prototype.param=function(type,k,id,state,jg,filepath,bl){
    this.paramdata=toHexString(type)+ toHexString(k)+toHexString(id)+toHexString(state)+toHexString(jg,2)+stringToHex(filepath);
    if(bl!=null)this.paramdata+=bl;
   // console.log(this.paramdata);
}

CCAgreement.prototype.setData=function(times){
    this.timeval=toHexString(times.length);
    for(var x=0;x<times.length;x++){
        if(times[x]==null)break;
       var time=Math.floor(times[x]/60000);
        this.timeval+=toHexString(time,4);
    }
    this.paramdata=this.paramdata+this.timeval;
   // console.log(this.timeval);
}

CCAgreement.prototype.getValue=function(){
    var value=this.paramdata;
    var sjc=Math.floor(new Date().getTime()/1000);
    value=this.deviceID+sjc.toString(16)+toHexString(value.length/2,2)+value;
    var valuejy=value+this.my;
    var nInputLength = valuejy.length;
    var StrHex = "";
    if(nInputLength%2 == 0) //当输入够偶数位；
    {

        for (var i=0; i < nInputLength; i = i + 2 )
        {
            var str = valuejy.substr(i, 2); //16进制；
            //StrHex = StrHex + .toString(16);

            var n = parseInt(str, 16);//10进制；
            StrHex = StrHex + String.fromCharCode(n);
        }

    }
    var md5=crypto.createHash('md5');
    sjc=md5.update(StrHex).digest('hex');
    value=sjc+value;
    return value;
}


CCAgreement.prototype.getXintiao=function(){
  //  var value=
}



CCAgreement.prototype.getSbFK=function(type,state,time,isValid){
    var value=toHexString(type)+toHexString(state)+toHexString(time,4)+toHexString(isValid);
    var sjc=Math.floor(new Date().getTime()/1000);
    value=this.deviceID+sjc.toString(16)+toHexString(value.length/2,2)+value;
    var valuejy=value+this.my;
    var nInputLength = valuejy.length;
    var StrHex = "";
    if(nInputLength%2 == 0) //当输入够偶数位；
    {

        for (var i=0; i < nInputLength; i = i + 2 )
        {
            var str = valuejy.substr(i, 2); //16进制；
            //StrHex = StrHex + .toString(16);

            var n = parseInt(str, 16);//10进制；
            StrHex = StrHex + String.fromCharCode(n);
        }

    }
    var md5=crypto.createHash('md5');
    sjc=md5.update(StrHex).digest('hex');
    value=sjc+value;
    //  console.log(value);
    //  console.log(value.length);
    return value;
}

//定时任务和即时任务的上报后给予反馈  类型改变 ，内容不变
CCAgreement.prototype.getRwfk=function(type,value){
    this.paramdata=toHexString(type)+value;
};

//版本更新
CCAgreement.prototype.updateBB=function(obj,password){
    this.paramdata="06"+stringToLong(obj.number,2)+stringToHex(obj.filepath,14)+obj.key+stringToHex(password,8);
}

//声音下发
CCAgreement.prototype.setVolume=function(value){
    this.paramdata="0c0"+value+"0000000000000000";
}

//重置反馈
CCAgreement.prototype.setRestart=function(value){
    this.paramdata="8d"+value;
}

//重置清除所有消息
CCAgreement.prototype.reset=function(value){
    this.paramdata="0e00000000";
}


function toHexString(value,len){
    if(value==null) return "";
    if(len==null)len=1;
    value=value.toString(16);
    while(value.length<len*2){
        value="0"+value;
    }
    return value;
}

function stringToHex(str,len){
    if(str==null) return "";
    var val="";
    for(var i=0;i<str.length;i++){
        if(val==""){
            val=toHexString(str.charCodeAt(i));
        }else{
            val+=toHexString(str.charCodeAt(i));
        }
    }
    if(len!=null){
        while(val.length<len*2){
            val="00"+val;
        }
    }
    return val;
}

//字符串补长度
function stringToLong(val,len){
    if(len!=null){
        while(val.length<len*2){
            val="00"+val;
        }
    }
    return val;
}

/**
 * 计算 MD5
 * @param str
 * @returns {number}
 */
CCAgreement.getMD5=function(str){
    var nInputLength = str.length;
    if(nInputLength%2 == 0) //当输入够偶数位；
    {
        var StrHex = "";
        for (var i=0; i < nInputLength; i = i + 2 )
        {
            var value = str.substr(i, 2); //16进制；
            //StrHex = StrHex + .toString(16);

            var n = parseInt(value, 16);//10进制；
            StrHex = StrHex + String.fromCharCode(n);
        }
        var md5=crypto.createHash('md5');
        sjc=md5.update(StrHex).digest('hex');
        return sjc;
    }
}

getMD5=function(str){
    var nInputLength = str.length;
    if(nInputLength%2 == 0) //当输入够偶数位；
    {
        var StrHex = "";
        for (var i=0; i < nInputLength; i = i + 2 )
        {
            var value = str.substr(i, 2); //16进制；
            //StrHex = StrHex + .toString(16);

            var n = parseInt(str, 16);//10进制；
            StrHex = StrHex + String.fromCharCode(n);
        }
        var md5=crypto.createHash('md5');
        sjc=md5.update(StrHex).digest('hex');
        return sjc;
    }
}

/**
 * 类型
 * 0 定时任务下发，反馈
 * 1 即时任务下发，反馈
 * 3  定时上报
 * 4 即时上报
 * 5 错误信息
 * 6 固件升级
 **/
CCAgreement.getType=function(){

}

CCAgreement.hexToString=function(str){
    var nInputLength = str.length;
    if(nInputLength%2 == 0) //当输入够偶数位；
    {
        var StrHex = "";
        for (var i=0; i < nInputLength; i = i + 2 )
        {
            var value = str.substr(i, 2); //16进制；
            //StrHex = StrHex + .toString(16);

            var n = parseInt(value, 16);//10进制；
            StrHex = StrHex + String.fromCharCode(n);
        }
        return StrHex;
    }
}


//CCAgreement.param=function(type,k,id,state,jg,filepath){
//    this.paramdata=toHexString(type)+ toHexString(k)+toHexString(id)+toHexString(state)+toHexString(jg,2)+stringToHex(filepath);
//    // console.log(this.paramdata);
//}
//
//CCAgreement.param(1);


