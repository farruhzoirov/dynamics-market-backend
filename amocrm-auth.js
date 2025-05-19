import { Client } from 'amocrm-js';
import fs from 'fs';

import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  domain: process.env.AMOCRM_DOMAIN,
  auth: {
    client_id: process.env.AMOCRM_CLIENT_ID,
    client_secret: process.env.AMOCRM_CLIENT_SECRET,
    redirect_uri: process.env.AMOCRM_REDIRECT_URL,
    code: process.env.AMOCRM_CODE,
  },
});

(async () => {
  await client.connection.connect();
  const token = client.token.getValue();
  if (!fs.existsSync('./amocrm-token.json')) {
    fs.openSync('./amocrm-token.json', 'w');
  }
  fs.writeFileSync('./amocrm-token.json', JSON.stringify(token, null, 2));
  console.log('✅ Tokens saved: amocrm-token.json');
})();
