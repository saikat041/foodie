var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27017/foodie";

module.exports=function (callBack) {
  MongoClient.connect(url,function (err,db) {
    if(err) throw err;
    callBack(db);
    //console.log('Database Connected');
  });
}
