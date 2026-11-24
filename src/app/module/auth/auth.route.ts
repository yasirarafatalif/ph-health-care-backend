import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { AuthController } from "./auth.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { UserValidation } from "./auth.validation";

const router = Router();

router.post(
  "/register",
  validateRequest(UserValidation.UserRegistrationsZodSchema),
  AuthController.registerPatient,
);
router.post(
  "/verify-email",
  validateRequest(UserValidation.EmailVerificationsZodSchema),
  AuthController.verifyPatient,
);

router.post(
  "/login",
  validateRequest(UserValidation.UserLoginZodSchema),
  AuthController.loginUser,
);
router.get(
  "/me",
  auth(Role.ADMIN, Role.DOCTOR, Role.PATIENT, Role.SUPER_ADMIN),
  AuthController.getMe,
);
router.post("/google", AuthController.googleLogIn);
router.post(
  "/forgot-password",
  validateRequest(UserValidation.ForgotPasswordZodSchema),
  AuthController.forgetPassword,
);
router.post(
  "/reset-password",
  validateRequest(UserValidation.ResetPasswordZodSchema),
  AuthController.resetPassword,
);
router.post("/refresh-token", AuthController.refreshToken);
export const AuthRoutes = router;
