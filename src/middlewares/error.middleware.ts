import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.utils';

// Interfaz para errores de validación de express-validator o similar
interface ValidationError {
    msg: string;
    param: string;
    location: string;
}

export const errorHandler = (
    error: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Log del error
    console.error('Error:', {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        path: req.path,
        method: req.method,
        ip: req.ip,
    });

    // Si es un error conocido de la aplicación
    if (error instanceof AppError) {
        const response: any = {
            success: false,
            error: {
                type: error.constructor.name,
                message: error.message,
                statusCode: error.statusCode,
            },
            timestamp: new Date().toISOString(),
            path: req.path,
        };

        // Incluir detalles si existen
        if (error.details) {
            response.error.details = error.details;
        }

        // Incluir stack trace solo en desarrollo
        if (process.env.NODE_ENV === 'development') {
            response.error.stack = error.stack;
        }

        return res.status(error.statusCode).json(response);
    }

    // Errores de validación de JWT
    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: {
                type: 'InvalidTokenError',
                message: 'Token inválido',
                statusCode: 401,
            },
            timestamp: new Date().toISOString(),
            path: req.path,
        });
    }

    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            error: {
                type: 'TokenExpiredError',
                message: 'Token expirado',
                statusCode: 401,
            },
            timestamp: new Date().toISOString(),
            path: req.path,
        });
    }

    // Errores de validación de TypeORM
    if (error.name === 'QueryFailedError') {
        const pgError = error as any;
        
        // Error de unique violation en PostgreSQL
        if (pgError.code === '23505') {
            return res.status(409).json({
                success: false,
                error: {
                    type: 'DuplicateEntryError',
                    message: 'Ya existe un registro con ese valor',
                    statusCode: 409,
                    details: {
                        constraint: pgError.constraint,
                        detail: pgError.detail,
                    },
                },
                timestamp: new Date().toISOString(),
                path: req.path,
            });
        }
    }

    // Error desconocido (siempre 500)
    return res.status(500).json({
        success: false,
        error: {
            type: 'InternalServerError',
            message: process.env.NODE_ENV === 'production' 
                ? 'Error interno del servidor' 
                : error.message,
            statusCode: 500,
        },
        timestamp: new Date().toISOString(),
        path: req.path,
    });
};

// Middleware para manejar rutas no encontradas (404)
export const notFoundHandler = (req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        error: {
            type: 'NotFoundError',
            message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
            statusCode: 404,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
    });
};