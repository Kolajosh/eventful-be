import { Queue } from "bullmq";
import { redisConfig } from "../../config/redis";

export const EMAIL_QUEUE_NAME = "email-queue";

export const emailQueue = new Queue(EMAIL_QUEUE_NAME, {
  connection: redisConfig,
});

export const addEmailJob = async (data: any) => {
  return await emailQueue.add("send-email", data, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  });
};
