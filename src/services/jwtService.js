const jwt = require('jsonwebtoken');

class JWTService {
    static generateToken(user) {
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
    }

    static verifyToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            throw new Error('Invalid token');
        }
    }
}

module.exports = JWTService;
