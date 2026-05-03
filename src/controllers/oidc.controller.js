import { userInfo } from "node:os";
import jose from "node-jose";
import {PUBLIC_KEY,PRIVATE_KEY} from "../utils/cert.js";
import JWT from "jsonwebtoken";
import {JWTClaims} from "../utils/token.js";
const PORT=process.env.PORT || 3000;

export const oidcConfigHandeler =  (req,res)=>{
    const ISSUER=`http://localhost:${PORT}`;
    return res.json({
        issuer:ISSUER,
        authorization_endpoint:`${ISSUER}/o/authenticate`,
        userInfo_endpoint:`${ISSUER}/o/userinfo`,
        jwks_uri:`${ISSUER}/.well-known/jwks.json`
    });
}


export const jwksHandeler = async (_,res)=>{
    const key = await jose.JWK.asKey(PUBLIC_KEY,"pem");

    return res.json({
        keys:[key.toJSON()]
    })
}


export const userInfoHandeler = async (req,res)=>{
         

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "Missing or invalid Authorization header." });
        return;
    }   

    const token = authHeader.slice(7); // Remove "Bearer " prefix       
    let claims;
    try{
        // 
        claims = JWT.verify(token,PUBLIC_KEY,{ algorithms: ["RS256"] });    
    }
    catch{
        res.status(401).json({ message: "Invalid token." });    
        return;
    }

      // Return user info based on claims
      const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, claims.sub))
        .limit(1);
    if(!user){
        res.status(404).json({ message: "User not found." });
        return;
    }
    
    res.json({
        sub: user.id,
        email: user.email,
        email_verified: user.emailVerified,
        given_name: user.firstName ?? "",
        family_name: user.lastName ?? "",
        name: [user.firstName, user.lastName].filter(Boolean).join(" "),
        picture: user.profileImageURL,
    });








}