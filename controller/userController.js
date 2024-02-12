const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')
const generateToken = require('../config/jwtToken')
const { validateMongoDbId } = require('../utils/validateMongoDbId')
const generateRefreshToken = require('../config/refreshToken')
const jwt = require('jsonwebtoken')

generateRefreshToken
// register a user
const registerUser = asyncHandler(async(req, res) => {
    try {
        const findUser = await User.findOne({email: req.body.email})

        if(!findUser) {
            // Create a new user
            const newUser = await User.create(req.body)
            res.json(newUser)
        } else {
            throw new Error('User Already Exists')
        }
    } catch (error) {
        console.log(error.message);
    }
})

// login a user
const loginUser = asyncHandler(async(req, res) => {
    try {
        const {email, password} = req.body
        const findUser = await User.findOne({email: email})
        // Check if user exists or not
        if(findUser && await findUser.isPasswordMatched(password)) {
            const refreshToken = generateRefreshToken(findUser?._id)
            const updatedUser = await User.findByIdAndUpdate(findUser?.id, {
                refreshToken: refreshToken
            },
            {
                new: true    
            })

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                maxAge: 72*60*60*1000
            })
            res.json({
                _id: findUser?._id,
                firstname: findUser?.firstname,
                lastname: findUser?.lastname,
                mobile: findUser?.mobile,
                email: findUser?.email,
                role: findUser?.role,
                token: generateToken(findUser?._id)
            })
        } else {
            throw new Error('Invalid Credentials')
        }
    } catch (error) {
        console.log(error.message);
    }
})

// handle refresh token
const handleRefreshToken = asyncHandler(async(req, res) => {
    const cookie = req.cookies
    if (!cookie?.refreshToken) throw new Error("No Refresh token in cookies")
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({refreshToken})
    if (!user) throw new Error("No Refresh token in DB or not matched")
    jwt.verify(refreshToken, process.env.JWT_SECRET, (error, decoded) => {
        if(error || decoded.id !== user.id) 
            throw new Error("There is something wrong with refresh token")
        const accessToken = generateToken(user.id);
        res.json({ accessToken})
    })
    res.json(user)
})

// logout
const logout = asyncHandler(async(req, res) => {
    const cookie = req.cookies
    if (!cookie?.refreshToken) throw new Error("No Refresh token in cookies")
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({refreshToken})
    if(!user){
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true
        })
        return res.sendStatus(204) //forbidden
    }

    await User.findOneAndUpdate({refreshToken}, {
        refreshToken: ""
    })
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true
    })
    res.sendStatus(204) //forbidden
})

// get all users
const getAllUsers = asyncHandler( async(req, res) => {
    try {
        const getUsers = await User.find();
        res.json(getUsers);
    } catch (error) {
        throw new Error(error)
    }
})

// get a single user
const getaUser = asyncHandler(async(req, res) => {
    const { id } = req.params
    validateMongoDbId(id)
    try {
        const user = await User.findById(id)
        res.json({user})
    } catch (error) {
        throw new Error(error)
    }
})

// delete a user
const deleteaUser = asyncHandler(async(req, res) => {
    const { id } = req.params 
    validateMongoDbId(id)
    try {
        const deletedUser = await User.findByIdAndDelete(id)
        res.json({deletedUser})
    } catch (error) {
        throw new Error(error)
    }
})

// update a user
const updateaUser = asyncHandler(async(req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id)
    try {
        const updatedUser = await User.findByIdAndUpdate(_id, {
                firstname: req?.body?.firstname,
                lastname: req?.body?.lastname,
                email: req?.body?.email,
                mobile: req?.body?.mobile
            },
            {
                new: true
            }
        )
        res.json(updatedUser)
    } catch (error) {
        throw new Error(error)
    }
})

// block a user
const blockUser = asyncHandler(async(req, res) => {
    const { id } = req.params
    validateMongoDbId(id)
    const block = await User.findByIdAndUpdate(id, {
        isBlocked: true
    },
    {
        new: true
    })
    res.json({
        message: "User is blocked"
    })
})
// unblock a user
const unblockUser = asyncHandler(async(req, res) => {
    const { id } = req.params
    validateMongoDbId(id)
    const unblock = await User.findByIdAndUpdate(id, {
        isBlocked: false
    },
    {
        new: true
    })
    res.json({
        message: "User is unblocked"
    })
})

module.exports = { 
    registerUser, 
    loginUser, 
    getAllUsers, 
    getaUser, 
    deleteaUser, 
    updateaUser,
    blockUser,
    unblockUser,
    handleRefreshToken,
    logout
}