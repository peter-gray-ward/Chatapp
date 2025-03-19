export interface RequestOptions {
    url: string;
    method?: string;
    headers?: Record<string, string>;
    body?: any;
}

export interface UserLoginRequest {
    UserName: string;
    Password: string;
}

export interface User {
    Id: string;
    UserName: string;
    Password: string;
    ProfileThumbnailBase64?: string;
    [key: string]: any;
}

export interface UserLoginResponse {
    User: User,
    Token: string;
}

export interface ModalItem {
    label: string;
    route: string;
}

export const ChatModalItems: ModalItem[] = [
    {
        label: 'Profile',
        route: '/profile'
    }
];

export interface Post {
    PostNumber: number;
    DateTime: Date;
    UserId: string;
    RoomId: string;
    Text: string;
};

export interface Room {
    Id: string;
    UserIds: string;
    Posts: Post[];
};
