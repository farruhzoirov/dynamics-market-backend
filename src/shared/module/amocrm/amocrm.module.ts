import { Module } from '@nestjs/common';
import { ConnectAmocrmService } from './connect-amocrm.service';

@Module({
  providers: [ConnectAmocrmService],
  exports: [ConnectAmocrmService],
})
export class AmocrmModule {}
