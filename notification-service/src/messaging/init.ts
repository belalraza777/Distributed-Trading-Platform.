import { connectRabbit } from "../config/rabbit";
import { startConsumers } from "./consumer";

export async function initMessaging(){
    try {
        await connectRabbit();
        console.log("RabbitMQ connected");
        await startConsumers();
        console.log("Consumers started");

    } catch(error){
     console.error(
            "Messaging initialization failed",
            error
        );
        throw error;
    }
}