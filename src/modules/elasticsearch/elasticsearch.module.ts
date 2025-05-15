import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { SearchService } from './elasticsearch.service';
import { ElasticsearchController } from './elasticsearch.controller';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      useFactory: () => ({
        node: 'http://localhost:9200',
      }),
    }),
  ],
  providers: [SearchService],
  exports: [SearchService],
  controllers: [ElasticsearchController],
})
export class SearchModule {}
