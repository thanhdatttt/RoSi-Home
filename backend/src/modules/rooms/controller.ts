import type { Request, Response } from "express";
import { type Pagination } from "../../lib/pagination.js";
import {
  bulkCreateRoomsService,
  createRoomService,
  getRoomService,
  listRoomsService,
  updateRoomService,
} from "./service.js";

async function create(req: Request, res: Response): Promise<void> {
  const view = await createRoomService(req.user!.id, req.params.propertyId, req.body);
  res.status(201).json({ data: view });
}

async function bulk(req: Request, res: Response): Promise<void> {
  const result = await bulkCreateRoomsService(req.user!.id, req.params.propertyId, req.body);
  res.status(201).json({ data: result });
}

async function list(req: Request, res: Response): Promise<void> {
  const result = await listRoomsService(
    req.user!.id,
    req.params.propertyId,
    req.query as unknown as Pagination,
  );
  res.status(200).json(result);
}

async function get(req: Request, res: Response): Promise<void> {
  const view = await getRoomService(req.user!.id, req.params.id);
  res.status(200).json({ data: view });
}

async function update(req: Request, res: Response): Promise<void> {
  const view = await updateRoomService(req.user!.id, req.params.id, req.body);
  res.status(200).json({ data: view });
}

export { create, bulk, list, get, update };
