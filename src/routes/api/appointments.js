const express = require('express');
const router = express.Router();
const AppointmentController = require('../../controllers/appointmentController');
const { validateAppointment } = require('../../middlewares/appointmentValidation');
const {authenticateUser} = require('../../middlewares/auth');

// Create new appointment
router.post('/', authenticateUser, validateAppointment, AppointmentController.createAppointment);

// Get customer's appointments
router.get('/customer/:customerId', authenticateUser, AppointmentController.getCustomerAppointments);

// Get agent's appointments
router.get('/agent/:agentId', authenticateUser, AppointmentController.getAgentAppointments);

// Update appointment status
router.put('/:appointmentId/status', authenticateUser, AppointmentController.updateAppointmentStatus);

module.exports = router;