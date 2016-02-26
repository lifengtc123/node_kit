var mongoose=require("mongoose");
module.exports=mongoose;
mongoose.connect("mongodb://127.0.0.1/lifeng", {read_secondary: true});