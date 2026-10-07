import { UnauthenticatedError, UnauthorizedError, BadRequestError } from "../errors/customErrors.js";
import { verifyJWT } from "../utils/tokenUtils.js";

export const authenticateUser = (req, res, next) => {
    const { token } = req.cookies;
    if (!token) throw new UnauthenticatedError('authentication invalid')

    try {
        const { userId, role } = verifyJWT(token)
        const testUser = userId === '6abba979c3175c35aa7142d9'
        req.user = { userId, role, testUser }
        next()
    } catch (error) {
        throw new UnauthenticatedError('authentication invalid')
    }
};

export const authorizePermissions = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new UnauthorizedError('Unauthorized to this route')
        }
        next()
    }
};

export const checkForTestUser = async (req, res, next) => {
    if (req.user.testUser) {
        throw new BadRequestError('Demo user Read only!!!')
    }
    next();
};