import jwt from "jsonwebtoken";

const verification_role = (allowed_roles) => {
  return (req, res, next) => {
    // Add required permission to SUPERADMIN
    if (req.scope === "ADMIN" && req.role === "ADMIN") return next();

    const is_allowed = allowed_roles.find(
      (role) => role.scope === req.scope && role.role === req.role
    );

    // Verify Scope
    /*if (scopes.indexOf(req.scope) < 0 ) return res.status(403).json(`${JSON.stringify(scopes)} scopes required`).send();

        // Verify Role
        if (roles.indexOf(req.role) < 0) return res.status(403).json(`${JSON.stringify(roles)} roles required`).send();*/

    if (is_allowed) {
      next();
    } else {
      return res.status(403).json(`Invalid role`).send();
    }
  };
};

export default verification_role;
