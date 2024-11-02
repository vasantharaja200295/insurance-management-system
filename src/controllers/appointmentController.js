const AppointmentService = require('../services/appointmentService');

class AppointmentController {
  static async createAppointment(req, res) {
    try {
      const { customerId, agentId, dateTime, purpose, notes } = req.body;
      
      // Check agent availability
      const isAvailable = await AppointmentService.checkAgentAvailability(agentId, dateTime);
      if (!isAvailable) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Agent is not available at the selected time'
        });
      }

      const appointment = await AppointmentService.createAppointment({
        customerId,
        agentId,
        dateTime,
        purpose,
        notes
      });
      
      // Match the API docs response format
      res.status(201).json({
        appointmentId: appointment._id,
        status: 'SCHEDULED',
        appointmentDetails: {
          customerId: appointment.customerId,
          agentId: appointment.agentId,
          dateTime: appointment.dateTime,
          purpose: appointment.purpose
        }
      });
    } catch (error) {
      console.error('Create appointment error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred'
      });
    }
  }

  static async getCustomerAppointments(req, res) {
    try {
      const { customerId } = req.params;
      const appointments = await AppointmentService.getCustomerAppointments(customerId);
      
      // Match the API docs response format
      res.json({
        ...appointments
      });
    } catch (error) {
      console.error('Get customer appointments error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred'
      });
    }
  }

  static async getAgentAppointments(req, res) {
    try {
      const { agentId } = req.params;
      const appointments = await AppointmentService.getAgentAppointments(agentId);
      
      // Match the API docs response format
      res.json({
        ...appointments,
      });
    } catch (error) {
      console.error('Get agent appointments error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred'
      });
    }
  }

  static async updateAppointmentStatus(req, res) {
    try {
      const { appointmentId } = req.params;
      const { status, notes } = req.body;

      const appointment = await AppointmentService.updateAppointmentStatus(
        appointmentId,
        status,
        notes
      );
      
      res.status(200).json({message: 'Appointment status updated successfully'});
    } catch (error) {
      console.error('Update appointment status error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }
}

module.exports = AppointmentController;