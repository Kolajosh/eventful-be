import { Worker } from "bullmq";
import { redisConfig } from "../../config/redis";
import { EMAIL_QUEUE_NAME } from "./queue";
import * as emailService from "./email.service";

export const emailWorker = new Worker(
  EMAIL_QUEUE_NAME,
  async (job) => {
    console.log(`Processing job ${job.id} of type ${job.name}`);
    if (job.name === "send-email") {
      const { userEmail, userName, ticket, event } = job.data;
      await emailService.sendTicketEmail(userEmail, userName, ticket, event);
    }
  },
  {
    connection: redisConfig,
  },
);

emailWorker.on("completed", (job) => {
  console.log(`Job ${job.id} has been completed!`);
});

emailWorker.on("failed", (job, err) => {
  console.log(`Job ${job?.id} has failed with ${err.message}`);
});
