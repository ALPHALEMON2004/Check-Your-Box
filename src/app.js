import path from 'node:path';
import express from 'express';
import {redis} from '../redis-connection.js';
import authRoutes from './routes/auth.routes.js';
import oidcRoutes from './routes/oidc.routes.js';
import { requireLocationAuth } from './middlewares/auth.middleware.js';








const Check_box_count=100;
export const Check_box_Key="checkboxes-state:v1";
export const state={
        checkboxes: new Array(Check_box_count).fill(false),
        };
export const RateLimitingMap=new Map(); 

export function createApp() {    
        
const app = express();
app.use(express.json());
app.get(["/location", "/location.html"], requireLocationAuth, (req, res) => {
    return res.sendFile(path.resolve("./public/location.html"));
});
app.use(express.static(path.resolve("./public")))

app.get('/health',(req,res)=>{
    return res.status(200).json({helthy:true,message:"Server is healthy"});
    
    })

app.get("/checkboxes",async(req,res)=>{
    const existingState = await redis.get(Check_box_Key);
    if(existingState){
            const remoteData = JSON.parse(existingState);
            return res.json({checkboxes:remoteData});
        }
        return res.json({checkboxes: state.checkboxes})
     })
    


app.use("/o/authenticate", authRoutes);
app.use("/", oidcRoutes);
app.get("/o/authenticate", (req, res) => {
  return res.sendFile(path.resolve("public", "authenticate.html"));
});
app.get("/o/autheniticate", (req, res) => {
    return res.redirect("/o/authenticate");
});
app.get("/o/autheniticate/log-in", (req, res) => {
    return res.redirect("/o/authenticate");
});


    
    
    return app;

}