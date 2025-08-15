import { Queue, Worker } from "bullmq";
import redis from "../utils/redisClient.js";
import { defaultQueueConfig } from "../config/queue.js";
import { sendEmail } from "../config/mailer.js";
import { Buffer } from "buffer";

export const emailQueueName = "email-queue";
// console.log(typeof emailQueueName);
export const emailQueue = new Queue(emailQueueName, {
  connection: redis,
  defaultJobOptions: defaultQueueConfig,
});

// workers

export const handler = new Worker(
  emailQueueName,
  async (job) => {
    const data = job.data;

    for (const item of data) {
      try {
        // Log the content type before processing
        // console.log(
        //   "\nContent Type in sendEmailJob:",
        //   Buffer.isBuffer(item.testReport.content) ? "Buffer" : "Not a Buffer"
        // );

        // Convert item.testReport.content back to a Buffer
        const reportContent = Buffer.from(item.testReport.content.data); // Create Buffer from the data array

        // Log to verify conversion
        // console.log("\n\n item.testReport.content as Buffer: ", reportContent);

        await sendEmail(item.toEmail, item.subject, item.body, {
          ...item.testReport,
          content: reportContent, // Use the converted buffer
        });
      } catch (error) {
        console.error(`Error sending email to ${item.toEmail}:`, error);
      }
    }
  },
  {
    connection: redis,
  }
);

// worker listeners

handler.on("completed", (job) => {
  console.log(`The job ${job.id} is completed`);
});
handler.on("failed", (job, err) => {
  console.log(`The job ${job.id} is failed with reason: ${err.message}`);
});
