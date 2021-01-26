const express = require('express')
const router = express.Router()
const User = require('../models/User')
const auth = require('../middlewares/auth')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


router.get('/auth', auth, (req, res) => {
    res.json({
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        success: true
    })
})


router.post('/signup', async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10)
        const hashedPw = await bcrypt.hash(req.body.password, salt)
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPw
        })
        await user.save()
        const token = await jwt.sign({ _id: user._id }, process.env.secret)
        res.header("Authorization", token).status(201).json({
            sucess: true,
            user,
            token: token
        })
    }
    catch (err) {
        res.status(404).json({ sucess: false, err })
    }
})

router.post('/signin', async(req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username })
        const match = await bcrypt.compare(req.body.password, user.password)
        if (match) {
            const token = await jwt.sign({ _id: user._id }, process.env.secret)
            res.header('Authorization', token).status(201).json({
                success: true,
                token,
                user
            })
        }
    } catch (err) {
        res.status(404).json({ success: false, err })
    }
})



module.exports = router

