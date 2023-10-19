const express = require('express');
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const User = require('./models/User');
const app = express();
const port = 5000;
const nodemailer = require("nodemailer");


const stripe = require('stripe')('sk_test_51I58GvJWvOCl4irEXh0wXUHgEAImIjWRy4ylnvVEWB5UpO1r9nzMhMVVR8YYOHtQNUNoSU5yBSRFwxeVJc56pbYz00PUHd5fa2');


//middlewares
app.use(bodyParser.urlencoded({ extended: true }));
// Parses the text as json
app.use(bodyParser.json());
app.use(cors({ origin: true }));

app.get('/', (req, res) => {
    res.send('Hello World!')
})
  
app.post('/register', (req, res) => {
    const user = new User();
    user.name = req.body.name;
    user.email = req.body.email;
    user.password = req.body.password;
    user.otp=Math.floor(Math.random() * 9000 + 1000);

    user.save().then((resp) => {
        console.log('data inserted');
        res.send("Data inserted");
    }).catch(err => {
        console.log(err)
    });
      
})




app.get('/findall', (req, res) => {
    User.find()
    .then(data =>{
        res.json(data);
    }).catch(err =>{
        console.log(err);
    })
})

app.get('/getuser', async(req, res) => {
    const emailQuery = req.query.email;
    //console.log('>>>>>>',emailQuery)
    const user = await User.findOne({ "email": emailQuery });

    
    console.log('>>>>>',user)
    if (!user) {
      return res.status(404).send('User not found');
    }
    const transporter = await nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'spencer.konopelski25@ethereal.email',
            pass: 'fHp8b4vVRZqW9cpa3e'
        }
    });


    const info = await transporter.sendMail({
        from: '"Team Cartiofy 👻" <spencer.konopelski25@ethereal.email>', // sender address
        to: emailQuery, // list of receivers
        subject: "OTP for log in ✔", // Subject line
        text: `Your OTP is ${user.otp}`, // plain text body
        html: `<b>Your OTP is ${user.otp}</b>`, // html body
    });
    console.log("Message sent: %s", info.messageId);
    
   
    res.send(user);
    
})


app.post('/payments/create',async(req,res)=>{
    const total = req.query.total;

    console.log(`Payment req recieved total Ammount : ${total}`);

    const paymentIntent = await stripe.paymentIntents.create({
        amount: total, // subunits of the currency
        currency: "inr",
      });
    
    // status 201 is OK - Created
  res.status(201).send({
    clientSecret: paymentIntent.client_secret,
  });
})

mongoose.connect(
    "mongodb+srv://saikatmukhopadhyay17:FvrzvUtucDb52SFP@cluster0.swfnqdd.mongodb.net/", 
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(res => {
    console.log("mongodb connected....");
    app.listen(port,() => {
        console.log(`server running at port ${port}`);
    });
 })
 .catch(err =>{
     console.log(err)
 })



module.exports = {
    app
}