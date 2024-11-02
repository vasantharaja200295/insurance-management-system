const Appointment = require('../models/Appointment');
const User = require('../models/User');

class AppointmentService {
  static async checkAgentAvailability(agentId, dateTime) {
    const startTime = new Date(dateTime);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour appointment

    const existingAppointment = await Appointment.findOne({
      agentId,
      status: { $ne: 'CANCELLED' },
      $or: [
        {
          dateTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });

    return !existingAppointment;
  }

  static async createAppointment(appointmentData) {
    const startTime = new Date(appointmentData.dateTime);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    const newAppointment = new Appointment({
      ...appointmentData,
      endTime
    });

    return await newAppointment.save();
  }

  static async getCustomerAppointments(customerId, query = {}) {
    const { status, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const filter = { customerId };
    if (status) filter.status = status;

    const appointments = await Appointment.find(filter)
      .populate('agentId', 'firstName lastName email')
      .sort({ dateTime: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Appointment.countDocuments(filter);

    return {
      appointments:appointments.map(apt => ({
        appointmentId: apt._id,
        dateTime: apt.dateTime,
        status: apt.status,
        agent: {
          agentId: apt.agentId._id,
          fullName: `${apt.agentId.firstName} ${apt.agentId.lastName}`
        },
        purpose: apt.purpose
      })),
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    };
  }

  static async getAgentAppointments(agentId, query = {}) {
    const { status, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const filter = { agentId };
    if (status) filter.status = status;

    const appointments = await Appointment.find(filter)
      .populate('customerId', 'firstName lastName email')
      .sort({ dateTime: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Appointment.countDocuments(filter);

    return {
      appointments: appointments.map(apt => ({
        appointmentId: apt._id,
        dateTime: apt.dateTime,
        status: apt.status,
        customer: {
          customerId: apt.customerId._id,
          fullName: `${apt.customerId.firstName} ${apt.customerId.lastName}`
        },
        purpose: apt.purpose
      })),
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    };
  }

  static async updateAppointmentStatus(appointmentId, status, userId, role) {
    const appointment = await Appointment.findById(appointmentId);
    
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    // Verify permission
    if (role !== 'admin' && 
        appointment.customerId.toString() !== userId &&
        appointment.agentId.toString() !== userId) {
      throw new Error('Unauthorized to update this appointment');
    }

    appointment.status = status;
    appointment.updatedAt = new Date();
    
    return await appointment.save();
  }
}

module.exports = AppointmentService;