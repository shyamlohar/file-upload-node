const mongoose = require('mongoose');

const schema = mongoose.Schema

const filesSchema = new schema({
    url: String
})

mongoose.model('FilesInfo', filesSchema);
