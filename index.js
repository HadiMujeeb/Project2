
const mongoose =require("mongoose");

require("dotenv").config();
mongoose.connect(process.env.MONGO_URL );




const path=require("path")
const nocache =  require("nocache")
const express =require("express");
const app=express();
const flash = require("express-flash");
const session = require("express-session");

// app.use(nocache());
// app.use((req, res, next) => {
//     res.setHeader('Cache-Control',' private,no-cache, no-store, must-revalidate');
//     res.setHeader('Pragma', 'no-cache');
//     res.setHeader('Expires', '-1');
//     next();
// });
app.use(
    session({
        secret:"key",
        resave:true,
        saveUninitialized:true,
    })
);



app.use(nocache());
app.use(flash());



//public css
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,"public/user")));
app.use(express.static(path.join(__dirname,"public/admin")));
// app.use(express.static(path.join(__dirname, 'public/order')));
app.use(express.static(path.join(__dirname, 'public')));


const user_router = require("./Routes/user");
app.use("/",user_router);

const admin_router = require("./Routes/admin");
app.use("/",admin_router)




const PORT =11000;
app.listen(PORT,()=>{
    console.log(` server is running  on http://localhost:${PORT}`);
    console.log(` server is running  on http://localhost:${PORT}/admin`);
});