/**
 * Created by wangbb on 15/6/11.
 */
//盒子表
var mongoose = require('./mongoosedb');
var async = require('async');
var Schema = mongoose.Schema;

/**
 * 盒子信息
 * @type {Schema}
 *
 */
var eventSchema = new Schema({
    type: {type: Number, default: 0},      //消息类型 ：0 药物提醒 超时提醒，1 语言提醒 即时消息下发，2最新咨询   3 即时消息反馈提醒 文字
    content: String,    //提醒内容
    filepath: String,   //语音提醒路径
    time: String,      //语音对应的长度
    image: String,     //图片路径
    createTime: Date,  //创建时间
    updateTime: Date,   //更新时间
    proid: String,      //下发给盒子的ID   及时提醒使用
    boxNumber: {type: String, index: true},   //药盒ID   即时和定时提醒
    boxName: String,     //盒子的名字
    mtype: {type: Number, default: 0}, //已读未读状态 0:未读，1:已读  即时提醒
    Source: {type: Number, default: 0},   // 来源   0 APP  1 微信
    openid: String,                   //来源微信ID号
    userid: String     //发送的用户
}, {
    conllection: "event"
});


var eventModel = mongoose.model('Event', eventSchema);

function Event(event) {
    this.boxNumber = event.boxNumber;
    this.type = event.type;
    this.content = event.content;
    this.filepath = event.filepath;
    this.image = event.image;
    if (event.Source != null)this.Source = event.Source;
    this.openid = event.openid;
    this.proid = event.proid;
    this.time = event.time;
    this.boxName = event.boxName;
    this.userid=event.userid;

};

module.exports = Event;

Event.Model=function(){
	return eventModel;
}

Event.prototype.save = function (callback) {
    this.createTime = new Date();
    this.updateTime = new Date();
    var newMessage = new eventModel(this);

    newMessage.save(function (err, event) {
        if (err) {
            return callback(err);
        }
        callback(null, event);
    });
}



Event.prototype.saveEvent = function (callback) {
    this.createTime = new Date();
    this.updateTime = new Date();
    var newMessage = new eventModel(this);
    newMessage.save(function (err, event) {
        if (err) {
            return callback(err);
        }
        callback(null, event);
    });
}


Event.update = function (event, callback) {
    eventModel.update({_id: event._id}, event, function (err, doc) {
        if (err) {
            return callback(err);
        }
        callback(null, doc);
    });
}


Event.getOne = function (number, callback) {
    eventModel.findOne({boxNumber: number}).exec(function (err, event) {
        callback(err, event);
    })
}

Event.getAll = function (number, callback) {
    //console.logs(username);
    var number = number;
    eventModel.find({number: number}).exec(function (err, event) {
        //console.logs(box.length);
        callback(err, event);
    })
}
//获取最新的10条数据
Event.getTenList = function (eventobj, callback) {
    eventModel.find({$or: [{boxNumber: {"$in": eventobj.boxids}}, {'nobility': eventobj.nobility}]}).sort({'_id': -1}).limit(10).exec(function (err, event) {
        callback(err, event);
    })
}

//获取之前的10条数据
Event.getHistoryList = function (boxids,userid,page,pageSize,firstsize, callback) {
    var xxx = parseInt((page - 1) * pageSize) + parseInt(firstsize);
    eventModel.find({$or: [{boxNumber: {"$in": boxids}}, {'nobility': userid}]}).sort({'createTime': -1}).skip(xxx).limit(pageSize).exec(function (err, event) {
        callback(err, event);
    })
}

//Event.getCount=function(boxNumbers,callback){
//    eventModel.find({'boxNumber':{"$in":boxNumbers}}).exec(function(err,event){
//        callback(err,event);
//    })
//}

Event.getCountByName = function (eventobj, callback) {
    eventModel.find({'nobility': eventobj.nobility}, {$or: {boxNumber: {"$in": eventobj.boxids}}}).exec(function (err, event) {
        callback(err, event);
    })
}

Event.getGroup = function (name, _id, callback) {
    eventModel.aggregate().match({name: name}).group({
        "_id": {name: "$name"},
        count: {"$sum": 1}
    }).exec(function (err, event) {
        if (err) {
            callback(err);
        }
        callback(null, event);
    })
}

Event.updateGx = function (number, password, updatebb, callback) {
    eventModel.update({number: number}, {
        $set: {updatebox: 1, updatepassword: password},
        updatebb: updatebb
    }, {}, function (err, obj) {
        callback(err, obj)
    })
}

Event.getOne2 = function (number, proid, callback) {
    eventModel.findOne({boxNumber: number, proid: proid,mtype:0}).exec(function (err, event) {
        callback(err, event);
    })
}



