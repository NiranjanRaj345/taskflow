const express = require('express');
const router = express.Router();
const teamController = require('../controllers/TeamController');
const { auth } = require('../middleware/auth');
const validationMiddleware = require('../middleware/validation');

router.use(auth);

router.post('/', validationMiddleware.schemas.createTeam, teamController.createTeam);
router.get('/', teamController.getAllTeams);
router.get('/my', teamController.getUserTeams);
router.get('/:id', teamController.getTeamById);
router.put('/:id', validationMiddleware.schemas.updateTeam, teamController.updateTeam);
router.delete('/:id', teamController.deleteTeam);
router.post('/:id/join', teamController.joinTeam);
router.post('/:id/leave', teamController.leaveTeam);
router.post('/:id/members', validationMiddleware.schemas.addMember, teamController.addMember);
router.delete('/:id/members', validationMiddleware.schemas.removeMember, teamController.removeMember);

module.exports = router;
