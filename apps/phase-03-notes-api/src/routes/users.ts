import { Router } from "express";
import * as noteController from "../controllers/noteController.js";

export const usersRouter = Router();

usersRouter.get("/", (req, res, next) => {
  noteController.listUsers(req, res).catch(next);
});
