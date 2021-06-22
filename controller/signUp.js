const handleRegister = (req, res, knex, bcrypt) => {
    if(req.body.name){
        knex.transaction((db) =>{
            bcrypt.hash(req.body.password, null, null, function (err, hash) {
                db('login').insert({
                    email: req.body.email, 
                    hash: hash
                    }).then(console.log);
            });
            res.status(200);
            db('users')
            .returning('*')
            .insert({
                email: req.body.email, 
                name: req.body.name,
                joined: new Date()
            })
            .then(response=> res.json(response[0]))
            .then(db.commit)        
            .catch(err=> res.status(400).json("something went wrong"));
        });
    } else {
        res.status(400).send("bad request");
    }
}

module.exports = {
    handleRegister:handleRegister
}