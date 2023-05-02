const jwt = require("jsonwebtoken");

exports.generateAccessToken = (email, roles) => {
  const accessToken = jwt.sign(
    {
      UserInfo: {
        email: email,
        roles: roles,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
  return accessToken;
};

exports.verifyAccessToken = (accessToken) => {
  const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
  return decoded;
};

exports.setAccessTokenCookie = (accessTokenMaxAge) => {
  return (res, accessToken) => {
    res.cookie("jwt", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      maxAge: accessTokenMaxAge,
    });
  };
};
