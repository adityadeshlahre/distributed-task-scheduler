import { Worker } from "worker_threads";
import amqp from "amqplib";

const QUEUE = "tasks";
const TASKS_PER_CHANNEL = 10;

let connection: amqp.Connection | null = null;
let channel: amqp.Channel | null = null;
let taskCount = 0;

async function connectRabbitMQ() {
  if (!connection) {
    connection = await amqp.connect("amqp://localhost");
  }
}

async function createChannelIfNeeded(): Promise<amqp.Channel> {
  if (!channel) {
    channel = await connection!.createChannel();
    await channel.assertQueue(QUEUE);
    startConsumingOnChannel(channel);
  }
  return channel;
}

async function processTaskInWorker(
  task: any
): Promise<{ status: string; taskId: string }> {
  return new Promise((resolve, reject) => {
    const worker = new Worker("./dist/taskWorker.js", {
      workerData: { task },
    });
    worker.on("message", resolve);
    worker.on("error", reject);
  });
}

async function startConsumingOnChannel(channel: amqp.Channel) {
  channel.consume(QUEUE, async (msg) => {
    if (msg) {
      const task = JSON.parse(msg.content.toString());
      console.log(`Received task ID: ${task.id}`);
      try {
        const result = await processTaskInWorker(task);
        console.log(`Task ID: ${result.taskId} completed successfully.`);
        channel.ack(msg);
        taskCount++;
        if (taskCount % TASKS_PER_CHANNEL === 0) {
          await reopenChannelIfNeeded();
        }
      } catch (error) {
        console.error(`Error processing task ID: ${task.id}`, error);
      }
    }
  });
  console.log("Waiting for tasks...");
}

async function reopenChannelIfNeeded() {
  if (channel && taskCount % TASKS_PER_CHANNEL === 0) {
    await createChannelIfNeeded();
  }
}

async function startConsuming() {
  await connectRabbitMQ();
  await createChannelIfNeeded();

  process.on("exit", async () => {
    if (channel) {
      await channel.close();
    }
    if (connection) {
      await connection.close();
    }
  });
}

startConsuming().catch(console.error);

export async function sendTaskToQueue(task: any) {
  const channel = await createChannelIfNeeded();
  channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(task)));
  console.log(`Task ID: ${task.id} added to queue`);
}
