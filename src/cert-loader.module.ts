import { DynamicModule, Logger, Module } from '@nestjs/common';
import { CertLoader } from './cert-loader.service';
import { CertLoaderOptions } from './interfaces/cert-loader-options.interface';

@Module({})
export class CertLoaderModule {
  static register(options: CertLoaderOptions): DynamicModule {
    return {
      module: CertLoaderModule,
      providers: [
        {
          provide: CertLoader,
          useFactory: (logger: Logger) => new CertLoader(logger, options),
          inject: [Logger],
        },
      ],
      exports: [CertLoader],
    };
  }
}
