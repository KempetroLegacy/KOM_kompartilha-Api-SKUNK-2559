import { Request, Response, NextFunction } from 'express';
import { ErrorResponses } from './validateRequest';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('Erro capturado:', err);

  if (err.statusCode) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  res.status(500).json({ message: ErrorResponses.InternalServerError() });
}