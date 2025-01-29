const JWT_SECRET = require('./config');
const jwt = require('jsonwebtoken');


const  authMiddleware = (req,res,next ) =>{
    const authHeader =  req.headers.authorization;
    if(!authHeader || !authHeader.startswith('bearer'))
    {
            return res.status(403).json({mes : "Plz login agian"})
    }

    const token = authHeader.split(' ')[1];
    try {
        const decode  = jwt.verify(token,JWT_SECRET);
        req.userId= decode.userId;
        next();
    } catch (error) {
        return res.status(411).json({mes : " something up this is plz try again later"})
        
    }
}
module.exports = authMiddleware ; 