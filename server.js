const express = require('express');
const path = require('path');
const hbs = require('express-handlebars');
const bodyparser = require('body-parser');
const session=require('express-session');
const Expense=require('./models/expense')
const Income=require('./models/income')


//-------------------------------------------------
//Node Mailer
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'akshats540@gmail.com',
    pass: '420540420'
  }
});
//-------------------------------------------------


const app=express()



//configure view engine as hbs
app.set('views',path.join(__dirname,'views'))            //location
app.set('view engine','hbs')      // set path (view engine,'ext-name')
//configure layouts in mainlayout as it imports in all of the pages
// app.engine('hbs',hbs({
//
// extname: 'hbs',
// defaultLayout:'mainlayout',
// layoutDir:__dirname+'/views/layouts/'
//
// }))

//----------------------------------------------------------------
//---------------------------------------------------------------
//start session----------
app.use(session({secret:'asdfdfss'}))
//---------------------------------------------------------------
//---------------------------------------------------------------


//configure body parser
app.use(bodyparser.json())//enables to transfer data in Jason format
app.use(bodyparser.urlencoded({
  extended:true      //upto the data length
}))
//----------------------------------------------------
app.use(express.static(path.join(__dirname,'views')))
//-----------------------------------------------------
//create mongoose connection
const mongoose=require('mongoose')
const URL="mongodb://localhost:27017/Money-Manager";
mongoose.connect(URL)
//----------------------------------------------------------------------
//######################################################################
//----------------------------------------------------------------

//server configuration
//server creation and start server  ---listen(port no,function)------
app.listen(4000,()=>{
  console.log("Server started on port :4000");
})


//######################################################################
//-----------------------------------------------------------------------------------------------------------------main code started

app.get('/',(req,res)=>{
    res.render('index',{user:req.session.user})
})
//---------------------------------------------------------
app.get('/admin',(req,res)=>{
  res.render('adminlogin',{admin:req.session.admin})
})
//-------------------------------------------------------------
app.get('/dashboard',(req,res)=>{
  Manager.find({user:req.session.user},(err,result)=>{
    if(err) throw err;
    else if(req.session.user==null){res.render('index')}
    else
    res.render('dashboard',{user:req.session.user,data:result})
  })
})
//--------------------------------------------------------------
app.get('/Transictions',(req,res)=>{
 if(req.session.user==null){res.render('index')}
  else
  res.render('Transictions',{user:req.session.user})
})
//---------
const Adminlogin=require('./models/adminlogin')
// app.get('/insert',(req,res)=>{
//   var newdata=Adminlogin({
//     name:'Anurag Sharma',
//     emailid:'anu.sharma74114@gmail.com',
//     password:'admin'
//   })
//   newdata.save()
// })
//------------Admin login check
app.post('/admin-logincheck',(req,res)=>{
 var email=req.body.email;
 //console.log(email);
 var password=req.body.pwd;
 //console.log(password);
 Adminlogin.find({emailid:email,password:password},(err,result)=>{
   //console.log(result);
   if(err) throw err;
   else if(result.length!=0)
   {
     req.session.admin=email;

     res.render('adminhome',{aid:req.session.admin})
   }
   else

   res.render('adminlogin',{msg:'login Fail,Try again',})
   })
})
//#########################################################################
// Logout
//------admin logout
app.get('/user-logout',(req,res)=>{
req.session.destroy();
res.render('index',{msg:'user Logout successfully'})

})

//##########################################################################
//----------------Customer Account Creation----------------------

//------------------->
const User=require('./models/user')
app.post('/create-customer',(req,res)=>{
 var name=req.body.name;
 var email=req.body.email;
 var password=req.body.password;
 var pin=req.body.pin;
 var mno=req.body.mno;
 var address=req.body.address;

 var newcustomer=User({
  name:name,
  emailid:email,
  password:password,
  pin:pin,
  mobile:mno,
  address:address
 })
 newcustomer.save().then((data)=>console.log("user created...."+data));
 res.render('index',{msg:'User Account created...',})
})

//-------------------------------------------------------------------
//#######################################################################
//User logincheck

app.post('/user-login',(req,res)=>{
 var email=req.body.email;
 //console.log(email);
 var password=req.body.password;
 //console.log(password);
 User.find({emailid:email,password:password},(err,result)=>{
   //console.log(result);
   if(err) throw err;
   else if(result.length!=0)
   {
     req.session.user=email;
     Manager.find({user:req.session.user},(err,result)=>{
       if(err) throw err;
       else
       res.render('dashboard',{user:req.session.user,data:result})
     })
   }
   else

   res.render('index',{msg:'login Fail,Try again',})
   })
})
//-------------------------------------------------------
//#######################################################################
//#######################################################################
//Adding new Category
const Manager=require('./models/manager')

app.post('/add-transictions',(req,res)=>{
  // for date
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();

today = dd + '/' + mm + '/' + yyyy;
var user=req.session.user;
var income=req.body.income;
var expense=req.body.expense;
var exp_name=req.body.Exp_name;
var inc_name=req.body.Inc_name;
var date=today;
var month=req.body.month;
//------------------->
var newmanager=Manager({
 user:user,
 date:date,
 Inc_name:inc_name,
 Exp_name:exp_name,
 income:income,
 expense:expense,
 month:month

})
newmanager.save().then((data)=>console.log("Transiction addeed...."+data));
//------------------->
var exp=Expense({
 user:user,
 date:date,
 category:exp_name,
 expense:expense,
 month:month
})
exp.save().then((data)=>console.log("Expense addeed...."+data));
//------------------->
var inc=Income({
 user:user,
 date:date,
 category:inc_name,
 income:income,
 month:month
})
inc.save().then((data)=>console.log("Income addeed...."+data));

res.render('Transictions',{user:req.session.user,msg:'New Transiction created...',})
})
//-------------------------------------------------------
//#######################################################################
//           show all Transiction
app.get('/show-all-transictions',(req,res)=>{
  Manager.find({user:req.session.user},(err,result1)=>{
    if(err) throw err;
    else
    {
      Expense.find({user:req.session.user},(err,result2)=>{
        if(err) throw err;
        else
        {

            Income.find({user:req.session.user},(err,result3)=>{
              if(err) throw err;
              else
              res.render('show-all-transictions',{data2:result2,data1:result1,data3:result3,user:req.session.user})

      })
    }
  })
}
})
})

//-------------------------------------------------------
//#######################################################################
app.get('/add-income',(req,res)=>{
  var oldincome=req.query.oldincome;
  // for date
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();

today = dd + '/' + mm + '/' + yyyy;
//console.log(today);
res.render('add-income',{date:today,user:req.session.user,oldincome:oldincome})

})
//-------------------------------------------------------
//#######################################################################
//post banna hai add-Income

app.post('/add-income',(req,res)=>{
  var user=req.session.user;
  var date=req.body.date;
  var category=req.body.category;
  var month=req.body.month;
  var income=parseInt(req.body.amount);
  var oldincome=parseInt(req.body.oldincome);
  var newinc=Income({
    user:user,
    date:date,
    month:month,
    income:income,
    category:category,
  })
  newinc.save().then((data)=>console.log("data addeed...."+data));

 var newincome=oldincome+income;



//---------------------------------------
  Manager.update({user:req.session.user},{$set:{income:newincome}},(err,result)=>{
    if(err) throw err;
    else
    Manager.find({user:req.session.user},(err,result)=>{
      if(err) throw err;
      else
      res.render('dashboard',{user:req.session.user,msg:'Income Added...',data:result})

    })

  })

})
//##########################################################################################
//                                 for ADDING EXPENse
//#########################################################################################

//-------------------------------------------------------
//#######################################################################
app.get('/add-expense',(req,res)=>{
  var oldexpense=req.query.oldexpense;
  // for date
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();

today = dd + '/' + mm + '/' + yyyy;
//console.log(today);
res.render('add-expense',{date:today,user:req.session.user,oldexpense:oldexpense})

})
//-------------------------------------------------------
//#######################################################################
//post banna hai add-Income

app.post('/add-expense',(req,res)=>{
  var user=req.session.user;
  var date=req.body.date;
  var month=req.body.month;
  var category=req.body.category;
  var expense=parseInt(req.body.amount);
  var oldexpense=parseInt(req.body.oldexpense);
  var newexp=Expense({
    user:user,
    date:date,
    expense:expense,
    month:month,
    category:category,
  })
  newexp.save().then((data)=>console.log("data addeed...."+data));

 var newexpense=oldexpense+expense;



//---------------------------------------
  Manager.update({user:req.session.user},{$set:{expense:newexpense}},(err,result)=>{
    if(err) throw err;
    else
    Manager.find({user:req.session.user},(err,result)=>{
      if(err) throw err;
      else
      res.render('dashboard',{user:req.session.user,msg:'New Expense Added...',data:result})

    })

  })

})
//##########################################################################################
//          show all expense listen

app.get('/show-all-Expense',(req,res)=>{
Expense.find({user: req.session.user},(err,result)=>{
  // console.log(result);
  if (err) throw err;
  else {
    res.render('show-all-Expense',{user:req.session.user,data:result})
  }
})
})
//#########################################################################################

//##########################################################################################
//          show all income list

app.get('/show-all-Income',(req,res)=>{
Income.find({user: req.session.user},(err,result)=>{
  // console.log(result);
  if (err) throw err;
  else {
    res.render('show-all-Income',{user:req.session.user,data:result})
  }
})
})
//####################################################################################

//##########################################################################################
//          display Statics

app.get('/Statics',(req,res)=>{
Income.find({user: req.session.user},(err,income)=>{
  // console.log(result);
  if (err) throw err;
  else {
    Expense.find({user: req.session.user},(err,expense)=>{
      // console.log(result);
      if (err) throw err;
      else {
       res.render('Statics',{user:req.session.user,income:income,expense:expense})
      }
})
}
})
})
//####################################################################################
