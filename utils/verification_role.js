import jwt from 'jsonwebtoken';


const verification_role = (scopes, roles) => {
    return (req, res, next) => {

        // Add required permission to SUPERADMIN
        if (req.scope === 'ADMIN' && req.role === 'ADMIN') return next();
 
        // Verify Scope
        if (scopes.indexOf(req.scope) < 0 ) return res.status(403).json(`${req.scope} scope required`).send();

        // Verify Role
        if (roles.indexOf(req.role) < 0) return res.status(403).json(`You don't have the required role to do this action`).send();

        next();
    }
}


export default verification_role;