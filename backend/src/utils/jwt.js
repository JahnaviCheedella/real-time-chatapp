//Generates short-lived access token

import jwt from "jsonwebtoken";

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email }, //Payload: The public info (ID/email) printed on the digital ID badge.
        process.env.JWT_SECRET, //Secret: The secret sauce that proves the badge is real.
        { expiresIn: "15m" } //Expiration: The badge expires in 15 minutes.
    )
}

export default generateToken;

// When a user types in their correct username and password, you call this generateToken(user) function.
// It takes their id, stamps it with your unforgeable SECRET, puts a 15-minute timer on it,
// and sends this newly printed "Badge" back to the React frontend to use in their API requests!