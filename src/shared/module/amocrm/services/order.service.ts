import { Injectable } from '@nestjs/common';
import { ConnectAmocrmService } from '../connect-amocrm.service';
import { CreateOrderDto } from 'src/modules/order/dto/order.dto';
import { ProductItem } from 'src/shared/interfaces/product-items';

@Injectable()
export class OrderWithAmoCrmService {
  constructor(private readonly amoCrmService: ConnectAmocrmService) {}

  async addOrderDataToLead(
    leadId: number,
    orderData: CreateOrderDto,
    itemDetails: string,
    orderCode: string,
  ) {
    try {
      const client = this.amoCrmService.getClient();
      const response = await client.request.patch(`/api/v4/leads/${leadId}`, {
        custom_fields_values: [
          {
            field_id: 594419,
            values: [{ value: orderCode }],
          },
          {
            field_id: 590875,
            values: [
              { value: `${orderData.firstName}  ${orderData.lastName}` },
            ],
          },
          {
            field_id: 590931, // "lastName" field_id
            values: [{ value: orderData.email }],
          },
          {
            field_id: 594417,
            values: [{ value: itemDetails }],
          },
          {
            field_id: 594421, // "Comment" field_id
            values: [{ value: orderData.comment || '' }],
          },
          {
            field_id: 600343,
            values: [{ value: orderData.customerType }],
          },
          {
            field_id: 594885,
            values: [{ value: orderData.companyName || '' }],
          },
          {
            field_id: 594887, // "Phone" field_id
            values: [{ value: orderData.phone }],
          },
        ],
      });
      return;
    } catch (error) {
      console.error(
        '❌ Error updating lead with custom fields:',
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  // async createLead(
  //   body: CreateOrderDto,
  //   items: ProductItem[],
  //   orderCode: string,
  // ) {
  //   try {
  //     const client = this.amoCrmService.getClient();
  //
  //     const response = (await client.request.post('/api/v4/leads', [
  //       {
  //         name: `${body.firstName} ${body.lastName}`,
  //       },
  //     ])) as any;
  //
  //     const leadId = response.data._embedded.leads[0].id;
  //     let itemsDetails: string = '';
  //     items.map((item) => {
  //       itemsDetails += `#${item.sku}-${item.nameEn},`;
  //     });
  //     await this.addOrderDataToLead(leadId, body, itemsDetails, orderCode);
  //   } catch (error) {
  //     console.error(
  //       '❌ Error creating lead:',
  //       error.response?.data || error.message,
  //     );
  //     throw error;
  //   }
  // }
}
