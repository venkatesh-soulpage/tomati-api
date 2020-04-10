import jwt from 'jsonwebtoken';


const verification_role = (scope, roles) => {
    return (req, res, next) => {

        // Add required permission to SUPERADMIN
        if (req.scope === 'ADMIN' && req.role === 'ADMIN') next();
 
        // Verify Scope
        if (scope !== req.scope) return res.status(403).send({message: `${scope} scope required`});

        // Verify Role
        if (roles.indexOf(req.role) < 0) return res.status(403).send({message: `You don't have the required role to do this action`});

        next();
    }
}


export default verification_role;