const { faker } = require('faker');

// Test JWT tokens (you should replace these with valid tokens for your test environment)
const TEST_TOKENS = [
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test1',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test2',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test3',
  // Add more test tokens as needed
];

// Test product IDs (populate these with actual product IDs from your database)
const TEST_PRODUCT_IDS = [
  '507f1f77bcf86cd799439011',
  '507f1f77bcf86cd799439012',
  '507f1f77bcf86cd799439013',
  '507f1f77bcf86cd799439014',
  '507f1f77bcf86cd799439015',
];

module.exports = {
  setAuthToken: setAuthToken,
  generateTestData: generateTestData,
  logResponse: logResponse,
  validateResponse: validateResponse,
  generateRandomProduct: generateRandomProduct,
  setRandomProductId: setRandomProductId,
};

/**
 * Set a random authentication token for testing authenticated requests
 */
function setAuthToken(context, ee, next) {
  const randomToken = TEST_TOKENS[Math.floor(Math.random() * TEST_TOKENS.length)];
  context.vars.authToken = randomToken;
  return next();
}

/**
 * Generate random test data for requests
 */
function generateTestData(context, ee, next) {
  // Generate random user data
  context.vars.firstName = faker.name.firstName();
  context.vars.lastName = faker.name.lastName();
  context.vars.email = faker.internet.email();
  context.vars.phone = '+998' + faker.phone.number('9########');
  context.vars.address = faker.address.streetAddress();
  
  // Generate random search terms
  const products = ['phone', 'laptop', 'tablet', 'watch', 'headphones', 'camera', 'speaker'];
  const brands = ['samsung', 'apple', 'sony', 'lg', 'xiaomi', 'huawei'];
  
  context.vars.searchTerm = Math.random() > 0.5 
    ? products[Math.floor(Math.random() * products.length)]
    : brands[Math.floor(Math.random() * brands.length)];
  
  // Set pagination
  context.vars.page = Math.floor(Math.random() * 5) + 1; // 1-5
  context.vars.limit = [10, 12, 20, 24][Math.floor(Math.random() * 4)];
  
  return next();
}

/**
 * Set a random product ID from predefined list
 */
function setRandomProductId(context, ee, next) {
  const randomProductId = TEST_PRODUCT_IDS[Math.floor(Math.random() * TEST_PRODUCT_IDS.length)];
  context.vars.productId = randomProductId;
  return next();
}

/**
 * Generate random product data for testing
 */
function generateRandomProduct(context, ee, next) {
  context.vars.newProduct = {
    nameUz: faker.commerce.productName() + ' UZ',
    nameRu: faker.commerce.productName() + ' RU', 
    nameEn: faker.commerce.productName() + ' EN',
    descriptionUz: faker.commerce.productDescription() + ' UZ',
    descriptionRu: faker.commerce.productDescription() + ' RU',
    descriptionEn: faker.commerce.productDescription() + ' EN',
    currentPrice: parseFloat(faker.commerce.price(100, 2000, 0)),
    oldPrice: parseFloat(faker.commerce.price(150, 2500, 0)),
    quantity: faker.datatype.number({ min: 1, max: 100 }),
    categoryId: '507f1f77bcf86cd799439011', // Use a valid category ID
    brandId: '507f1f77bcf86cd799439011',    // Use a valid brand ID
    availability: 'in_stock',
    status: 1,
  };
  
  return next();
}

/**
 * Log response details for debugging
 */
function logResponse(context, ee, next) {
  return function(req, res, body) {
    const responseTime = res.timings?.end || 0;
    const statusCode = res.statusCode;
    const url = req.url;
    
    // Log slow responses
    if (responseTime > 1000) {
      console.log(`⚠️  Slow response: ${url} - ${responseTime}ms - Status: ${statusCode}`);
    }
    
    // Log errors
    if (statusCode >= 400) {
      console.log(`❌ Error response: ${url} - Status: ${statusCode} - Body: ${body?.substring(0, 200)}`);
    }
    
    // Emit custom metrics
    ee.emit('counter', 'responses.total', 1);
    ee.emit('counter', `responses.${statusCode}`, 1);
    ee.emit('histogram', 'response.time', responseTime);
    
    if (responseTime > 2000) {
      ee.emit('counter', 'responses.slow', 1);
    }
    
    return next();
  };
}

/**
 * Validate response structure and content
 */
function validateResponse(context, ee, next) {
  return function(req, res, body) {
    try {
      const jsonBody = JSON.parse(body);
      
      // Check if response has expected structure
      if (!jsonBody.hasOwnProperty('success') && res.statusCode === 200) {
        console.log(`⚠️  Invalid response structure: ${req.url}`);
        ee.emit('counter', 'validation.failed', 1);
      }
      
      // Check for specific error patterns
      if (jsonBody.error) {
        ee.emit('counter', 'responses.application_error', 1);
      }
      
      // Validate data presence for list endpoints
      if (req.url.includes('/list') && jsonBody.data && Array.isArray(jsonBody.data)) {
        ee.emit('histogram', 'list.item_count', jsonBody.data.length);
      }
      
      ee.emit('counter', 'validation.passed', 1);
      
    } catch (parseError) {
      console.log(`❌ JSON parse error for ${req.url}: ${parseError.message}`);
      ee.emit('counter', 'validation.parse_error', 1);
    }
    
    return next();
  };
}

// Helper function to create realistic test scenarios
function createRealisticUserBehavior(context, ee, next) {
  // Simulate realistic user behavior patterns
  const userTypes = ['browser', 'searcher', 'buyer', 'returner'];
  const userType = userTypes[Math.floor(Math.random() * userTypes.length)];
  
  context.vars.userType = userType;
  
  // Set behavior-specific variables
  switch (userType) {
    case 'browser':
      context.vars.sessionLength = faker.datatype.number({ min: 3, max: 8 });
      context.vars.browsingDepth = 'shallow';
      break;
    case 'searcher':
      context.vars.sessionLength = faker.datatype.number({ min: 5, max: 15 });
      context.vars.browsingDepth = 'deep';
      break;
    case 'buyer':
      context.vars.sessionLength = faker.datatype.number({ min: 8, max: 20 });
      context.vars.browsingDepth = 'focused';
      break;
    case 'returner':
      context.vars.sessionLength = faker.datatype.number({ min: 2, max: 5 });
      context.vars.browsingDepth = 'direct';
      break;
  }
  
  return next();
}

// Export additional helper for external use
module.exports.createRealisticUserBehavior = createRealisticUserBehavior;