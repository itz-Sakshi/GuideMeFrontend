

export class ApiResponse {
    statusCode: number;
    data?: any;
    message: string;
    success: boolean;

    constructor(
        statusCode: number,
        data?: any,
        message: string = "Success"
    ) {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode >= 200 && statusCode < 300; // Automatically sets success based on status code
    }
}

// new ApiResponse(200, []);
// new ApiResponse(500, "Error");
