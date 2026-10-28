import { Router } from "express";
import * as noteController from "../controllers/noteController.js";
import { validate } from "../middleware/validate.js";
import {
  createNoteSchema,
  listNotesQuerySchema,
  updateNoteSchema,
  uuidParamSchema,
} from "../schemas/noteSchemas.js";

export const notesRouter = Router();

notesRouter.get(
  "/",
  validate(listNotesQuerySchema, "query"),
  (req, res, next) => {
    noteController.listNotes(req, res).catch(next);
  },
);

notesRouter.post("/", validate(createNoteSchema, "body"), (req, res, next) => {
  noteController.createNote(req, res).catch(next);
});

notesRouter.get(
  "/:id",
  validate(uuidParamSchema, "params"),
  (req, res, next) => {
    noteController.getNote(req, res).catch(next);
  },
);

notesRouter.patch(
  "/:id",
  validate(uuidParamSchema, "params"),
  validate(updateNoteSchema, "body"),
  (req, res, next) => {
    noteController.updateNote(req, res).catch(next);
  },
);

notesRouter.delete(
  "/:id",
  validate(uuidParamSchema, "params"),
  (req, res, next) => {
    noteController.deleteNote(req, res).catch(next);
  },
);
