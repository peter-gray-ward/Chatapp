export interface RequestOptions {
    url: string;
    method?: string;
    headers?: Record<string, string>;
    body?: any;
}

export interface User {
    Id: string;
    UserName: string;
    ProfileThumbnailBase64: string;
}