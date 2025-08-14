export interface IFileStream {
    readonly fileOriginalName: string;
    readonly file: [{ type: string; data: number[] }]
}

export interface IFileBodyRequest {
    readonly userId: number;
    readonly fileName: string;
}

export interface IFileBodyRequestDeveloper extends IFileBodyRequest {
    readonly appId: number;
}