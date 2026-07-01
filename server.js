const express = require('express')
const app = express()
const path = require('path')
const cors = require('cors')
const { sequelize, connectDatabase } = require("./config/db.js")
const { employeemodel } = require('./models/employeemodel.js')
const { authmiddleware, isauthorized } = require('./authmiddleware/authmiddleware.js')
const { redisclient, connectredis } = require("./redis.js")
const {publishmessage}=require('./producer.js')
const {consumemessage} =require('./consumer.js')
app.set('view engine', 'pug')
app.use(express.static(path.join(__dirname, 'css')))
app.use(cors())
app.use(express.urlencoded({ extended: true }));

connectDatabase()
app.get('/', async (req, res) => {
    try {
        res.render('login', {
            expired: req.query.expired,
            notauthorized: req.query.notauthorized
        })
    }
    catch (err) {
        res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }

})
app.get('/home', authmiddleware, async (req, res) => {
    try {

        const employeelist = await employeemodel.findAll()
        res.render('list', {
            employeedata: employeelist.map(emp => emp.dataValues),

        })
    }
    catch (err) {
        res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
})

app.post("/login", isauthorized, async (req, res) => {
    try {
        const userdata = req.body;
        await redisclient.set("sessiondata", JSON.stringify(userdata), {
            EX: 180
        });
        res.redirect('/home')
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Something went wrong"
        });
    }
});


app.post('/add', authmiddleware, async (req, res) => {
    console.log(req.body)
    try {
        const employee = {
            empname: req.body.empname,
            empphone: req.body.empphone,
            empgender: req.body.empgender,
            empdateofbirth: new Date(req.body.empdateofbirth),
            empemail: req.body.empemail,
            status: "Inactive"
        }
        const result = await employeemodel.create(employee)
        res.redirect('/home')
    }
    catch (err) {
        res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
})

app.get('/createemployee', authmiddleware, async (req, res) => {
    res.render('form')
})

app.get('/edit/:id', authmiddleware, async (req, res) => {
    try {
        const employee = await employeemodel.findByPk(req.params.id)
        res.render('form', { employee: employee })
    }
    catch (err) {
        res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }

})
app.get('/delete/:id', authmiddleware, async (req, res) => {
    try {
        const employee = await employeemodel.findByPk(req.params.id)
        if (!employee) {
            return res.status(404).json({
                message: "Employee not found"
            });

        }
        await employee.destroy(req.params.id)
        res.redirect("/home")

    }
    catch (err) {
        res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
})

app.post('/update/:id', authmiddleware, async (req, res) => {
    try {
        const employee = await employeemodel.findByPk(req.params.id);

        if (!employee) {
            return res.status(404).json({
                message: " Employee not found"
            });
        }

        employee.empname = req.body.empname;
        employee.empphone = req.body.empphone;
        employee.empemail = req.body.empemail;
        employee.empgender = req.body.empgender;
        employee.empdateofbirth = req.body.empdateofbirth;
        employee.status = req.body.status;
        await employee.save();
        res.redirect("/home")
    }
    catch (err) {
        res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
});

app.get('/back', authmiddleware, async (req, res) => {
    res.redirect("/")
})

connectredis()
//calling the producer function for data publish in queue
publishmessage()
//calling the consumer function for data fetching from queue
consumemessage()

app.listen(8000, () => {
    console.log("Server is running on port 8000")
})

