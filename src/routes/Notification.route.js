const express = require('express')

const router = express.Router()

const NotficiationController = require('../controllers/Notification.controller')
const { authenticate} = require('../middlewares/auth.middleware')

router.use(authenticate)
router.patch('/mark-read/:notification_id' , NotficiationController.markAsRead)
router.post('/' , NotficiationController.createNotification);
router.get('/all' , NotficiationController.getAllNotifications);
router.get('/' , NotficiationController.getNotificationsByUserId)
router.delete('/' , NotficiationController.deleteAllRecords)
router.delete('/:notification_id' , NotficiationController.deleteRecord)




module.exports = router;
