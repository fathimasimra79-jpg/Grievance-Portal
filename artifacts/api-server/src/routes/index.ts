import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import complaintsRouter from "./complaints.js";
import responsesRouter from "./responses.js";
import feedbackRouter from "./feedback.js";
import notificationsRouter from "./notifications.js";
import adminRouter from "./admin.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/complaints", complaintsRouter);
router.use("/complaints/:id/responses", responsesRouter);
router.use("/complaints/:id/feedback", feedbackRouter);
router.use("/notifications", notificationsRouter);
router.use("/admin", adminRouter);

export default router;
