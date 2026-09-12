import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as crypto from 'crypto';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorId = crypto.randomBytes(8).toString('hex');
    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = isHttpException
      ? exception.getResponse()
      : 'Ha ocurrido un error interno en el servidor.';

    // Log estructurado detallado en servidor
    this.logger.error({
      errorId,
      path: request.url,
      method: request.method,
      ip: request.ip,
      status,
      exceptionMessage: exception instanceof Error ? exception.message : exception,
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    // Respuesta limpia y amigable al cliente
    const responseMessage =
      typeof message === 'object' && message !== null && 'message' in message
        ? (message as any).message
        : message;

    response.status(status).json({
      statusCode: status,
      errorId,
      message: status === HttpStatus.INTERNAL_SERVER_ERROR
        ? 'Error interno del servidor'
        : responseMessage,
      timestamp: new Date().toISOString(),
    });
  }
}
