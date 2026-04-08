import { HttpHeaders, HttpParams } from '@angular/common/http';

import { HttpOptions, HttpRequestParams } from '../models';

export class ApiRequestHelper {
  static buildOptions(params?: HttpRequestParams, options: HttpOptions = {}): HttpOptions {
    const builtOptions: HttpOptions = { ...options };

    if (params instanceof HttpParams) {
      builtOptions.params = params;
      return builtOptions;
    }

    if (params) {
      builtOptions.params = ApiRequestHelper.buildHttpParams(params);
    }

    if (builtOptions.headers && !(builtOptions.headers instanceof HttpHeaders)) {
      builtOptions.headers = new HttpHeaders(builtOptions.headers);
    }

    return builtOptions;
  }

  static build(params: Record<string, unknown> = {}, filter: Record<string, unknown> = {}): HttpParams {
    let httpParams = new HttpParams();

    httpParams = ApiRequestHelper.appendParams(httpParams, params);
    httpParams = ApiRequestHelper.appendParams(httpParams, filter);

    return httpParams;
  }

  private static buildHttpParams(
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

  private static appendParams(httpParams: HttpParams, source: Record<string, unknown>): HttpParams {
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
