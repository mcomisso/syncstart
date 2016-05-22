var client = {
    socket_identifier: "",
    app_identifier: "",
    other_socket: "9876329y84h90832"
};

var mongoose = require('mongoose');
mongoose.connect(process.env.PROD_MONGODB, function (err) {
    if (err) {
        console.error(err);
    } else {
        console.log("Mongo connected");
    }
});
var Schema = mongoose.Schema;

var SyncSchema = new Schema({
    socket_identifier: String,
    app_identifier: String,
    other_socket: String,
    open_date: Date,
    connection_date: Date
});

SyncSchema.pre('save', function(next){
    if(!this.open_date) {
        this.open_date = new Date();
    }
    next();
});
module.exports = mongoose.model('Sync', SyncSchema);