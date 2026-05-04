import {Kafka} from "kafkajs";


export const kafkaClient=new Kafka({
    clientId:'my-app',
    brokers:['localhost:9092']
})