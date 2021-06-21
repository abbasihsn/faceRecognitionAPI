const express = require('express');
const joi = require('joi')
const bcrypt = require('bcrypt-nodejs');
const { restart } = require('nodemon');


const server = new express();
server.use(express.json());
server.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var validUsers = [
    {
        id: 1,
        email: 'abbasi_ha@yahoo.com',
        password: '1234',
        name: "John",
        score: 50,
        joinDate: new Date()
    },
    {
        id: 2,
        email: 'abbasii_ha@yahoo.com',
        password: '12345',
        name: "John",
        score: 50,
        joinDate: new Date()
    },
    {
        id: 3,
        email: 'abbasi1_ha@yahoo.com',
        password: '123',
        name: "John",
        score: 50,
        joinDate: new Date()
    }
]


server.get('/userList', (req, res) => {
    res.send(validUsers)
})

server.post('/user', (req, res) => {
    if (findUserByEmail(req.body.email)) {
        res.send(findUserByEmail(req.body.email))
    } else {
        res.status(404)
        res.send("not found")
    }

})

server.post('/signup', (req, res) => {
    const err = userInfoValidator(req.body);
    if (!err) {
        if (findUserByEmail(req.body.email)) {
            res.status(400);
            return res.send("already exist")
        } else {
            bcrypt.hash(req.body.password, null, null, function (err, hash) {
                console.log(hash);
            });

            // Load hash from your password DB.
            bcrypt.compare(req.body.password, '$2a$10$p2WASUz/zINmJ4Kg.GXnDebXwXNJAkewQqXnX3gKcNDoYCU7Tq95m', function (err, res) {
                console.log(res);
            });
            bcrypt.compare("veggies", '$2a$10$p2WASUz/zINmJ4Kg.GXnDebXwXNJAkewQqXnX3gKcNDoYCU7Tq95m', function (err, res) {
                console.log(res);
            });
            const user = req.body;
            user.id = validUsers.length + 1;
            user.joinDate = new Date();
            user.score = 0;
            validUsers.push(user);
            res.status(200);
            return res.send(user)
        }
    } else {
        return res.send(err)
    }
})



server.post('/signin', (req, res) => {
    const err = userInfoValidator(req.body);
    if (!err) {
        if (checkUserInfo(req.body.email, req.body.password)) {
            res.status(200);
            return res.send(findUserByEmail(JSON.stringify(req.body.email)))
        } else {
            res.status(404);
            return res.send({ "result": "not found" })
        }
    } else {
        res.status(400)
        return res.send({ "result": err })
    }
})

server.post('/postImage', (req, res) => {
    const user = findUserById(req.body.id);
    if (user) {
        user.score++;
        res.send(user)
    } else {
        res.status(404)
        res.send("user not found")
    }
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

checkUserInfo = (email, password) => {
    const user = validUsers.find(u => (u.email === email && u.password === password));

    if (user) return true;
    else return false;
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