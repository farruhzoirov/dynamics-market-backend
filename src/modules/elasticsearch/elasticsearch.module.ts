import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { SearchService } from './elasticsearch.service';
import { ElasticsearchController } from './elasticsearch.controller';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      useFactory: async () => ({
        node: 'http://127.0.0.1:9200',
        maxRetries: 10,
        requestTimeout: 15000,
        pingTimeout: 15000,
        // sniffing rebuilds the connection list from each node's published
        // address; on a single-node Docker setup that address is often
        // unreachable from the app, breaking all requests. Not needed for one node.
        sniffOnStart: false,
      }),
    }),
  ],
  providers: [SearchService],
  exports: [SearchService],
  controllers: [ElasticsearchController],
})
export class SearchModule {}
