var mongoose=require('./mongoosedb');
//mongoose.connect("mongodb://192.168.1.210/lifeng");
var Schema = mongoose.Schema ;

var companySchema=new Schema({
	name:{type:String,index:true},
	phone:{type:String},
	username:{type:String}
});