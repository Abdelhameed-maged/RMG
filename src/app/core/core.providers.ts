import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { EnvironmentProviders } from '@angular/core';
import { authInterceptor } from './interceptors/auth.interceptor';

export const coreProviders: EnvironmentProviders[] = [
  provideHttpClient(
    withInterceptors([authInterceptor])
  )
];
