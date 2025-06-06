const db = require("../models");
const User = db.user;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv/config");

// exports.signup = (req, res) => {
//     res.send("signUp");
// }

exports.signin = (req, res) => {
    console.log("signin");
    const { email, password } = req.body;
    console.log(email, password);

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = regex.test(email);
    if (!isValid) {
        return res.status(400).json({ message: "Invalid email address" });
    }

    User.findOne({
        where: {
            email: email
        }
    }).then(user => {
        if (!user) {
            return res.status(404).json({
                message: "Email not found."
            });
        }

        let passwordIsValid = bcrypt.compareSync(password, user.password);

        if (!passwordIsValid) {
            return res.status(401).json({
                message: "Invalid Password."
            });
        }

        const token = jwt.sign(
            { id: user.id, aa: '3434' },
            process.env.SECRET_KEY,
            {
                algorithm: 'HS256',
                expiresIn: '1d'
            }
        );

        let authorities = [];
        user.getRoles()
            .then(roles => {
                for (let i = 0; i < roles.length; i++) {
                    authorities.push("ROLE_" + roles[i].name.toUpperCase());
                }

                return res.status(200).json({
                    id: user.id,
                    name: user.name,
                    lastname: user.lastname,
                    email: user.email,
                    roles: authorities,
                    accessToken: token
                });
            }).catch(err => {
                return res.status(500).json({ message: err.message });
            });

    }).catch(err => {
        return res.status(500).json({ message: err.message });
    });
};



exports.hashPassword = (req, res) => {
    const { password } = req.body;
    if (!password) {
        return res.status(400).json({ message: "Password is required" });
    }

    const hashed = bcrypt.hashSync(password, 8);
    res.status(200).json({ hashed });
};
