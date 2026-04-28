export class APIError extends Error {
    data: any;
    constructor(
        public statusCode: number,
        message: string,
        data: any = null
    ) {
        super(message);
        this.name = 'APIError';
        this.statusCode = statusCode;
        this.data = data;
    }

    static unauthorized = (msg = 'Unauthorized') => {
        return new APIError(401, msg);
    };
    static badRequest = (msg = 'Bad Request', data: any = null) => {
        return new APIError(400, msg, data);
    };
    static forbidden = (msg = 'Forbidden') => {
        return new APIError(403, msg);
    };
    static notFound = (msg = 'Not Found') => {
        return new APIError(404, msg);
    };
    static conflict = (msg = 'Conflict') => {
        return new APIError(409, msg);
    };
    static internal = (msg = 'Internal Server Error') => {
        return new APIError(500, msg);
    };
}
