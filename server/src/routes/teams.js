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
router.post('/:id/request-join', teamController.joinTeam);
router.post('/:id/approve', teamController.approveJoinRequest);
router.post('/:id/reject', teamController.rejectJoinRequest);
router.get('/:id/requests', teamController.getJoinRequests);
router.post('/:id/invite', teamController.generateInvitationLink);
router.post('/invite/:token/accept', teamController.acceptInvitation);
router.post('/:id/members', validationMiddleware.schemas.addMember, teamController.addMember);
router.delete('/:id/members', validationMiddleware.schemas.removeMember, teamController.removeMember);

module.exports = router;
