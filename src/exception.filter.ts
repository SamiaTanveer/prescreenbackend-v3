import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  // HttpStatus,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Response } from 'express';
// import { CastError } from 'mongoose';

@Catch(UnprocessableEntityException)
export class HttpExceptionFilter
  implements ExceptionFilter<UnprocessableEntityException>
{
  constructor(public reflector: Reflector) {}
  catch(exception: UnprocessableEntityException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Customize the error message and status code as needed
    const message = exception.message;
    const statusCode = exception.getStatus();

    response.status(statusCode).json({
      statusCode,
      message,
    });
  }
}
