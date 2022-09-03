require('dotenv').config()
const express = require('express')
const app = express();
const path = require('path')
const hbs = require('hbs')
const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const { hasSubscribers } = require('diagnostics_channel');
const cookieparser = require('cookie-parser')
const port = process.env.PORT || 8000

// requiring the model
const registerer = require('./model/struc')

// requireing the authentication function custom module that we've created
const authenticationfunc = require('../middleware/authenticationfunc')

require('./db/conn')

// setting the static files
const staticfilespath = path.join(__dirname,'../public')
app.use(express.static(staticfilespath))

// setting the view engine views directory path
const viewsfolderpath = path.join(__dirname,'../templates/views')
app.set('view engine', 'hbs' )
app.set('views',viewsfolderpath)

// setting the path of partials and registering it
const partialsfolderpath = path.join(__dirname,'../templates/partials')
hbs.registerPartials(partialsfolderpath);


// code to use json response
app.use(express.json())

// code to use form response
app.use(express.urlencoded())

//To use cookie-parser 
app.use(cookieparser())

app.get('/',(req,res)=>{
    res.status(200).render("register")
    // res.render("home",{
    //     name:"anmol"
    // })
})

app.get('/register' ,(req,res)=>{
    res.render('register')
})

app.get('/home',authenticationfunc,(req,res)=>{
    res.render('home')
})

app.get('/secret',authenticationfunc ,(req,res)=>{
    console.log(`This is Awesome Cookie :${req.cookies.jwt}`);
    res.render('secret')
})

app.get('/login',(req,res)=>{
    res.render('login')
})

app.get('/logout',authenticationfunc, async (req,res)=>{
    try {
        
        req.user.tockens = req.user.tockens.filter((currentelement) =>{
            return (currentelement.tocken != req.token)
        })
        res.clearCookie('jwt')
        
        // console.log(req.token);
        // console.log(req.user);
        await req.user.save();
        res.render('login')
    } catch (error) {
        console.log(error);
    }
})

app.get('/logoutall',authenticationfunc, async (req,res)=>{
    try {
        
        req.user.tockens = [];
        
        res.clearCookie('jwt')
        
        // console.log(req.token);
        // console.log(req.user);
        await req.user.save();
        res.render('login')
    } catch (error) {
        console.log(error);
    }
})

// app.get('/home',(req,res)=>{
//     res.render('home')
// })

app.post('/register',async(req,res)=>{
    try {
        // console.log(req.body);
        if (req.body.password===req.body.cpassword) {
            const newreg = new registerer(req.body)
            
            const gentoc = await newreg.genteratetocken();
            console.log(gentoc);

            res.cookie('jwt',gentoc,{
                expires:new Date(Date.now()+40000),
                httpOnly:true
            })
            
            const result = await newreg.save()
            console.log(result);
            res.status(201).render("login")
        } else {
            res.status(400).send("password is not same")
        }
    } catch (error) {
        res.status(400).send(error)
        console.log(error)
    }
})

app.post('/login',async(req,res)=>{
    try {
        const user = await registerer.findOne({email:req.body.email})
        const cornot = await bcrypt.compare(req.body.password,user.password)
        // console.log(user[0]);
        // console.log(req.body.password);
        // console.log(user[0].password);
        // console.log(req.body);
        
        if (!(user==undefined)) {
            if(cornot){
                const gentoc = await user.genteratetocken();
                console.log(gentoc);

                res.cookie('jwt',gentoc,{
                    expires:new Date(Date.now()+1000000),
                    httpOnly:true
                })
                // const genetocken = await user[0].genelogintocken();
                // console.log(genetocken);

                res.render('home',{
                    naam:user.name
                })
            }
            else{
                res.render('login',{
                    passwordwrong:"you've entered wrong password"
                })
            }
        }
        else{
            res.render('login',{
                emailwrong:"you've entered wrong email"
            })
        }
    } catch (error) {
        console.log(error);
    }
})

app.get('/',(req,res)=>{
    res.send("this is default page")
})

app.listen(port,()=>{
    console.log(`your site is running on http://127.0.0.1:${port}`);
})