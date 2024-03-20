import axios from "axios";

const SERVER_URL = "http://localhost:3000/task";

interface Task {
  id: string;
  data: any;
}

async function sendTask(task: Task) {
  try {
    const response = await axios.post(SERVER_URL, task);
    console.log(`Task ID: ${task.id} - Response: ${response.data}`);
  } catch (error) {
    //@ts-ignore
    console.error(`Task ID: ${task.id} - Error: ${error.message}`);
  }
}

function createTasks(batchNumber: number, count: number): Task[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `task-${batchNumber}-${index + 1}`,
    data: { payload: `data-${batchNumber}-${index + 1}` },
  }));
}

async function processTasks() {
  let batchNumber = 1;
  const taskCount = 10;

  while (true) {
    const tasks = createTasks(batchNumber, taskCount);
    const taskPromises = tasks.map((task) => sendTask(task));

    await Promise.all(taskPromises);
    console.log(`Batch ${batchNumber} tasks have been sent.`);

    batchNumber += 1;
    await sleep(2000); // Sleep for 2000ms before the next batch
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

processTasks().catch(console.error);
