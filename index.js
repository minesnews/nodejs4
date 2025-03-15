const express = require("express");
const fs = require("fs");
const path = require("path");
const joi = require("joi");

const app = express();
const pathToBD = path.join(__dirname, 'users.json');

const userSchema = joi.object({
    firstName: joi.string().min(1).required(),
    lastName: joi.string().min(1).required(),
    city: joi.string().min(1),
    age: joi.number().min(0).max(150).required(),
});

app.use(express.json());

app.get("/users", (req, res) => {
    try {
        res.send(JSON.parse(fs.readFileSync(pathToBD)));
    } catch (err) {
        console.error(err);
        res.status(500).send({ err: "База данны не найдена!" })
    }
});


app.get("/users/:id", (req, res) => {
    try {
        const users = JSON.parse(fs.readFileSync(pathToBD));
        const userId = +req.params.id;
        const user = users.find(user => user.id === userId);
        if (user) {
            res.send({ user });
        } else {
            res.status(404).send({ user: null });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ err: "Пользователь не найден!" })
    }
});

app.post("/users", (req, res) => {
    try {
        const users = JSON.parse(fs.readFileSync(pathToBD));
        const uniqueID = users.length + 1;
        const newUser = { id: uniqueID, ...req.body };
        users.push(newUser);
        fs.writeFileSync(pathToBD, JSON.stringify(users, null, 2));
        res.send({ id: uniqueID });
    } catch (err) {
        console.error(err);
        res.status(500).send({ err: "Не удалось записать данные!" })
    }
});

app.put("/users/:id", (req, res) => {
    try {
        const result = userSchema.validate(req.body);
        if (result.error) {
            res.status(400).send({ error: result.error.details });
        }

        const userId = +req.params.id;
        let users = JSON.parse(fs.readFileSync(pathToBD));
        const user = users.find(user => user.id === userId);
        if (user) {
            const userIndex = users.indexOf(user);
            const { firstName, lastName, city, age } = req.body;
            users[userIndex] = {...users[userIndex], firstName, lastName, city, age };
            fs.writeFileSync(pathToBD, JSON.stringify(users, null, 2));
            res.send({ user: users[userIndex] });
        } else {
            res.status(404).send({ user: null });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ err: "Пользователь не изменён!" });
    }
});


app.delete("/users/:id", (req, res) => {
    try {
        const userId = +req.params.id;
        let users = JSON.parse(fs.readFileSync(pathToBD));
        const user = users.find(user => user.id === userId);
        if (user) {
            const userIndex = users.indexOf(user);
            const delUser = users.splice(userIndex, 1);
            fs.writeFileSync(pathToBD, JSON.stringify(users, null, 2));
            res.send({ user: delUser });
        } else {
            res.status(404).send({ user: null });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ err: "Пользователь не удален!" })
    }
});





app.use(function(req, res, next) {
    res.status(404).send("Страницы не существует. Код 404");
});

app.listen(3000, function() {
    console.log("Сервер запущен: http://localhost:3000")
});