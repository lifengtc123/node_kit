/**
 * Created by lifeng on 16/1/22.
 */
var schedule = require("node-schedule");

var date = new Date(2014,2,14,15,40,0);

var rule=new schedule.RecurrenceRule();   //循环执行的对象



schedule.scheduleJob(date,function(){

});