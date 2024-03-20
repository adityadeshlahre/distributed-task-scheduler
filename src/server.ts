import express from "express";
import bodyParser from "body-parser";
import amqp from "amqplib";

const app = express();
app.use(bodyParser.json());
const QUEUE = "tasks";

let connection: amqp.Connection | null = null;
let channel: amqp.Channel | null = null;
let taskCount = 0;
const TASKS_PER_CHANNEL = 10;

async function connectRabbitMQ() {
  if (!connection) {
    connection = await amqp.connect("amqp://localhost");
  }
  if (!channel) {
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE);
  }
}

async function addTaskToQueue(task: any) {
  await connectRabbitMQ();
  if (channel) {
    channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(task)));
    console.log(`Task ID: ${task.id} added to queue`);
    taskCount += 1;
  }
}

app.post("/task", async (req, res) => {
  const task = req.body;
  try {
    await addTaskToQueue(task);
    res.status(200).send("Task received and is being processed");
  } catch (error) {
    console.error("Error adding task to queue", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
