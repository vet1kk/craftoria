import { User } from './user.model';

export interface ApiCollectionResponse<T> {
  data: T[];
}

export interface ApiResourceResponse<T> {
  data: T;
}

export interface SessionResponse {
  authenticated: boolean;
  user: User | null;
}