const express = require("express");
const path = require('path');
const Razorpay = require('razorpay');
const connection = require('./Database');
const {GeneralUserModel} = require("./Models/GeneralUser.Model");
const {AdminUserModel} = require("./Models/AdminUser.Model");
const {StudentUserModel} = require("./Models/StudentUser.Model")
const {Register} = require("./Controllers/Register.Controller");
const {Login} = require("./Controllers/Login.Controller");
const JWT = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const uniqid = require('uniqid');
const app = express();
require("dotenv").config();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
const port = process.env.PORT || 5500;

app.use(express.static(path.join(__dirname, 'public')));
app.get('/registration_general', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'registration.html'));
});
app.get('/registration_admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'AdminRegister.html'));
});
app.get('/registration_student', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'StudentRegister.html'));
});
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
app.get('/events', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Events.html'));
});
app.get('/arrahmanconcert', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'ARRahman.html'));
});
app.get('/vijayantonyconcert', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'VijayAntonyEvent.html'));
});
app.get('/gvprakash', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'GVPrakash.html'));
});
app.get('/landing', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'landing.html'));
});
app.get('/mybookings', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'MyBookings.html'));
});
app.get('/success', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','success.html'));
});
app.get('/failure', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','failure.html'));
});

app.post('/registration',Register);
app.post('/login',Login);
app.post("/landing",async(req,res)=>{
    const {token} = req.body;
    try{
      let decoded = JWT.decode(token,process.env.SECRET);
      let data = await StudentUserModel.findOne({_id : decoded.userId}) || await AdminUserModel.findOne({_id : decoded.userId}) || await GeneralUserModel.findOne({_id : decoded.userId});
      res.send(data);
    }
    catch(err){
      console.log(err);
    }  
})

app.post("/order",async(req,res)=>{
    const {amount,currency} = req.body;
    // console.log(req.body);
    var instance = new Razorpay({ 
        key_id: process.env.RAZORPAY_ID_KEY, 
        key_secret: process.env.RAZORPAY_SECRET_KEY
     })

    try{
        let amount_in_paise = amount*100;
        const order = await instance.orders.create({
            amount: amount_in_paise,
            currency,
            receipt: uniqid()
        })
        res.send(order)
    }
    catch(err){
        res.send(err)
    }
    
})



app.post("/order/validate",async(req,res)=>{
  const {event_Details,razorpay_payment_id,total_amount,Buyer_Details,ticketCount,ticketPrice} = req.body;
  
  // console.log(req.body);
    if(Buyer_Details.account_type == "student"){
        var instance = new Razorpay({ 
            key_id: process.env.RAZORPAY_ID_KEY, 
            key_secret: process.env.RAZORPAY_SECRET_KEY 
        })
        try{
            const validate = await instance.payments.fetch(razorpay_payment_id);
            const userData = {
                order_id: validate.order_id,
                payment_id:validate.id
            };
            const ticketData = {
              Order_ID : userData.order_id,
              Payment_ID : userData.payment_id,
              Ticket_Count : ticketCount,
              Ticket_Price : ticketPrice,
              Amount_Paid : total_amount,
              Event : event_Details.name,
              venue : event_Details.venue
            }
            const user = await StudentUserModel.findById(Buyer_Details._id)
            console.log("user",user);
            let newArray = [...user.order,ticketData];
            user.order = newArray;
      
            let transporter = nodemailer.createTransport({
              host: "smtp.gmail.com", 
              port: 587,                
              secure: false,            
              auth: {
                  user: 'buvanesifet26@gmail.com', 
                  pass: process.env.SMTP_KEY       
              }
          });
      
          let mailOptions = {
              from: '"My Website" buvanesifet26@gmail.com', 
              to: `${Buyer_Details.email}`,                  
              subject: `Confirmation of Your Tickets for ${event_Details.name} - ${event_Details.venue}`,                       
              text:`Dear ${Buyer_Details.username},
              Thank you for purchasing tickets for the ${event_Details.name} in ${event_Details.venue}! We are excited to have you join us for an unforgettable night of music and celebration at one of the most anticipated events of the year.
              Order Summary:
                 * Number of Tickets: ${ticketCount}
                 * Ticket Price: ${ticketPrice} rupees per ticket
                 * Total Amount Paid: ${total_amount} rupees
                 * Event : ${event_Details.name}
                 * Venue: ${event_Details.venue}
          
              Important Information:
                  Doors open at 05:30 pm  and we recommend arriving early to enjoy the pre-show activities.
                  Official merchandise will be available at the venue.
                  Food and beverages can be purchased inside the venue.
      
              Need Assistance?
                  If you have any questions or need further information, please feel free to contact us:
      
                  Email: buvanesifet26@gmail.com
                  Phone: 8072454199
                  We look forward to seeing you at the concert and hope you enjoy an incredible evening with A.R. Rahman's music. Thank you for your support!
      
              Warm regards,
      
                  My Website
                  Customer Service Team
                  8072454199, buvanesifet26@gmail.com.
              `                  
          };
          try {
              let info = await transporter.sendMail(mailOptions);
              console.log("Message sent: %s", info.messageId);
              console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
          } catch (error) {
              console.error("Error sending message:", error);
          }
            await user.save();
            res.redirect(`/success?payment_id=${encodeURIComponent(userData.payment_id)}`);
        }
        catch(err){
            res.redirect("/failure")
        }
    }
    else if(Buyer_Details.account_type == "admin"){
        var instance = new Razorpay({ 
            key_id: process.env.RAZORPAY_ID_KEY, 
            key_secret: process.env.RAZORPAY_SECRET_KEY 
        })
        try{
            const validate = await instance.payments.fetch(razorpay_payment_id);
            const userData = {
                order_id: validate.order_id,
                payment_id:validate.id
            };
            const ticketData = {
              Order_ID : userData.order_id,
              Payment_ID : userData.payment_id,
              Ticket_Count : ticketCount,
              Ticket_Price : ticketPrice,
              Amount_Paid : total_amount,
              Event : event_Details.name,
              venue : event_Details.venue
            }
            const user = await AdminUserModel.findById(Buyer_Details._id)
            console.log("user",user);
            let newArray = [...user.order,ticketData];
            user.order = newArray;
      
            let transporter = nodemailer.createTransport({
              host: "smtp.gmail.com", 
              port: 587,                
              secure: false,            
              auth: {
                  user: 'buvanesifet26@gmail.com', 
                  pass: process.env.SMTP_KEY       
              }
          });
      
          let mailOptions = {
              from: '"My Website" buvanesifet26@gmail.com', 
              to: `${Buyer_Details.email}`,                  
              subject: `Confirmation of Your Tickets for ${event_Details.name} - ${event_Details.venue}`,                       
              text:`Dear ${Buyer_Details.username},
              Thank you for purchasing tickets for the ${event_Details.name} in ${event_Details.venue}! We are excited to have you join us for an unforgettable night of music and celebration at one of the most anticipated events of the year.
              Order Summary:
                 * Number of Tickets: ${ticketCount}
                 * Ticket Price: ${ticketPrice} rupees per ticket
                 * Total Amount Paid: ${total_amount} rupees
                 * Event : ${event_Details.name}
                 * Venue: ${event_Details.venue}
          
              Important Information:
                  Doors open at 05:30 pm  and we recommend arriving early to enjoy the pre-show activities.
                  Official merchandise will be available at the venue.
                  Food and beverages can be purchased inside the venue.
      
              Need Assistance?
                  If you have any questions or need further information, please feel free to contact us:
      
                  Email: buvanesifet26@gmail.com
                  Phone: 8072454199
                  We look forward to seeing you at the concert and hope you enjoy an incredible evening with A.R. Rahman's music. Thank you for your support!
      
              Warm regards,
      
                  My Website
                  Customer Service Team
                  8072454199, buvanesifet26@gmail.com.
              `                  
          };
          try {
              let info = await transporter.sendMail(mailOptions);
              console.log("Message sent: %s", info.messageId);
              console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
          } catch (error) {
              console.error("Error sending message:", error);
          }
            await user.save();
            res.redirect(`/success?payment_id=${encodeURIComponent(userData.payment_id)}`);
        }
        catch(err){
            res.redirect("/failure")
        }
    }
    else {
        var instance = new Razorpay({ 
            key_id: process.env.RAZORPAY_ID_KEY, 
            key_secret: process.env.RAZORPAY_SECRET_KEY 
        })
        try{
            const validate = await instance.payments.fetch(razorpay_payment_id);
            const userData = {
                order_id: validate.order_id,
                payment_id:validate.id
            };
            const ticketData = {
              Order_ID : userData.order_id,
              Payment_ID : userData.payment_id,
              Ticket_Count : ticketCount,
              Ticket_Price : ticketPrice,
              Amount_Paid : total_amount,
              Event : event_Details.name,
              venue : event_Details.venue
            }
            const user = await GeneralUserModel.findById(Buyer_Details._id)
            console.log("user",user);
            let newArray = [...user.order,ticketData];
            user.order = newArray;
      
            let transporter = nodemailer.createTransport({
              host: "smtp.gmail.com", 
              port: 587,                
              secure: false,            
              auth: {
                  user: 'buvanesifet26@gmail.com', 
                  pass: process.env.SMTP_KEY       
              }
          });
      
          let mailOptions = {
              from: '"My Website" buvanesifet26@gmail.com', 
              to: `${Buyer_Details.email}`,                  
              subject: `Confirmation of Your Tickets for ${event_Details.name} - ${event_Details.venue}`,                       
              text:`Dear ${Buyer_Details.username},
              Thank you for purchasing tickets for the ${event_Details.name} in ${event_Details.venue}! We are excited to have you join us for an unforgettable night of music and celebration at one of the most anticipated events of the year.
              Order Summary:
                 * Number of Tickets: ${ticketCount}
                 * Ticket Price: ${ticketPrice} rupees per ticket
                 * Total Amount Paid: ${total_amount} rupees
                 * Event : ${event_Details.name}
                 * Venue: ${event_Details.venue}
          
              Important Information:
                  Doors open at 05:30 pm  and we recommend arriving early to enjoy the pre-show activities.
                  Official merchandise will be available at the venue.
                  Food and beverages can be purchased inside the venue.
      
              Need Assistance?
                  If you have any questions or need further information, please feel free to contact us:
      
                  Email: buvanesifet26@gmail.com
                  Phone: 8072454199
                  We look forward to seeing you at the concert and hope you enjoy an incredible evening with A.R. Rahman's music. Thank you for your support!
      
              Warm regards,
      
                  My Website
                  Customer Service Team
                  8072454199, buvanesifet26@gmail.com.
              `                  
          };
          try {
              let info = await transporter.sendMail(mailOptions);
              console.log("Message sent: %s", info.messageId);
              console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
          } catch (error) {
              console.error("Error sending message:", error);
          }
            await user.save();
            res.redirect(`/success?payment_id=${encodeURIComponent(userData.payment_id)}`);
        }
        catch(err){
            res.redirect("/failure")
        }
    }
})


app.listen(port, async() => {
    try{
        await connection;
        console.log('Connected to database');
    }catch(error){
        console.log(error); 
    }
  console.log(`Server is listening on port ${port}`)
})