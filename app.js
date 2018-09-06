const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
var exphbs = require('express-handlebars');
const multer = require('multer');

const mongoURI = "mongodb://localhost/fileuploads";

express.json()
express.urlencoded({ extended: false });


const app = express();

app.use('/uploads', express.static('uploads'));

app.use(express.static('public'));

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

mongoose.connect(mongoURI, { useNewUrlParser: true }, () => {
    console.log('connection successful');
})

require('./models/fileinfo');

const FileInfo = mongoose.model('FilesInfo');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    },
})

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        console.log(file)
        if (file.mimetype.split('/')[0] != 'image') {
            cb(new Error('I don\'t have a clue!'))
        }
        else {
            cb(null, true)
        }
    },
}).single('file')

app.get('/', (req, res) => {
    FileInfo.find()
        .then((files) => {
            let filesArray = files.map(({ _id, url }) => ({ _id, url }));
            res.render('home', { images: filesArray });
        },
            (err) => {
                console.log(err)
            }).catch(err => {
                console.log(err);
            })
})

app.post('/pic', (req, res) => {
    upload(req, res, function (err) {
        if (err) {
            // An error occurred when uploading
            console.log(err)
            return res.redirect('/')
        }

        console.log(req.file);
        let file = new FileInfo({
            url: `http://localhost:8000/uploads/${req.file.filename}`
        }).save((err, file) => {
            if (err) {
                console.log(err);
            }
        })
        res.redirect('/')
    })

})

app.get('/delete/:id', (req, res) => {
    console.log(req.params.id)
    FileInfo.deleteOne({ _id: req.params.id })
        .then(() => {
            res.redirect('/');
        })
})

app.listen(8000, () => {
    console.log('server running on port 8000')
});


