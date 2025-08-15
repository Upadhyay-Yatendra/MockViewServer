import { db } from "../db/connection.js";
import { eq, desc } from "drizzle-orm";
import PDFDocument from "pdfkit";
import { UserAnswer } from "../models/schema.js";

const generateTestReport = async (interviewId) => {
  try {
    // Get the test results from the database
    const result = await db
      .select({
        rating: UserAnswer.rating,
        mockIdRef: UserAnswer.mockIdRef,
        id: UserAnswer.id,
      })
      .from(UserAnswer)
      .where(eq(UserAnswer.mockIdRef, interviewId))
      .orderBy(UserAnswer.id);

    if (!result.length) {
      throw new Error("No test results found for the given interview ID");
    }
    // Create a new PDF document
    const pdf = new PDFDocument({
      layout: "portrait",
      size: "A4",
    });
    // Get page width to center-align content
    const pageWidth = pdf.page.width;
    const margin = 50;
    // Add a title to the PDF

    const title = "Test Results From MockView";

    // Set a maximum width that ensures the title doesn't wrap
    const titleWidth = pdf.widthOfString(title);

    // Ensure that text is center-aligned and stays on one line
    // Calculate the x-coordinate to start the text so that it is fully centered
    const xPosition = (pageWidth - titleWidth) / 2;

    // Center the title without cutting it off
    pdf.fontSize(28).text(
      title,
      {
        // width: pageWidth,
        align: "center",
        underline: true,
      },
      100
    );

    // Initialize variables to calculate average feedback
    let sumRatings = 0;
    let countRatings = 0;

    // Set the initial y-coordinate for the text
    let y = 150;

    // Loop through each test result and add individual feedback to the PDF
    result.forEach((row, index) => {
      // Add the question number and rating to the PDF
      pdf
        .fontSize(18)
        .text(`• Question ${index + 1} : Rating - ${row.rating}`, margin, y);

      // Update the y-coordinate for the next text
      y += 30;

      // Update the sum and count for average feedback
      sumRatings += Number(row.rating);
      countRatings++;
    });

    // Calculate the average feedback

    const averageFeedback = sumRatings / countRatings;
    // Add the average feedback to the PDF
    // Add the average feedback in bold
    pdf
      .font("Helvetica-Bold") // Set font to bold
      .fontSize(24)
      .text(
        `Average Feedback : ${averageFeedback.toFixed(2)}`,
        margin,
        y + 30,
        {
          align: "left",
        }
      );

    // Capture PDF content into a buffer
    const pdfBuffer = await new Promise((resolve, reject) => {
      const chunks = [];
      pdf.on("data", (chunk) => {
        if (Buffer.isBuffer(chunk)) {
          chunks.push(chunk);
          // console.log("Chunk type:", typeof chunk); // This should log 'object'
        } else {
          reject(new TypeError('Chunk must be a Buffer'));
        }
      });
      pdf.on("end", () => resolve(Buffer.concat(chunks)));
      pdf.on("error", reject);
      pdf.end();
    });
    // console.log("PDF Buffer type in generateTestReport:", Buffer.isBuffer(pdfBuffer) ? 'Buffer' : 'Not a Buffer');

    return pdfBuffer; // Return the PDF content as a buffer
  } catch (err) {
    console.error("Error generating test report:", err);
    throw err; // Re-throw the error to handle it in the calling function
  }
};

export default generateTestReport;
