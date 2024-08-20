import  jwt  from "jsonwebtoken";
// const { response } = require("../app");

const createJwt = (email, _id, role) => {
  const jwtToken = jwt.sign(
    {
      email,
      _id,
      role,
    },
    process.env.JWT_TOKEN_SECRET,
    {
      expiresIn: "12h",
    }
  );
  return jwtToken;
};

const decryptToken = async (token) => {
  const data = jwt.verify(token, process.env.JWT_TOKEN_SECRET);

  // my code
  console.log("token validation", data);

  if (!data) {
    let TOKEN = localStorage.getItem("is_logged_in");
    if (TOKEN) {
      localStorage.removeItem("is_logged_in");
      // response.redirect(`${process.env.FRONTEND_URL}/merchants/login`);
    }
  }
  // ----------------- end
  return data;
};
export { createJwt, decryptToken };
