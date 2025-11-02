import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // Remove unnecessary fields and optimize response
        if (Array.isArray(data)) {
          return data.map(this.sanitizeEntity);
        }
        return this.sanitizeEntity(data);
      }),
    );
  }

  private sanitizeEntity(entity: any): any {
    if (!entity || typeof entity !== 'object') {
      return entity;
    }

    // Remove sensitive or unnecessary fields
    const { password, ...rest } = entity;
    return rest;
  }
}


