import { User } from './user.model';
import { HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';

export type HttpRequestParams = HttpParams | {
  [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean>;
};

export interface HttpOptions {
  headers?: HttpHeaders | {
    [header: string]: string | string[];
  };
  context?: HttpContext;
  observe?: 'body';
  params?: HttpRequestParams;
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
}

export interface ApiResponse<T> extends Record<string, any> {
  readonly data: T;
}

export interface SessionResponse {
  authenticated: boolean;
  user: User | null;
}