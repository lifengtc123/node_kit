/**
 * Created by lifeng on 15/8/13.
 */
var mongoose=require('./mongoosedb');
var async=require('async');
var Schema = mongoose.Schema ;

var systemDatesSchema=new Schema({
    days:{type:Number,default:0},
    createTime:{type:Date}
},{
    conllection:"systemdates"
});

var systemDateModel= mongoose.model('SystemDate',systemDatesSchema);

function SystemDate(system){
    this.createTime=system.createTime;
    this.days=system.days;
};
module.exports=SystemDate;


SystemDate.prototype.save=function(callback){
    var newMessage=new systemDateModel(this);

    newMessage.save(function(err,event){
        if(err){
            return callback(err);
        }
        callback(null,event);
    });
}


SystemDate.findDay=function(callback){
    systemDateModel.findOne().exec(function(err,systemDate){
        callback(err,systemDate);
    })
}

SystemDate.updateAndFind=function(days,callback){
    systemDateModel.findOneAndUpdate({days:{$ne:days}},{days:days},function(err,systemDate){
        console.log(systemDate);
        callback(err,systemDate);
    })
 }
