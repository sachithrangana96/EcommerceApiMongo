const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');
// const authJwt = require('./helpers/jwt');
const { expressjwt: jwt } = require("express-jwt");
// const errorHandler = require('./helpers/error-handler');

app.use(cors());
app.options('*', cors())

//middleware
// app.use(bodyParser.json());
app.use(express.json());
app.use(morgan('tiny'));
// app.use(authJwt);
// app.use(errorHandler);
app.use(
    jwt({
      secret: process.env.SECRET,
      algorithms: ["HS256"],
    })
    .unless({
      path:[
        
        {url:/\/api\/v1\/users\/login/, methods:['POST'] },
        {url:/\/api\/v1\/users/, methods:['POST'] },
        {url:/\/api\/v1\/products(.*)/, methods:['GET','OPTIONS']},
        {url:/\/api\/v1\/categories(.*)/, methods:['GET','OPTIONS'] },
      ]
    })
);

// function isRevoked(req,payload,done){
 
//   let test = payload
//   console.log("nxkanak",test[0])
//   if(!test.isAdmin){
//     console.log("nxkanak",test.userId)
//       done(null,true)
//   }

//   done();
// }

  
app.use((err,req,res,next)=>{
    if(err.name==='UnauthorizedError'){
     return res.status(401).json({message:'The User is not Authorized!.'})
    }
    if(err.name==='ValidationError'){
      return res.status(401).json({message:err})
    }
    return res.status(500).json(err);

});


//Routes
const categoriesRoutes = require('./routers/categories');
const productsRoutes = require('./routers/products');
const usersRoutes = require('./routers/users');
const ordersRoutes = require('./routers/orders');

const api = process.env.API_URL;

app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);

//Database
mongoose.connect(process.env.CONNECTION_STRING)
.then(()=>{
    console.log('Database Connection is ready...',api)
})
.catch((err)=> {
    console.log(err);
})

//Server
app.listen(3000, ()=>{

    console.log('server is running http://localhost:3000');
})