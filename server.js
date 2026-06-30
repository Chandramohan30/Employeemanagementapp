const express = require('express')
const app = express()
const path = require('path')
const cors = require('cors')
const { sequelize, connectDatabase } = require("./config/db.js")
const { employeemodel } = require('./models/employeemodel.js')
app.set('view engine', 'pug')
app.use(express.static(path.join(__dirname, 'css')))
app.use(cors())
app.use(express.urlencoded({ extended: true }));

connectDatabase()
app.get('/', async (req, res) => {
    try {
        const employeelist = await employeemodel.findAll()
        res.render('list', {
            employeedata: employeelist.map(emp => emp.dataValues)
        })

    }
    catch (err) {
        res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
})

app.post('/add', async (req, res) => {
    console.log(req.body)
    try {
        const employee = {
            empname: req.body.empname,
            empphone: req.body.empphone,
            empgender: req.body.empgender,
            empdateofbirth:new Date(req.body.empdateofbirth),
            empemail:req.body.empemail,
            status:"Inactive"
        }
        const result = await employeemodel.create(employee)
        res.redirect('/')
    }
    catch (err) {
        res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
})

app.get('/createemployee', async (req, res) => {
    res.render('form')
})

app.get('/edit/:id', async (req, res) => {
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
app.get('/delete/:id', async (req, res) => {
    try {
        const employee = await employeemodel.findByPk(req.params.id)
        if (!employee) {
            return res.status(404).json({
                message: "Employee not found"
            });

        }
        await employee.destroy(req.params.id)
        res.redirect("/")

    }
    catch (err) {
        res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
})

app.post('/update/:id', async (req, res) => {
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
        employee.empgender=req.body.empgender;
        employee.empdateofbirth=req.body.empdateofbirth;
        employee.status = req.body.status;
        await employee.save();
        res.redirect("/")
    } 
    catch (err) {
        res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
});

app.get('/back', async (req, res) => {
    res.redirect("/")
})

app.listen(8000, () => {
    console.log("Server is running on port 8000")
})

