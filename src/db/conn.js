const mongoose = require('mongoose')

mongoose.connect(`mongodb://localhost:27017/${process.env.DBNAME}`)
.then(()=>{
    console.log("connected successfully");
})
.catch((e)=>{           
    console.log(e);
})