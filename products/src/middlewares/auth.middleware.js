const jwt = require('jwt')

const createAuthMiddleware = (roles=["user"])=>{
    return function authMiddleware(){
        const token = req.cookies?.token || req.headers?.authorization.split("")[1] 
        if(!token){
            return res.status(404).json({
                message:"Unauthorized"
            })
        }
        try {
            const decoded = jwt.verify(token,process.env.JWT_SECRET)
            if(!roles.includes(decoded.role)){
                return res.status(403).json({
                    message:"Forbidden:insufficient permission"
                })
            }

            req.user = decoded
            next()
        } catch (error) {
            return res.status(403).json({
                message:"Forbidden : insufficient permission"
            })               
        }
    }

}

module.exports = createAuthMiddleware