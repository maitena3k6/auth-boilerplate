// express-api-utils/index.d.ts

declare module 'express-api-utils' {
    import { Request, Response, NextFunction, RequestHandler } from 'express';

    /**
     * Wraps an async route handler to automatically catch errors and pass them to Express error middleware.
     * @param fn - Async function that handles the request
     * @returns Express middleware function
     * 
     * @example
     * app.get('/users/:id', asyncHandler(async (req, res) => {
     *   const user = await getUserById(req.params.id);
     *   res.json(user);
     * }));
     */
    export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>): RequestHandler;

    /**
     * Standardized error class for API errors with HTTP status codes.
     * Use static helper methods for common HTTP errors.
     * 
     * @example
     * throw APIError.notFound('User not found');
     * throw APIError.badRequest('Invalid email format');
     */
    export class APIError extends Error {
        public statusCode: number;
        public success: boolean;
        public message: string;
        public errors?: any[];

        constructor(message: string, statusCode?: number, errors?: any[]);

        // Static factory methods for common HTTP errors
        static badRequest(message?: string, errors?: any[]): APIError;
        static unauthorized(message?: string, errors?: any[]): APIError;
        static forbidden(message?: string, errors?: any[]): APIError;
        static notFound(message?: string, errors?: any[]): APIError;
        static conflict(message?: string, errors?: any[]): APIError;
        static internal(message?: string, errors?: any[]): APIError;

        // Utility method to check error type
        isOperational(): boolean;
    }

    /**
     * Standardized success response formatter with consistent JSON output.
     * 
     * @example
     * // Simple response
     * new APIResponse({ id: 1, name: 'John' }).send(res);
     * 
     * // With custom status and metadata
     * new APIResponse(users, 201, { total: 100, page: 1 }).send(res);
     */
    export class APIResponse<T = any> {
        public statusCode: number;
        public success: boolean;
        public data: T;
        public message: string;
        public metadata?: Record<string, any>;
        public timestamp: string;

        constructor(data: T, statusCode?: number, metadata?: Record<string, any>);
        constructor(data: T, options?: {
            statusCode?: number;
            message?: string;
            metadata?: Record<string, any>;
        });

        /**
         * Sends the formatted response to the client.
         * @param res - Express response object
         * @returns The Express response object
         */
        send(res: Response): Response;
    }

    /**
     * Express error handling middleware that converts any error (including APIError) 
     * into a standardized JSON error response.
     * 
     * Must be registered AFTER all routes and other middleware.
     * 
     * @example
     * // In your main app file
     * app.use(errorHandler);
     */
    export function errorHandler(
        err: Error | APIError,
        req: Request,
        res: Response,
        next: NextFunction
    ): void;
}

// Optional: Declare the structure of the response objects for better type inference
declare global {
    namespace Express {
        interface Response {
            // You can extend Response type if needed, but the package doesn't modify the prototype
        }
    }
}

// Shape of success response (for documentation/IDE reference)
/**
 * Successful response shape:
 * {
 *   "statusCode": 200,
 *   "success": true,
 *   "data": {...},
 *   "message": "Success",
 *   "metadata": {},
 *   "timestamp": "2025-11-05T...Z"
 * }
 */

// Shape of error response (for documentation/IDE reference)
/**
 * Error response shape:
 * {
 *   "statusCode": 404,
 *   "success": false,
 *   "message": "User not found",
 *   "errors": [],
 *   "timestamp": "2025-11-05T...Z"
 * }
 */