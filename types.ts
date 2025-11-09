
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export type Page = 'home' | 'tools' | 'about' | 'services' | 'news' | 'faq';

export interface RationParameters {
    species: string;
    age: string;
    weight: string;
    goal: string;
    ingredients: string;
}

export type ImageAspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";
export type VideoAspectRatio = "16:9" | "9:16";

export interface Service {
    icon: string;
    title: string;
    summary: string;
    details: string;
    ebooks?: Array<{
        title: string;
        author: string;
        link: string;
    }>;
}

export interface User {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
}
