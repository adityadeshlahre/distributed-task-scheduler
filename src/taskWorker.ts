import { parentPort, workerData } from "worker_threads";

interface Task {
  id: string;
  data: any;
}

function performTask(task: Task): { status: string; taskId: string } {
  console.log(`Processing task ID: ${task.id}`);
  const start = Date.now();
  while (Date.now() - start < 2000);
  return { status: "completed", taskId: task.id };
}

const result = performTask(workerData.task);
parentPort?.postMessage(result);
