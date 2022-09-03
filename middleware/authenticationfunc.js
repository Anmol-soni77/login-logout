const jwt = require("jsonwebtoken");
const registerer = require('../src/model/struc')

async function authenticationfunc (req,res,next){
    try {
        const token = req.cookies.jwt;
        const verifytoken = jwt.verify(token,'myfathernameisrajendrekumarsonihewaslegend') 
        console.log(verifytoken);

        const userr = await registerer.findOne({_id:verifytoken._id})
        console.log(userr);


        req.user = userr
        req.token = token
        next()
    } catch (e) {
        res.send(e)
        console.log(e);
    }
}

module.exports = authenticationfunc;