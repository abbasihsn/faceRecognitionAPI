const express = require('express');
const signUp = require('./controller/signUp');
const joi = require('joi')
const bcrypt = require('bcrypt-nodejs');
const { restart } = require('nodemon');
const cors = require('cors');
const knex = require('knex')({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'postgres',
      password : '95300718',
      database : 'postgres'
    }
  });



const server = new express();
server.use(express.json());
server.use(cors());

var validUsers;
var loginInfo;
knex.select('*').from('users').then((resp)=>{
    validUsers=resp;
    console.log(validUsers)
});
knex.select('*').from('login').then((resp)=>{
    loginInfo=resp;
    console.log(loginInfo)
});



server.get('/userList', (req, res) => {
    knex.select('*').from('users').then((resp)=>{
        validUsers=resp;
        console.log(validUsers)
        res.json(validUsers);
    });
})

server.post('/user', (req, res) => {
    knex
    .select('*')
    .from('users')
    .where({
        email:req.body.email
    })
    .then(data=>{
        if(data.length>0){
            console.log(data);
            res.json(data[0]);
        } else {
            res.status(404).send("not found");
        }
    })
})

server.post('/signup', ((req, resp)=> signUp.handleRegister(req, resp, knex, bcrypt)))



server.post('/signin', (req, res) => {
    knex('users')
    .join('login', 'users.email', '=', 'users.email')
    .select('*')
    .then(data=>{
        const user = data.find(u=> (u.email==req.body.email));
        console.log(JSON.stringify(user), req.body);
        bcrypt.compare(req.body.password, user.hash, function (err, resp) {
            if(resp) {
                res.json(user);
            } else {
                res.status(400).json("wrong password");
            }
        });
    })
    .catch(err=>res.status(404).json(err))
})

server.put('/postImage', (req, res) => {
    knex('users')
        .returning('*')
        .where('id','=', req.body.id)
        .increment('entries',1)
        .then(response=>{
            if(response.length>0){
                res.send(response[0]);
            } else {
                res.status(404).send("not found");
            }
        })
        .catch(err=>res.status(400).json("bad request"));
})



server.listen(3000, () => {
    console.log("Listening to the port 3000")
})

findUserById = (id) => {
    return validUsers.find(u => u.id === id)
}

findUserByEmail = (email) => {
    return validUsers.find(u => u.email === email)
}


userInfoValidator = (body) => {
    var schema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().min(3).required(),
        name: joi.string()
    })

    const result = schema.validate(body);
    if (result.error) return result.error.details[0].message;
    return false;
}

// login
// sign up
// profile
// image -> put