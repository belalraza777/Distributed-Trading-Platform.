export type SendResult =
    | {
        success: true;
        error?: undefined;
    }
    | {
        success: false;
        error: string;
    };