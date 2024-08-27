const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require("express");
const app = express();
const {v4:uuidv4}=require("uuid");

const methodOverride = require("method-override");
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
const path = require("path");
app.set("views", path.join(__dirname, "/views"));

// Create the connection to database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'delta_app',
    password: '#kris143k',
});

let getRandomUser = () => {
    return [
        faker.string.uuid(),
        faker.internet.userName(),
        faker.internet.email(),
        //avatar: faker.image.avatar(),
        faker.internet.password(),
        //birthdate: faker.date.birthdate(),
        //registeredAt: faker.date.past(),
    ];
};


//let q="SHOW TABLES";
// let q="INSERT INTO user (id,username,email,password) values ?";
// // let users=[
// //     ["123a","123_krisa","keisa@gmail.com","abs1"],
// //     ["123b","123_krisb","keisb@gmail.com","abs2"]
// // ];
// let data=[];
// for(let i=1;i<=100;i++){
//     data.push(getRandomUser());
// }
// try{
//     connection.query(q,[data], (err,result)=>{
//         if(err) throw err;
//         console.log(result);
//     });
// }catch(err){
//     console.log(err);
// }
// connection.end();

app.get("/", (req, res) => {
    //res.send("welcome to homepage");
    let q = `SELECT count(*) FROM user`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let count = result[0]["count(*)"];
            res.render("home.ejs", { count });
        });
    } catch (err) {
        res.send("some error occurred");
    }
})
app.get("/user", (req, res) => {
    let q = `SELECT id,username,email FROM user`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let users = result;
            res.render("user.ejs", { users });
        });
    } catch (err) {
        res.send("some error occured");
    }
})
//edit
app.get("/user/:id/edit", (req, res) => {
    let { id } = req.params;
    let q = `SELECT * from user where id='${id}'`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let user = result[0];
            res.render("edit.ejs", { user });
        });
    } catch (err) {
        res.send("some error occured");
    }
})
//update
app.patch("/user/:id", (req, res) => {
    let { id } = req.params;
    let { username: newUsername, password: formPass } = req.body;
    let q = `SELECT * from user where id='${id}'`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let user = result[0];
            if (formPass != user.password) {
                res.send("Wrong Password.");
            } else {
                let q2 = `UPDATE user SET username='${newUsername}' where id='${id}'`;
                try {
                    connection.query(q2, (err, result) => {
                        if (err) throw err;
                        res.redirect("/user");
                    });
                } catch (err) {
                    res.send("some error occured");
                }
            }
        });
    } catch (err) {
        res.send("some error occured");
    }
})
app.get("/new", (req, res) => {
    res.render("new.ejs");
  });
  
app.post("/new", (req, res) => {
    let { username, email, password } = req.body;
    let id = uuidv4();
    //Query to Insert New User
    let q = `INSERT INTO user (id, username, email, password) VALUES ('${id}','${username}','${email}','${password}') `;
  
    try {
      connection.query(q, (err, result) => {
        if (err) throw err;
        console.log("added new user");
        res.redirect("/user");
      });
    } catch (err) {
      res.send("some error occurred");
    }
  });
  
  app.get("/user/:id/delete", (req, res) => {
    let { id } = req.params;
    let q = `SELECT * FROM user WHERE id='${id}'`;
  
    try {
      connection.query(q, (err, result) => {
        if (err) throw err;
        let user = result[0];
        res.render("delete.ejs", { user });
      });
    } catch (err) {
      res.send("some error with DB");
    }
  });
  
  app.delete("/user/:id/", (req, res) => {
    let { id } = req.params;
    let { password } = req.body;
    let q = `SELECT * FROM user WHERE id='${id}'`;
  
    try {
      connection.query(q, (err, result) => {
        if (err) throw err;
        let user = result[0];
  
        if (user.password != password) {
          res.send("WRONG Password entered!");
        } else {
          let q2 = `DELETE FROM user WHERE id='${id}'`; //Query to Delete
          connection.query(q2, (err, result) => {
            if (err) throw err;
            else {
              console.log(result);
              console.log("deleted!");
              res.redirect("/user");
            }
          });
        }
      });
    } catch (err) {
      res.send("some error with DB");
    }
  });
  
app.listen("8080", () => {
    console.log("server is listening");
})