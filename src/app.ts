import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import httpStatus from "http-status";
import config from "./app/config";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import { AuthRoutes } from "./app/module/auth/auth.route";
import { redisClient } from "./app/lib/redis";
import crypto from "crypto";
import { Resend } from "resend";
import { UserRoutes } from "./app/module/user/user.routes";
import { getBkashIdToken } from "./app/lib/bkash";

const app: Application = express();

app.use(
  cors({
    origin: config.frontend_url,
    credentials: true,
  }),
);

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());

app.use("/bkash", async (req: Request, res: Response) => {
  const bkashres = await getBkashIdToken();
  console.log(bkashres);
  res.status(httpStatus.OK).json({
    success: true,
    message: "Bkash System Backend",
  });
});
app.use("/test", async (req: Request, res: Response) => {
  try {
    const resend = new Resend(config.resend_api_key);

    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "yasirarafatalif1@gmail.com",
      subject: "Hello World",
      html: "<p>Congrats on sending your <strong>first email</strong>!</p>",
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Email sending failed",
        error,
      });
    }

    return res.status(httpStatus.OK).json({
      success: true,
      message: "Email sent successfully",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
});

app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/user", UserRoutes);

// Basic route
app.get("/", async (req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    success: true,
    message: "Welcome to PH Healthcare System Backend",
  });
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
