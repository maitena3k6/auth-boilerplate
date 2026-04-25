// Clase base para errores de la aplicación
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly details?: any;

    constructor(
        message: string,
        statusCode: number,
        details?: any,
        isOperational = true
    ) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.details = details;

        // Capturar stack trace
        Error.captureStackTrace(this, this.constructor);
    }
}

// Errores específicos
export class BadRequestError extends AppError {
    constructor(message: string, details?: any) {
        super(message, 400, details);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = 'No autorizado', details?: any) {
        super(message, 401, details);
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = 'Acceso prohibido', details?: any) {
        super(message, 403, details);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = 'Recurso no encontrado', details?: any) {
        super(message, 404, details);
    }
}

export class ConflictError extends AppError {
    constructor(message: string, details?: any) {
        super(message, 409, details);
    }
}

export class ValidationError extends AppError {
    constructor(message: string, details?: any) {
        super(message, 422, details);
    }
}

export class InternalServerError extends AppError {
    constructor(message: string = 'Error interno del servidor', details?: any) {
        super(message, 500, details, false);
    }
}

export class ServiceUnavailableError extends AppError {
    constructor(message: string = 'Servicio no disponible', details?: any) {
        super(message, 503, details, false);
    }
}