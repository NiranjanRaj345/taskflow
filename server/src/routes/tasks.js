const express = require('express');
const router = express.Router();
const taskController = require('../controllers/TaskController');
const { auth } = require('../middleware/auth');
const validationMiddleware = require('../middleware/validation');

router.use(auth);

router.post('/', validationMiddleware.schemas.createTask, taskController.createTask);
router.get('/', taskController.getTasks);
router.get('/user', taskController.getUserTasks);
router.get('/team/:teamId', taskController.getTeamTasks);
router.get('/stats/:teamId', taskController.getTaskStats);
router.get('/:id', taskController.getTaskById);
router.put('/:id', validationMiddleware.schemas.updateTask, taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
