const Agent = require('../models/Agent');
const User = require('../models/User');

class AgentController {
    static async getAllAgents(req, res, next) {
        try {
            const agents = await Agent.find({ status: 'active' })
                .populate('userId', 'firstName lastName email')
                .lean();

            const formattedAgents = agents.map(agent => ({
                agentId: agent._id,
                fullName: `${agent.userId.firstName} ${agent.userId.lastName}`,
                email: agent.userId.email,
                specialization: agent.specialization,
                rating: agent.rating,
                availability: agent.availability
            }));

            res.json({ agents: formattedAgents });
        } catch (error) {
            next(error);
        }
    }

    static async getAgentDetails(req, res, next) {
        try {
            const { agentId } = req.params;

            const agent = await Agent.findById(agentId)
                .populate('userId', 'firstName lastName email')
                .lean();

            if (!agent) {
                return res.status(404).json({
                    error: 'Not Found',
                    message: 'Agent not found'
                });
            }

            const formattedAgent = {
                agentId: agent._id,
                fullName: `${agent.userId.firstName} ${agent.userId.lastName}`,
                email: agent.userId.email,
                specialization: agent.specialization,
                rating: agent.rating,
                availability: agent.availability
            };

            res.json(formattedAgent);
        } catch (error) {
            next(error);
        }
    }

    static async createAgent(req, res, next) {
        try {
            const { specialization, experience, availability } = req.body;

            const existingAgent = await Agent.findOne({ userId: req.user.id });
            if (existingAgent) {
                return res.status(400).json({
                    error: 'Bad Request',
                    message: 'Agent profile already exists'
                });
            }

            const agent = new Agent({
                userId: req.user.id,
                specialization,
                experience,
                availability: availability || []
            });

            await agent.save();
            await User.findByIdAndUpdate(req.user.id, { role: 'agent' });

            res.status(201).json(agent);
        } catch (error) {
            next(error);
        }
    }

    static async updateAvailability(req, res, next) {
        try {
            const { agentId } = req.params;
            const { availability } = req.body;

            const agent = await Agent.findById(agentId);
            if (!agent) {
                return res.status(404).json({
                    error: 'Not Found',
                    message: 'Agent not found'
                });
            }

            if (agent.userId.toString() !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({
                    error: 'Forbidden',
                    message: 'Not authorized to update this agent'
                });
            }

            agent.availability = availability;
            await agent.save();

            res.status(200).send();
        } catch (error) {
            next(error);
        }
    }
}


module.exports = AgentController;