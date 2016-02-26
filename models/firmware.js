/**
 * Created by lifeng on 15/3/11.
 */
//盒子表
var mongoose=require('./mongoosedb');
var async=require('async');
var Schema = mongoose.Schema ;


/**
 * 盒子信息
 * @type {Schema}
 *
 */
var firmwareSchema=new Schema({
    number:{type:String,index:true},   //版本号
    key:String,                //md5码
    updateTime:{type:Date},  //更新时间
    filepath:{type:String}   //文件名
},{
    conllection:"firmware"
});



var firmwareModel= mongoose.model('Firmware',firmwareSchema);

function Firmware(firmware){
    this.number=firmware.number;
    this.updateTime=new Date();
    //this.key=firmware.key;
    //this.filepath=firmware.filepath

};

module.exports=Firmware;

Firmware.Model=function(){
	return firmwareModel;
}

Firmware.prototype.save=function(callback){

    var newFirmware=new firmwareModel(this);

    newFirmware.save(function(err,firmware){
        if(err){
            return callback(err);
        }
        callback(null,firmware);
    });
}



Firmware.getOne=function(number,callback){
    firmwareModel.findOne({number:number}).exec(function(err,firmware){
        callback(err,firmware);
    })
}


