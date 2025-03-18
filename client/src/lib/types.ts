export interface User {
  id: number;
  username: string;
  fullName: string;
  bio?: string;
  website?: string;
  profileImage: string;
}

export interface Post {
  id: number;
  userId: number;
  user?: User;
  imageUrl: string;
  caption: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  isLiked: boolean;
}

export interface Comment {
  id: number;
  postId: number;
  userId: number;
  user?: User;
  text: string;
  createdAt: string;
  isLiked: boolean;
}

export interface Story {
  id: number;
  userId: number;
  user?: User;
  createdAt: string;
  seen: boolean;
}

export interface Like {
  userId: number;
  postId: number;
}

export interface Follow {
  followerId: number;
  followingId: number;
}

export interface Suggestion {
  user: User;
  reason: string;
}
