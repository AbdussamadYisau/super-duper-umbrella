const express = require("express");
const app = express();
const db = require("./database");
const bodyParser = require("body-parser");
const md5 = require("md5");
const jwt = require("jsonwebtoken");
require("dotenv/config");
const cors = require("cors");

const PORT = 8000;

const generateJwtToken = (_id, username, email) => {
    return jwt.sign(
      { _id, username, email },
      process.env.JWT_SECRET_TOKEN_SECRET,
      {
        expiresIn: "1d",
      }
    );
  };

// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

// Body Parser
app.use(express.json());

// Middlewares
app.use(cors());

app.listen(process.env.PORT || PORT, () => {
    console.log(`Server running on port: ${process.env.PORT || PORT}`)
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
        const token = generateJwtToken(this.lastID, data.name, data.email);
        return res.status(200).json({
            message: "Signed up successfully",
            token,
            data: {
                id: this.lastID,
                name: data.name,
                email: data.email
            },
            
        })
    });
})

app.post("/api/login", (req, res, next) => {
    let errors = [];
    const {email, password} = req.body;

    if (!email) {
        errors.push("No email specified");
    }

    if (!password) {
        errors.push("No password specified");
    }

    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }

    var sql = `select * from user where email= '${email}' and password='${md5(password)}'`;

    db.all(sql, (err, rows) => {
        if(err) {
            throw err;
        }

        if (rows.length > 0) {
            const {id, name, email} = rows[0];
            const token = generateJwtToken(id, name, email)
            return res.status(200).json({
                message: "Logged in successfully",
                token,
                data: {
                    id, 
                    name,
                    email
                }
            })
        } else {
            res.status(400).json({
                status: "Success",
                message: "No user with these login details",
            })
        }
    })
})


app.use((req, res) => {
    res.status(404).json({
        "error": "The resource you are looking for does not exist"
    });
});