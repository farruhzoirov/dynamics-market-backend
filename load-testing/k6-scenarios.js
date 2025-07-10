import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');
const requestCount = new Counter('requests_count');

// Test configuration
export const options = {
  scenarios: {
    // Baseline performance test
    baseline_load: {
      executor: 'constant-vus',
      vus: 10,
      duration: '2m',
      tags: { test_type: 'baseline' },
    },
    
    // Ramp up test
    ramp_up_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 20 },
        { duration: '1m', target: 50 },
        { duration: '30s', target: 100 },
        { duration: '2m', target: 100 },
        { duration: '30s', target: 0 },
      ],
      tags: { test_type: 'ramp_up' },
    },
    
    // Spike testing
    spike_test: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '10s', target: 10 },
        { duration: '10s', target: 200 },  // Sudden spike
        { duration: '30s', target: 200 },
        { duration: '10s', target: 10 },
      ],
      tags: { test_type: 'spike' },
    },
    
    // Stress testing - find breaking point
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 50 },
        { duration: '1m', target: 100 },
        { duration: '1m', target: 200 },
        { duration: '1m', target: 300 },
        { duration: '1m', target: 400 },
        { duration: '30s', target: 0 },
      ],
      tags: { test_type: 'stress' },
    },
    
    // Critical path testing
    critical_path: {
      executor: 'constant-arrival-rate',
      rate: 30, // 30 requests per second
      timeUnit: '1s',
      duration: '3m',
      preAllocatedVUs: 50,
      maxVUs: 100,
      tags: { test_type: 'critical_path' },
    }
  },
  
  thresholds: {
    http_req_duration: ['p(95)<2000', 'p(99)<5000'], // 95% under 2s, 99% under 5s
    http_req_failed: ['rate<0.05'], // Error rate under 5%
    errors: ['rate<0.1'],
    response_time: ['avg<1000', 'p(95)<2000'],
  },
};

// Base URL configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

// Test data
const SEARCH_TERMS = ['phone', 'laptop', 'samsung', 'iphone', 'macbook', 'watch'];
const TEST_PRODUCT_IDS = [
  '507f1f77bcf86cd799439011',
  '507f1f77bcf86cd799439012',
  '507f1f77bcf86cd799439013',
];

// Headers
const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept-Language': 'uz',
  'App-Type': 'user',
};

export default function () {
  const scenario = __ENV.K6_SCENARIO_NAME || 'baseline_load';
  
  switch (scenario) {
    case 'critical_path':
      testCriticalPath();
      break;
    case 'stress':
      testStressScenario();
      break;
    case 'spike':
      testSpikeScenario();
      break;
    default:
      testNormalUserJourney();
  }
}

/**
 * Test critical business paths
 */
function testCriticalPath() {
  const startTime = new Date().getTime();
  
  // 1. Product Search (Most critical)
  const searchTerm = SEARCH_TERMS[Math.floor(Math.random() * SEARCH_TERMS.length)];
  const searchResponse = http.post(`${BASE_URL}/product/search`, JSON.stringify({
    search: searchTerm,
    page: 1,
    limit: 12
  }), { headers: defaultHeaders });
  
  const searchCheck = check(searchResponse, {
    'search status is 200': (r) => r.status === 200,
    'search response time < 1000ms': (r) => r.timings.duration < 1000,
    'search has results': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data && body.data.length > 0;
      } catch {
        return false;
      }
    },
  });
  
  errorRate.add(!searchCheck);
  responseTime.add(searchResponse.timings.duration);
  requestCount.add(1);
  
  // Extract product ID for next request
  let productId = null;
  try {
    const searchData = JSON.parse(searchResponse.body);
    if (searchData.data && searchData.data.length > 0) {
      productId = searchData.data[0]._id;
    }
  } catch (e) {
    productId = TEST_PRODUCT_IDS[Math.floor(Math.random() * TEST_PRODUCT_IDS.length)];
  }
  
  sleep(0.5);
  
  // 2. Get Product Details
  if (productId) {
    const productResponse = http.post(`${BASE_URL}/product/get-product`, JSON.stringify({
      _id: productId
    }), { headers: defaultHeaders });
    
    const productCheck = check(productResponse, {
      'product status is 200': (r) => r.status === 200,
      'product response time < 800ms': (r) => r.timings.duration < 800,
      'product has data': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body._id !== undefined;
        } catch {
          return false;
        }
      },
    });
    
    errorRate.add(!productCheck);
    responseTime.add(productResponse.timings.duration);
    requestCount.add(1);
  }
  
  sleep(0.3);
  
  // 3. Browse Categories (Common action)
  const categoryResponse = http.post(`${BASE_URL}/category/list`, JSON.stringify({
    page: 1,
    limit: 20
  }), { headers: defaultHeaders });
  
  const categoryCheck = check(categoryResponse, {
    'category status is 200': (r) => r.status === 200,
    'category response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  errorRate.add(!categoryCheck);
  responseTime.add(categoryResponse.timings.duration);
  requestCount.add(1);
  
  const totalTime = new Date().getTime() - startTime;
  check(totalTime, {
    'total journey time < 3000ms': (t) => t < 3000,
  });
}

/**
 * Test normal user journey with realistic behavior
 */
function testNormalUserJourney() {
  // Homepage simulation
  const bannerResponse = http.post(`${BASE_URL}/banner/list`, JSON.stringify({
    page: 1,
    limit: 5
  }), { headers: defaultHeaders });
  
  check(bannerResponse, {
    'banner status is 200': (r) => r.status === 200,
    'banner response time < 800ms': (r) => r.timings.duration < 800,
  });
  
  sleep(1);
  
  // Product browsing
  const productListResponse = http.post(`${BASE_URL}/product/list`, JSON.stringify({
    page: Math.floor(Math.random() * 3) + 1,
    limit: 12
  }), { headers: defaultHeaders });
  
  check(productListResponse, {
    'product list status is 200': (r) => r.status === 200,
    'product list response time < 1200ms': (r) => r.timings.duration < 1200,
  });
  
  sleep(2);
  
  // Brand browsing
  const brandResponse = http.post(`${BASE_URL}/brand/list`, JSON.stringify({
    page: 1,
    limit: 20
  }), { headers: defaultHeaders });
  
  check(brandResponse, {
    'brand status is 200': (r) => r.status === 200,
    'brand response time < 600ms': (r) => r.timings.duration < 600,
  });
  
  responseTime.add(bannerResponse.timings.duration);
  responseTime.add(productListResponse.timings.duration);
  responseTime.add(brandResponse.timings.duration);
  requestCount.add(3);
}

/**
 * Stress test scenario with high load
 */
function testStressScenario() {
  const responses = [];
  
  // Rapid fire requests to find breaking point
  for (let i = 0; i < 5; i++) {
    const response = http.post(`${BASE_URL}/product/search`, JSON.stringify({
      search: SEARCH_TERMS[i % SEARCH_TERMS.length],
      page: 1,
      limit: 24
    }), { headers: defaultHeaders });
    
    responses.push(response);
    requestCount.add(1);
    
    if (i < 4) sleep(0.1); // Very short sleep between requests
  }
  
  // Check all responses
  responses.forEach((response, index) => {
    const isSuccess = check(response, {
      [`stress request ${index} status is 200`]: (r) => r.status === 200,
      [`stress request ${index} response time acceptable`]: (r) => r.timings.duration < 3000,
    });
    
    errorRate.add(!isSuccess);
    responseTime.add(response.timings.duration);
  });
}

/**
 * Spike test scenario - sudden traffic increase
 */
function testSpikeScenario() {
  // Simulate sudden spike in traffic
  const concurrentRequests = [
    http.post(`${BASE_URL}/product/search`, JSON.stringify({ search: 'phone', page: 1, limit: 12 }), { headers: defaultHeaders }),
    http.post(`${BASE_URL}/product/list`, JSON.stringify({ page: 1, limit: 12 }), { headers: defaultHeaders }),
    http.post(`${BASE_URL}/category/list`, JSON.stringify({ page: 1, limit: 20 }), { headers: defaultHeaders }),
    http.post(`${BASE_URL}/brand/list`, JSON.stringify({ page: 1, limit: 20 }), { headers: defaultHeaders }),
  ];
  
  // Wait for all requests to complete
  concurrentRequests.forEach((response, index) => {
    const isSuccess = check(response, {
      [`spike request ${index} status is 200`]: (r) => r.status === 200,
      [`spike request ${index} survived spike`]: (r) => r.status < 500,
    });
    
    errorRate.add(!isSuccess);
    responseTime.add(response.timings.duration);
    requestCount.add(1);
  });
}

/**
 * Setup function - runs once before the test
 */
export function setup() {
  console.log('🚀 Starting API Load Testing');
  console.log(`📊 Base URL: ${BASE_URL}`);
  console.log(`⏱️  Test Duration: Various scenarios`);
  console.log(`👥 Max VUs: ${options.scenarios?.stress_test?.stages?.slice(-2)[0]?.target || 100}`);
  
  // Test basic connectivity
  const healthCheck = http.get(`${BASE_URL}/product/list`, { headers: defaultHeaders });
  if (healthCheck.status !== 200) {
    console.error('❌ Health check failed - API may not be running');
  } else {
    console.log('✅ Health check passed');
  }
  
  return { startTime: new Date().toISOString() };
}

/**
 * Teardown function - runs once after the test
 */
export function teardown(data) {
  console.log('🏁 Load testing completed');
  console.log(`📈 Test started at: ${data.startTime}`);
  console.log(`📈 Test completed at: ${new Date().toISOString()}`);
}