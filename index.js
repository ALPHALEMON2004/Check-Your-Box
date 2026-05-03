import http from 'node:http';

import {Server} from 'socket.io';
import dotenv from 'dotenv';
import { state,createApp,Check_box_Key,RateLimitingMap } from './src/app.js';
import { publisher,subscriber,redis } from './redis-connection.js';
dotenv.config();




async function main() {
    const server = http.createServer(createApp());

    const PORT = process.env.PORT || 4000;

    const io = new Server();
    io.attach(server);

    await subscriber.subscribe("internal-server:checkbox:changed")
    subscriber.on("message",(channel,message)=>{
        if(channel==="internal-server:checkbox:changed"){
            const {index,checked}=JSON.parse(message);

        //    state.checkboxes[index]=checked;

           io.emit("server:check:clicked",{index,checked});

        }
    })

    //Socket IO Handeler :-

    io.on('connection',(socket)=>{
        console.log("Socket connected",{id:socket.id});    
        
          socket.on("client:check:clicked",async (data,ack)=>{
                 console.log(`[Socket :${socket.id}]:clent:check:clicked`,data);

                 const sendAck = (payload) => {
                     if (typeof ack === 'function') {
                          ack(payload);
                     }
                 };

                 try {
                     const index = Number(data?.index);
                     const checked = Boolean(data?.checked);

                     const existingState = await redis.get(Check_box_Key);
                     const remoteData = existingState ? JSON.parse(existingState) : [...state.checkboxes];
                     const currentChecked = Boolean(remoteData[index]);

                     const lastClickedTime = await redis.get(`rate-limit: ${socket.id}`)

                     if(lastClickedTime){
                          const timeDiff=Date.now()-Number(lastClickedTime);
                          if(timeDiff<4*1000){
                                const error = `Please wait for some time`;
                                socket.emit("server:error",{error});
                                sendAck({ ok: false, error, index, checked: currentChecked });
                                return;
                          }
                     }

                     await redis.set(`rate-limit: ${socket.id}`,Date.now());

                     remoteData[index] = checked;
                     await redis.set(Check_box_Key,JSON.stringify(remoteData));

                     state.checkboxes[index] = checked;

                     await publisher.publish("internal-server:checkbox:changed",JSON.stringify({ index, checked }));
                     sendAck({ ok: true, index, checked });
                 } catch (error) {
                     console.error('client:check:clicked handler error', error);
                     const message = 'Unable to update checkbox right now';
                     socket.emit("server:error",{ error: message });
                     sendAck({ ok: false, error: message });
                 }
          })
     
        
    })
    
    server.listen(PORT, () => {
        console.log(`Server is running on port http://localhost:${PORT}`);
    });
}


main();






