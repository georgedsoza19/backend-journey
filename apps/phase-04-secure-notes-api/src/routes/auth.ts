import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as authController from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  loginSchema,
  refreshSchema,
  registerSchema,
} from "../schemas/authSchemas.js";

export const authRouter = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: "RATE_LIMITED",
      message: "Too many login attempts. Try again later.",
    },
  },
});

authRouter.post("/register", validate(registerSchema), (req, res, next) => {
  authController.register(req, res).catch(next);
});

authRouter.post(
  "/login",
  loginLimiter,
  validate(loginSchema),
  (req, res, next) => {
    authController.login(req, res).catch(next);
  },
);

authRouter.post("/refresh", validate(refreshSchema), (req, res, next) => {
  authController.refresh(req, res).catch(next);
});

authRouter.post("/logout", validate(refreshSchema), (req, res, next) => {
  authController.logout(req, res).catch(next);
});

authRouter.get("/me", (req, res, next) => {
  requireAuth(req, res, (err) => {
    if (err) {
      next(err);
      return;
    }
    authController.me(req, res).catch(next);
  });
});
