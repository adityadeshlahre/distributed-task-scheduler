# Distributed Task Scheduler

This project implements a distributed task scheduler using Node.js, RabbitMQ, and Worker Threads. It allows distributing tasks across multiple channels and processing them concurrently to achieve better performance.

## Files

### `index.ts`

This file contains the main entry point of the application. It sends tasks to the RabbitMQ server for processing.

### `server.ts`

This file sets up an Express server to receive tasks from clients. It adds received tasks to the RabbitMQ queue for processing.

### `taskManager.ts`

This file manages the RabbitMQ connections and channels. It dynamically creates channels based on the number of tasks and ensures efficient task distribution.

### `taskWorker.ts`

This file defines the worker thread responsible for processing individual tasks. It receives tasks from the RabbitMQ queue, performs the necessary computation, and sends back the result.

## Design Overview

The system follows a request-reply pattern using RabbitMQ for message queuing. Here's an overview of the design:

```
             +-------------------+
             |   Client/Server   |
             |                   |
             +-------------------+
                       |
                       v
             +-------------------+
             |    RabbitMQ       |
             |   (Message Queue) |
             +-------------------+
                       |
          +------------+-------------+
          |                          |
+-----------------+        +-----------------+
|   Worker 1      |        |   Worker 2      |
| (Task Processor)|        | (Task Processor)|
+-----------------+        +-----------------+
```

- **Client/Server**: Sends tasks to the RabbitMQ server for processing.
- **RabbitMQ (Message Queue)**: Acts as a broker between the client/server and worker nodes. Tasks are added to a queue and processed by available worker nodes.
- **Worker Nodes (Task Processors)**: Receive tasks from the RabbitMQ queue, process them, and send back the result.

## Usage

1. Install dependencies: `npm install`
2. Start the RabbitMQ server.
3. Start the application: `npm start`
