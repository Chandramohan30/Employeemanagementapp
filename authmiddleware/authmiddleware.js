const { redisclient, connectredis } = require("../redis")
const { employeemodel } = require('../models/employeemodel.js')
const authmiddleware = async (req, res, next) => {
    try {

        const sessionData = await redisclient.get("sessiondata")
        console.log(sessionData)
        if (!sessionData) {
            console.log("SESSION EXPIRED")
            return res.redirect('/?expired=true')
        }

        next()
    }
    catch (err) {
        console.log(err)
    }
}
const isauthorized = async (req, res, next) => {

    try {

        const empfound = await employeemodel.findOne({
            where: {
                empname: req.body.empname
            }
        });

        console.log(empfound);

        if (!empfound) {
            return res.redirect("/?notauthorized=true");
        }

        next();

    } catch (err) {
        console.log(err);
        return res.status(500).send("Server error");
    }
};
module.exports = {
    authmiddleware,
    isauthorized
}