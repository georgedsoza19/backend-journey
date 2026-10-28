import type { Request, Response } from "express";
import type { z } from "zod";
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

export async function listNotes(req: Request, res: Response): Promise<void> {
  const query = req.query as unknown as ListQuery;
  const result = await noteService.listNotes(query);
  res.status(200).json(result);
}

export async function getNote(req: Request, res: Response): Promise<void> {
  const { id } = req.params as unknown as IdParams;
  const note = await noteService.getNote(id);
  res.status(200).json({ data: note });
}

export async function createNote(req: Request, res: Response): Promise<void> {
  const body = req.body as CreateBody;
  const note = await noteService.createNote(body);
  res.status(201).json({ data: note });
}

export async function updateNote(req: Request, res: Response): Promise<void> {
  const { id } = req.params as unknown as IdParams;
  const body = req.body as UpdateBody;
  const note = await noteService.updateNote(id, body);
  res.status(200).json({ data: note });
}

export async function deleteNote(req: Request, res: Response): Promise<void> {
  const { id } = req.params as unknown as IdParams;
  await noteService.deleteNote(id);
  res.status(204).send();
}

export async function listUsers(_req: Request, res: Response): Promise<void> {
  const result = await noteService.listUsers();
  res.status(200).json(result);
}
