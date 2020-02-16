const assert = require("assert");
const client = require("mongodb").MongoClient;

let db;

function initDb(url, callback) {
    if(db){
        console.warn("Trying to initiliaze again!!!");
        return callback(null, db);
    }
    client.connect(url, {useUnifiedTopology: true}, connected);

    function connected(err, client){
        if(err){
            callback(err);
        }
        db = client.db("foodie");
        callback(null, db);
    }
}

function getDb(){
    assert(db, "Database not initiliazed call initDb first.")
    return db;
}

module.exports = {
    getDb,
    initDb
}