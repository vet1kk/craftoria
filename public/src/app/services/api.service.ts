import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';

import { environment } from '../../environments/environment';
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
    const builtOptions: HttpOptions = { ...options };

    if (params instanceof HttpParams) {
      builtOptions.params = params;
      return builtOptions;
    }

    if (params) {
      builtOptions.params = this.buildHttpParams(params);
    }

    if (builtOptions.headers && !(builtOptions.headers instanceof HttpHeaders)) {
      builtOptions.headers = new HttpHeaders(builtOptions.headers);
    }

    return builtOptions;
  }

  build(params: Record<string, unknown> = {}, filter: Record<string, unknown> = {}): HttpParams {
    let httpParams = new HttpParams();

    httpParams = this.appendParams(httpParams, params);
    httpParams = this.appendParams(httpParams, filter);

    return httpParams;
  }

  private buildHttpParams(
    query: { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> }
  ): HttpParams {
    let params = new HttpParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value === null || typeof value === 'undefined') {
        return;
      }

      if (Array.isArray(value)) {
        value.forEach((entry) => {
          params = params.append(key, String(entry));
        });

        return;
      }

      params = params.set(key, String(value));
    });

    return params;
  }

  private appendParams(httpParams: HttpParams, source: Record<string, unknown>): HttpParams {
    let params = httpParams;

    Object.entries(source).forEach(([key, value]) => {
      if (value === null || typeof value === 'undefined' || value === '') {
        return;
      }

      if (Array.isArray(value)) {
        value.forEach((entry) => {
          params = params.append(key, String(entry));
        });

        return;
      }

      if (value instanceof Date) {
        params = params.set(key, value.toISOString());
        return;
      }

      params = params.set(key, String(value));
    });

    return params;
  }
}






