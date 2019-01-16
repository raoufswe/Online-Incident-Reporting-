const https = require('https')
const express = require('express'); 
const app = express(); 
const fs = require('fs');
const request = require('request');
const path = require("path"); 
const exphabs = require("express-handlebars"); 
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override'); 
const upload = require('express-fileupload')
const session = require("express-session"); 
const flash = require("connect-flash"); 
const {mongoDbUrl} = require('./config/database'); 
const passport = require('passport');
const nodemailer = require('nodemailer')
var filter = require('content-filter')

app.use(filter());


mongoose.Promise = global.Promise;

mongoose.connect(mongoDbUrl, {useMongoClient: true}).then(db =>{
    console.log('Mongo connected'); 
}).catch(error=> console.log(error)); 





app.use(express.static(path.join(__dirname, "public"))); 

const {select, generateDate} = require('./helpers/handlebars-helper'); 

app.engine('handlebars',
exphabs({defaultLayout: 'home', helpers: {select: select, generateDate: generateDate}}));
app.set('view engine', 'handlebars');

app.use(upload()); 
app.use(bodyParser.urlencoded({extended: true}));

app.use(methodOverride('_method')); 

const home = require('./routes/home/index'); 
const admin = require('./routes/admin/index'); 
const posts = require('./routes/admin/posts'); 
const categories = require('./routes/admin/categories'); 



app.use(session({

    secret: 'raouf',
    resave: true,
    saveUninitialized: true

}));

app.use(flash()); 

app.use(passport.initialize());
app.use(passport.session()); 


app.use((req, res, next)=>{
    res.locals.user = req.user || null ;
    res.locals.success_message = req.flash('success_message'); 
    res.locals.error_message = req.flash('error_message'); 
    res.locals.form_errors = req.flash('form_errors'); 
    res.locals.error = req.flash("error"); 
    next(); 
})

app.use('/', home); 
app.use('/admin', admin); 
app.use('/admin/posts', posts); 
app.use('/admin/categories', categories); 





app.post('/send', (req, res)=>{
    const output =`
    <p>You have a new contact request</p>
    <h3>Contact details</h3>
    <ul>
    <li>Name: ${req.body.name}</li>
    <li>Name: ${req.body.email}</li>
    <li>Name: ${req.body.subject}</li>
    </ul>
    <h3>Messgae</h3>
    <p> ${req.body.message}</p>`;

     // create reusable transporter object using the default SMTP transport
     let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        domains: ["gmail.com", "googlemail.com"],
        auth: {
            user: 'abdulraoufswehli58@gmail.com', // generated the real user
            pass: 'RF1631997' // generated ethereal password
        },
        tls:{
            rejectUnauthorized: false
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Online-Report-Website-Conatct" <abdulraoufswehli58@gmail.com', // sender address
         // list of receivers
        to: 'abdulraoufswehli58@gmail.com, tp042816@mail.apu.edu.my',
        subject: 'Conatct request', // Subject line
        text: 'Hello world?', // plain text body
        html: output// html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        
        console.log('Message sent: %s', info.messageId);
        
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        res.render('home/index')
    });
});




app.listen(4500, ()=>{
    console.log('listening on port 4500')
});

