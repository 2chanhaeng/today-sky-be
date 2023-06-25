import { Prisma } from "@prisma/client";

export interface User {
  id: number;
  username: string;
  password: string;
  refresh?: string;
}

export interface Diary {
  content: string;
  user_id: number;
  year: number;
  month: number;
  date: number;
  emotion_id?: number;
}

export interface Todo {
  id: string;
  user_id: number;
  content: string;
  year: number;
  month: number;
  date: number;
  checked?: boolean;
}

export interface Emotion {
  id: number;
  feel: string;
}

export interface Comment {
  content: string;
  emotion_id?: string | null;
}

export interface Image {
  path: string;
  comment_id: number;
}

export type TodoResponse = {
  id: string;
  content: string;
  checked: boolean;
  comment?: Comment | null;
}[];

export interface TodosResponse {
  [date: number]: TodoResponse;
}

export type DiaryResponse = Prisma.DiaryGetPayload<{
  select: {
    content: true;
    emotion_id: true;
  };
}>;

export interface DiariesResponse {
  [date: number]: DiaryResponse;
}

export interface CommentRequest {
  content: string;
  emotion_id?: number;
}
