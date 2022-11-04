const express = require("express");
const app = express();
const db = require("./database");
const bodyParser = require("body-parser");
const md5 = require("md5");


const PORT = 8000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`)
});

app.get("/", (req, res, next) => {
    res.status(200).json({
        "message": "Ok"
    })
});

app.get("/api/users", (req, res, next) => {
    const sql = "select * from user";
    let params = [];

    db.all(sql, params, (err, rows) => {
        if(err) {
            res.status(400).json({
                "error": err.message
            });
            return;
        }

        res.status(200).json({
            "message": "success",
            "data" : rows
        })
    });
});

app.post("/api/user/", (req, res, next) => {
    let errors=[]
    if (!req.body.password){
        errors.push("No password specified");
    }
    if (!req.body.email){
        errors.push("No email specified");
    }
    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    let data = {
        name: req.body.name,
        email: req.body.email,
        password : md5(req.body.password)
    }
    var sql ='INSERT INTO user (name, email, password) VALUES (?,?,?)'
    var params =[data.name, data.email, data.password]
    db.run(sql, params, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        res.json({
            "message": "success",
            "data": data,
            "id" : this.lastID
        })
    });
})



app.use( (req, res) => {
    res.status(404).json({
        "error": "does not exist"
    });
});