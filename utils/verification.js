import jwt from "jsonwebtoken";

const verification = (req, res, next) => {
  if (!req.headers.authorization)
    return res.status(403).send({ message: "Unauthorized" });

  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(403).send({ message: "No token" });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err)
      return res
        .status(401)
        .send({ message: "Failed to authenticate Token", status: 401 });

    req.account_id = decoded.id;
    req.email = decoded.email;
    req.scope = decoded.scope;
    req.role = decoded.role;

    next();
  });
};

export default verification;
