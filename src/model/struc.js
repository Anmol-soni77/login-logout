require('dotenv').config()
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt =  require('bcrypt')
const jwt = require('jsonwebtoken')

const registerSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    age:{
        type:Number,
        requiered:true,
        min:12
    },
    email:{
        type:String,
        validate(value){
            if (!validator.isEmail(value)) {
                throw new Error("This is invalid email")
            }
        },
        unique:true
    },
    password:{
        type:String
    },
    cpassword:{
        type:String
    },
    tockens:[{
        tocken:{
            type:String,
            required:true
        }
    }]
})

registerSchema.methods.genteratetocken = async function(){
    try {
        const tockenn = jwt.sign({_id:this._id.toString()}, 'myfathernameisrajendrekumarsonihewaslegend')
        // console.log(tockenn);
        this.tockens = this.tockens.concat({tocken:tockenn})
        // this.tockens[0].tocken = tockenn;
        await this.save();
        return tockenn;
    } catch (e) {
        console.log("brooo, "+e+"This erroe occured");
    }
}

registerSchema.pre('save',async function(next){  //here next is the next event i.e here it's save
    if (this.isModified('password')) {
        // console.log(this.password);
        const hashp = await bcrypt.hash(this.password,10);
        this.password = hashp;
        this.cpassword = undefined;
        // console.log(this.password);
        next();
    }
})


// registerSchema.methods.genelogintocken = async function(){
//     try {
//         const loginuser = await registerer.findById(this._id)
//         // console.log(loginuser);

//         const logintoken = jwt.sign({_id:this._id},"iamanmolsonimyfathernameisrajendrakumarsonialegend")
//         console.log(logintoken);


//         const utoken = loginuser.tockens.concat({ltoken:logintoken.toString()});
//         console.log(utoken);

//         const logintok = await registerer.findByIdAndUpdate(this._id,{tockens:utoken})

//         return "login token created"
//     } catch (e) {
//         console.log(e);
//     }
// }

const registerer = new mongoose.model('registerer',registerSchema)

module.exports = registerer;