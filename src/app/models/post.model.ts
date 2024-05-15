export interface Post {
    likedBy,
    description:string,
    id :string,
    image: string,
    privacy:string,
    like: number,
    timestamp
    comments: UserComment[];
    showComments: boolean
}
export interface UserComment {
    userId: string;
    username: string;
    userAvatar: string;
    content: string;
}