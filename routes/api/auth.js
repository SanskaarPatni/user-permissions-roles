const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const config = require('config');
const jwt = require('jsonwebtoken');
const auth = require('../../middleware/auth');

//import User model
const User = require('../../models/User');

//requests at /api/auth
router.post('/', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            msg: 'Please enter all fields'
        });
    }
    User.findOne({ email })
        .then(user => {
            if (!user) {
                return res.status(400).json({ msg: "User does not exist" });
            }

            //Validate password
            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });
                    jwt.sign(
                        //first parameter is the payload
                        { id: user.id },
                        config.get('jwtSecret'),
                        { expiresIn: 3600 },
                        (err, token) => {
                            if (err) throw err;
                            res.json({
                                token,
                                user: {
                                    id: user.id,
                                    name: user.name,
                                    email: user.email,
                                    role: user.role
                                }
                            });

                        }
                    )
                })

        });
});

router.get('/user', auth, (req, res) => {
    User.findById(req.user.id)
        .select('-password')
        .then(user => res.json(user))
})


module.exports = router;