import { Router } from "express";

import { getInterviewsTaken , sendTestReport } from "../controllers/interviewControllers.js";
const interviewRouter = Router();



// interviewRouter.get('/taken', verifyUser, getInterviewsTaken);
interviewRouter.get("/taken", getInterviewsTaken);
interviewRouter.post("/send-test-report",sendTestReport)
export default interviewRouter;
