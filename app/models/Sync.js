// var client = {
//     socket_identifier: "",
//     app_identifier: "",
//     other_socket: "9876329y84h90832",
// };

var mongoose = require('mongoose');

var connection;

if (process.env.PROD_MONGODB != undefined) {
    connection = process.env.PROD_MONGODB;
} else {
    connection = "mongodb://localhost/syncstart";
}

mongoose.connect(connection,  { useNewUrlParser: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

var Schema = mongoose.Schema;

var SyncSchema = new Schema({
    socket_identifier: String, // First user data
    first_player_name: String,
    other_socket: String,   // Second user data
    second_player_name: String,
    app_identifier: String, // The identifier generated by the app
    open_date: Date,        // Created at every connection
    connection_date: Date   // Created at every match
});

SyncSchema.pre('save', function(next){
    if(!this.open_date) {
        this.open_date = new Date();
    }
    next();
});
module.exports = mongoose.model('Sync', SyncSchema);