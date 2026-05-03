import {db} from "../db/index.js";
import crypto from "node:crypto";
import JWT from "jsonwebtoken";
import { JWTClaims } from "../utils/token.js";
import {PRIVATE_KEY} from "../utils/cert.js";
import {eq} from "drizzle-orm";
import {usersTable} from "../db/schema.js";



export const signUp = async(req,res)=>{
   const {firstName, lastName, email, password } = req.body;
   

   // All field are OK?
   if(!firstName || !email || !password){
      res
        .status(400)
        .json({ message: "Missing required fields: firstName, email, password." });
        return; 
   }
   
   // Check if user already exists

   const [existingUser] = await db
   .select({id:usersTable.id})
   .from(usersTable)
   .where(eq(usersTable.email, email))
   .limit(1); 

    if (existingUser){
        res.status(409).json({ message: "User with this email already exists." });
      return;
    }

    //If new user - Create user in db
    //create salt and hash for password
    //insert user in db with hashed password and salt

    const salt=crypto.randomBytes(16).toString("hex");
    const hash = crypto.createHash("sha256").update(password + salt).digest("hex");

    await db.insert(usersTable).values({
      firstName,
      lastName: lastName ?? null,
      email,
      password: hash,
      salt
    });

    res.status(201).json({ message: "User created successfully." });

}




export const signIn= async(req,res)=>{
    const {email, password} = req.body;
     //check for email & password 
    if(!email || !password){
        res.status(400).json({ message: "Missing required fields: email, password." });
        return;
    }
    
    //Check if user exists with given email
    const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);
    //if not exist - invalid credentials
    if(!user || !user.password || !user.salt ){
        res.status(401).json({ message: "Invalid Credentials." });
        return;
    }
     //if exist - hash the provided password with stored salt and compare with stored hash
     
     const hash = crypto.createHash("sha256").update(password + user.salt).digest("hex");

     if (hash !== user.password) {
         res.status(401).json({ message: "Invalid Credentials." });
         return;
     }

    const ISSUER= `http://localhost:${process.env.PORT || 3000}`;
    const now = Math.floor(Date.now() / 1000);

    const claims = {
    iss: ISSUER,
    sub: user.id,
    email: user.email,
    email_verified: String(user.emailVerified),
    exp: now + 3600,
    given_name: user.firstName ?? "",
    family_name: user.lastName ?? undefined,
    name: [user.firstName, user.lastName].filter(Boolean).join(" "),
    picture: user.profileImageURL ?? undefined,
    };

    const token = JWT.sign(claims, PRIVATE_KEY, { algorithm: "RS256" });

    res.json({ token });





}  