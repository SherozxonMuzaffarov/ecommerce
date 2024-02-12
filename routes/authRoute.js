const express = require('express')
const { registerUser, loginUser, getAllUsers, getaUser, deleteaUser, updateaUser, blockUser, unblockUser, handleRefreshToken, logout } = require('../controller/userController')
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware')
const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/all-users', getAllUsers)
router.get('/refresh', handleRefreshToken)
router.get('/logout', logout)
router.get('/:id', authMiddleware, isAdmin, getaUser)
router.delete('/:id', deleteaUser)
router.put('/:id', authMiddleware, updateaUser)
router.put('/block-user/:id', authMiddleware, isAdmin, blockUser)
router.put('/unblock-user/:id', authMiddleware, isAdmin, unblockUser)

module.exports = router