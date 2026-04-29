import express from 'express';
import path from 'node:path';

export function createApp() {    

    const app = express();
    app.use(express.static(path.resolve("./public")))

    app.get('/health',(req,res)=>{
        return res.status(200).json({helthy:true,message:"Server is healthy"});
    
    })
    
    
    
    
    return app;

}