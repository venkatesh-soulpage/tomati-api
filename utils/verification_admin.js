import jwt from 'jsonwebtoken';


const verification_role = (scope, roles) => {
    return (req, res, next) => {

        // Verify Scope
        if (scope !== req.scope) return res.status(403).send({message: `${req.scope} scope required`});

        // Verify Role
        if (scope !== req.scope) return res.status(403).send({message: `You don't have the required role to do this action`});
    }
}

const verification_admin = (req, res, next) => {

    const {scope, role} = req;

    const is_admin = (scope === 'ADMIN' && role === 'ADMIN');

    if (is_admin) {
        next();
    } else {
        return res.status(403).send({message: 'ADMIN role required'});
    }

}

export default verification_admin;