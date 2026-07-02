const express = require('express')
const app = express()
const path = require('path')
const cors = require('cors')
const { connectDatabase } = require("./config/db.js")
const { employeemodel } = require('./models/employeemodel.js')
const { authmiddleware, isauthorized } = require('./authmiddleware/authmiddleware.js')
const { redisclient, connectredis } = require("./redis.js")
const {publishmessage}=require('./producer.js')
const {consumemessage} =require('./consumer.js')
const { assert } = require('console')
const { assertmodel } = require('./models/assertmodel.js')
app.set('view engine', 'pug')
app.use(express.static(path.join(__dirname, 'css')))
app.use(cors())
app.use(express.urlencoded({ extended: true }));
require("./association.js")
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
       const nearbyemployee = await redisclient.geoSearch(
            'employee-location',
            {
                longitude:"76.970279",
                latitude:"11.003457"
            },
            {
                radius:10,
                unit:'km'
            }
            
        )
        const distanceoftwoemps = await redisclient.geoDist(
            'employee-location',
            'e78a4fa8-8876-48ce-88a6-5d2498c22c0d',
            '74d3eb9b-990a-484c-916e-e6abccb5654e',
            'km'
            
        )
        console.log("The near by employee is "+nearbyemployee)
        console.log("The distance between them is "+distanceoftwoemps)
    }
    catch (err) {
        res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
})

app.post("/login", isauthorized, async (req, res) => {
    try
    {
        const userdata = req.body;
        await redisclient.set("sessiondata", JSON.stringify(userdata), {
            EX:180
        });
        res.redirect('/home')
    }
    catch (err) 
    {
        console.log(err);
        res.status(500).json({
            message: "Server error"
        });
    }
});


app.post('/add', authmiddleware, async (req, res) => {
    console.log(req.body.asserts)
    try {
        const employee = {
            empname: req.body.empname,
            empphone: req.body.empphone,
            empgender: req.body.empgender,
            empdateofbirth: new Date(req.body.empdateofbirth),
            empemail: req.body.empemail,
            status: "Inactive"
        }
        const empcreated = await employeemodel.create(employee)
        const employeeassert={
          empid:empcreated.empid,
          asserts:req.body.asserts
          
        }
        publishmessage(employeeassert)
        consumemessage()
        console.log("location"+req.body.currentlat+""+req.body.currentlng)
       const geolocationlength=await redisclient.geoAdd("employee-location",{
            longitude:req.body.currentlng,
            latitude:req.body.currentlat,
            member:empcreated.empid
        })
        
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

app.get('/assertdetail/:id',async(req,res)=>{
  try{
    const empassertdata = await assertmodel.findAll({
        where:{
           empid:req.params.id
        },
        attributes:['asserts'],
  include: 
    [
       {
       model: employeemodel,
       attributes:['empname']
       }
    ]
      });
      res.render('asserts',{employeeassertdata:empassertdata.length>0?empassertdata[0].dataValues:null})
    }
  catch(err)
  {
    console.log(err)
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
}
)

 connectredis()


app.listen(8000, () => {
    console.log("Server is running on port 8000")
}
)

