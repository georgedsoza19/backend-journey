import type { Request, Response } from "express";
import type { z } from "zod";
import { UnauthorizedError } from "../lib/errors.js";
import {
  createNoteSchema,
  listNotesQuerySchema,
  updateNoteSchema,
  uuidParamSchema,
} from "../schemas/noteSchemas.js";
import * as noteService from "../services/noteService.js";

type ListQuery = z.infer<typeof listNotesQuerySchema>;
type CreateBody = z.infer<typeof createNoteSchema>;
type UpdateBody = z.infer<typeof updateNoteSchema>;
type IdParams = z.infer<typeof uuidParamSchema>;

function requireUser(req: Request) {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  return req.user;
}

export async function listNotes(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const query = req.query as unknown as ListQuery;
  const result = await noteService.listNotes({
    userId: user.id,
    role: user.role,
    ...query,
  });
  res.status(200).json(result);
}

export async function getNote(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const { id } = req.params as unknown as IdParams;
  const note = await noteService.getNote(id, user.id, user.role);
  res.status(200).json({ data: note });
}

export async function createNote(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const body = req.body as CreateBody;
  const note = await noteService.createNote(user.id, body);
  res.status(201).json({ data: note });
}

export async function updateNote(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const { id } = req.params as unknown as IdParams;
  const body = req.body as UpdateBody;
  const note = await noteService.updateNote(id, user.id, user.role, body);
  res.status(200).json({ data: note });
}

export async function deleteNote(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const { id } = req.params as unknown as IdParams;
  await noteService.deleteNote(id, user.id, user.role);
  res.status(204).send();
}
