import { Module } from '@nestjs/common';
import { ConnectAmocrmService } from './connect-amocrm.service';
import { OrderWithAmoCrmService } from './services/order.service';
import { AmocrmController } from './amocrm.controller';
import { AmocrmService } from './amocrm.service';

@Module({
  providers: [ConnectAmocrmService, OrderWithAmoCrmService, AmocrmService],
  exports: [OrderWithAmoCrmService],
  controllers: [AmocrmController],
})
export class AmocrmModule {}
