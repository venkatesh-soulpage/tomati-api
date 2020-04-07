import jwt from 'jsonwebtoken';

const verification_admin = (req, res, next) => {

    const {is_admin} = req;

    if (is_admin) {
        next();
    } else {
        return res.status(403).send({message: 'ADMIN role required'});
    }

}

export default verification_admin;