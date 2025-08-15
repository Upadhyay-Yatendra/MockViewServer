import { db } from "../db/connection.js";
import { MockInterview } from "../models/schema.js";
import { eq, desc, sql } from "drizzle-orm";
import redis from "../utils/redisClient.js";
import { sendEmail } from "../config/mailer.js";
import generateTestReport from "../config/generateTestReport.js";
import { emailQueue, emailQueueName } from "../jobs/sendEmailJob.js";

export const getInterviewsTaken = async (req, res) => {
  try {
    const email = req.query.email;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2; // Use a default limit, e.g., 5 interviews per page
    const offset = (page - 1) * limit;

    const cacheKey = `interviews:${email}:${page}:${limit}`;

    // Check if cached data exists
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    } else {
      // Fetch paginated interviews from the database
      const interviews = await db
        .select()
        .from(MockInterview)
        .where(eq(MockInterview.createdBy, email))
        .orderBy(desc(MockInterview.id))
        .limit(limit)
        .offset(offset);

      // Used SQL aggregation to count total interviews
      const totalInterviews = await db
        .select({
          count: sql`COUNT(*)`, // Using raw SQL for counting
        })
        .from(MockInterview)
        .where(eq(MockInterview.createdBy, email));

      // Extract the total interview count
      const interviewCount = totalInterviews[0].count;

      // Calculate total pages
      const totalPages = Math.ceil(interviewCount / limit);
      // Structure the result to include interviews and pagination info
      const result = {
        interviews,
        totalPages,
      };

      // Cache the result for 1 hour (3600 seconds)
      await redis.setex(cacheKey, 3600, JSON.stringify(result));

      // Send the response
      return res.json(result);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching interviews" });
  }
};

// export const sendTestReport = async (req, res) => {

//   return res.status(200).json("Sent the test report");
// };

// ****************************
// * Send test email

export const sendTestReport = async (req, res) => {
  try {
    const { email, interviewId } = req.query;

    // Generate the test report as a PDF buffer
    const reportPdf = await generateTestReport(interviewId);
    // console.log("\nPDF Buffer type in InterviwController:", Buffer.isBuffer(reportPdf) ? 'Buffer' : 'Not a Buffer');
    const payload = [
        {
            toEmail: email,
            subject: "Test  Report",
      
            body: "<h1>Here is your test report.</h1>",
            testReport: {
              filename: `../config/test-report-${interviewId}.pdf`,
              content: reportPdf,
              contentType: "application/pdf",
            },
          }
    ]
    ;

    // await sendEmail(
    //   payload.toEmail,
    //   payload.subject,
    //   payload.body,
    //   payload.testReport
    // );
    // console.log("\nPDF Buffer type in generateTestReport:", Buffer.isBuffer(payload[0].testReport.content) ? 'Buffer' : 'Not a Buffer');
    await emailQueue.add(emailQueueName , payload);

    return res.json({ status: 200, message: "Job added successfully" });
  } catch (error) {
    console.error("\n\n\n",error);
    return res.status(500).json({
      message: "Something went wrong. Please try again later.   ....",
      error: error,
    });
  }
};
