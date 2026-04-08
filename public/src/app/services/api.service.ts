import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';

import { environment } from '../../environments/environment';
import { ApiRequestHelper } from '../helpers';
import { ApiResponse, HttpOptions, HttpRequestParams } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly environment = environment;

  get<T>(
    path: string,
    params?: HttpRequestParams,
    options: HttpOptions = {}
  ): Observable<ApiResponse<T>> {
    return this.http
      .get<ApiResponse<T>>(`${this.environment.apiUrl}${path}`, this.buildOptions(params, options))
      .pipe(shareReplay(1));
  }

  post<T>(
    path: string,
    body: unknown,
    params?: HttpRequestParams,
    options: HttpOptions = {}
  ): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(`${this.environment.apiUrl}${path}`, body, this.buildOptions(params, options));
  }

  put<T>(
    path: string,
    body: unknown,
    params?: HttpRequestParams,
    options: HttpOptions = {}
  ): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(`${this.environment.apiUrl}${path}`, body, this.buildOptions(params, options));
  }

  patch<T>(
    path: string,
    body: unknown,
    params?: HttpRequestParams,
    options: HttpOptions = {}
  ): Observable<ApiResponse<T>> {
    return this.http.patch<ApiResponse<T>>(`${this.environment.apiUrl}${path}`, body, this.buildOptions(params, options));
  }

  delete<T>(
    path: string,
    params?: HttpRequestParams,
    options: HttpOptions = {}
  ): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(`${this.environment.apiUrl}${path}`, this.buildOptions(params, options));
  }

  buildOptions(params?: HttpRequestParams, options: HttpOptions = {}): HttpOptions {
    return ApiRequestHelper.buildOptions(params, options);
  }

  build(params: Record<string, unknown> = {}, filter: Record<string, unknown> = {}): HttpParams {
    return ApiRequestHelper.build(params, filter);
  }
}
