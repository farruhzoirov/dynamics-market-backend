const axios = require('axios');
const Table = require('cli-table3');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

class APIBenchmarkSuite {
  constructor(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl;
    this.results = new Map();
    this.authToken = null;
    this.testData = {
      productIds: [],
      categoryIds: [],
      brandIds: [],
      userToken: null,
    };
    
    // Default test configuration
    this.config = {
      concurrent: 10,
      totalRequests: 100,
      warmupRequests: 10,
      timeout: 30000,
    };
  }

  /**
   * Main benchmark execution
   */
  async runFullBenchmark() {
    console.log(chalk.blue('🚀 Starting API Benchmark Suite\n'));
    console.log(chalk.gray(`Base URL: ${this.baseUrl}`));
    console.log(chalk.gray(`Concurrent Users: ${this.config.concurrent}`));
    console.log(chalk.gray(`Requests per Endpoint: ${this.config.totalRequests}\n`));

    try {
      // Setup test environment
      await this.setupTestEnvironment();
      
      // Run all endpoint tests
      await this.benchmarkCriticalEndpoints();
      await this.benchmarkProductEndpoints();
      await this.benchmarkShoppingFlowEndpoints();
      await this.benchmarkContentEndpoints();
      await this.benchmarkAdminEndpoints();
      
      // Generate comprehensive report
      this.generateReport();
      this.exportResults();
      
    } catch (error) {
      console.error(chalk.red('❌ Benchmark failed:'), error.message);
    }
  }

  /**
   * Setup test environment and gather test data
   */
  async setupTestEnvironment() {
    console.log(chalk.yellow('📋 Setting up test environment...'));
    
    try {
      // Test connectivity
      await this.testConnectivity();
      
      // Warm up the server
      await this.warmupServer();
      
      console.log(chalk.green('✅ Test environment ready\n'));
    } catch (error) {
      throw new Error(`Setup failed: ${error.message}`);
    }
  }

  /**
   * Test basic connectivity
   */
  async testConnectivity() {
    try {
      const response = await axios.post(`${this.baseUrl}/category/list`, {
        page: 1,
        limit: 5
      }, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': 'uz',
          'App-Type': 'user'
        }
      });
      
      if (response.status !== 200) {
        throw new Error(`Server returned status ${response.status}`);
      }
    } catch (error) {
      throw new Error(`Cannot connect to API: ${error.message}`);
    }
  }

  /**
   * Warm up server with preliminary requests
   */
  async warmupServer() {
    console.log(chalk.gray('🔥 Warming up server...'));
    
    const warmupEndpoints = [
      { method: 'POST', url: '/category/list', data: { page: 1, limit: 5 } },
      { method: 'POST', url: '/brand/list', data: { page: 1, limit: 5 } },
      { method: 'POST', url: '/product/list', data: { page: 1, limit: 5 } },
    ];

    for (const endpoint of warmupEndpoints) {
      try {
        await axios.post(this.baseUrl + endpoint.url, endpoint.data, {
          headers: this.getDefaultHeaders(),
          timeout: 10000,
        });
      } catch (error) {
        console.log(chalk.yellow(`⚠️  Warmup warning for ${endpoint.url}: ${error.message}`));
      }
    }
  }

  /**
   * Benchmark critical business endpoints
   */
  async benchmarkCriticalEndpoints() {
    console.log(chalk.blue('🔴 Testing Critical Path Endpoints'));
    
    const criticalEndpoints = [
      {
        name: 'Product Search',
        method: 'POST',
        url: '/product/search',
        data: { search: 'phone', page: 1, limit: 12 },
        priority: 'CRITICAL',
        expectedRps: 50,
      },
      {
        name: 'Product Details',
        method: 'POST', 
        url: '/product/get-product',
        data: { _id: '507f1f77bcf86cd799439011' },
        priority: 'CRITICAL',
        expectedRps: 40,
      },
      {
        name: 'Product List',
        method: 'POST',
        url: '/product/list',
        data: { page: 1, limit: 12 },
        priority: 'CRITICAL',
        expectedRps: 35,
      },
      {
        name: 'Category List',
        method: 'POST',
        url: '/category/list',
        data: { page: 1, limit: 20 },
        priority: 'HIGH',
        expectedRps: 30,
      },
    ];

    for (const endpoint of criticalEndpoints) {
      await this.benchmarkEndpoint(endpoint);
    }
  }

  /**
   * Benchmark product-related endpoints
   */
  async benchmarkProductEndpoints() {
    console.log(chalk.blue('🛒 Testing Product Endpoints'));
    
    const productEndpoints = [
      {
        name: 'Banner List',
        method: 'POST',
        url: '/banner/list',
        data: { page: 1, limit: 5 },
        priority: 'HIGH',
        expectedRps: 25,
      },
      {
        name: 'Brand List',
        method: 'POST',
        url: '/brand/list',
        data: { page: 1, limit: 20 },
        priority: 'MEDIUM',
        expectedRps: 20,
      },
    ];

    for (const endpoint of productEndpoints) {
      await this.benchmarkEndpoint(endpoint);
    }
  }

  /**
   * Benchmark shopping flow endpoints
   */
  async benchmarkShoppingFlowEndpoints() {
    console.log(chalk.blue('🛍️ Testing Shopping Flow Endpoints'));
    
    // Note: These would require authentication in real scenarios
    const shoppingEndpoints = [
      {
        name: 'Cart List',
        method: 'POST',
        url: '/cart/list',
        data: { page: 1, limit: 10 },
        priority: 'HIGH',
        expectedRps: 15,
        requiresAuth: true,
      },
      {
        name: 'User Profile',
        method: 'POST',
        url: '/user/get-user',
        data: {},
        priority: 'MEDIUM',
        expectedRps: 10,
        requiresAuth: true,
      },
    ];

    for (const endpoint of shoppingEndpoints) {
      if (endpoint.requiresAuth) {
        console.log(chalk.yellow(`⚠️  Skipping ${endpoint.name} - requires authentication`));
        continue;
      }
      await this.benchmarkEndpoint(endpoint);
    }
  }

  /**
   * Benchmark content endpoints
   */
  async benchmarkContentEndpoints() {
    console.log(chalk.blue('📰 Testing Content Endpoints'));
    
    const contentEndpoints = [
      {
        name: 'News List',
        method: 'POST',
        url: '/news/list',
        data: { page: 1, limit: 10 },
        priority: 'LOW',
        expectedRps: 8,
      },
      {
        name: 'FAQ List',
        method: 'POST',
        url: '/faq/list',
        data: { page: 1, limit: 10 },
        priority: 'LOW',
        expectedRps: 8,
      },
    ];

    for (const endpoint of contentEndpoints) {
      await this.benchmarkEndpoint(endpoint);
    }
  }

  /**
   * Benchmark admin endpoints (if accessible)
   */
  async benchmarkAdminEndpoints() {
    console.log(chalk.blue('⚙️ Testing Admin Endpoints'));
    console.log(chalk.yellow('⚠️  Skipping admin endpoints - require authentication'));
  }

  /**
   * Benchmark individual endpoint
   */
  async benchmarkEndpoint(endpointConfig) {
    console.log(chalk.gray(`  Testing ${endpointConfig.name}...`));
    
    const results = {
      endpoint: endpointConfig.name,
      url: endpointConfig.url,
      priority: endpointConfig.priority,
      expectedRps: endpointConfig.expectedRps,
      responseTimes: [],
      errors: 0,
      statusCodes: new Map(),
      startTime: Date.now(),
      endTime: null,
      totalRequests: this.config.totalRequests,
      concurrency: this.config.concurrent,
    };

    try {
      // Run concurrent requests
      const batches = Math.ceil(this.config.totalRequests / this.config.concurrent);
      
      for (let batch = 0; batch < batches; batch++) {
        const requestsInThisBatch = Math.min(
          this.config.concurrent,
          this.config.totalRequests - (batch * this.config.concurrent)
        );
        
        const promises = [];
        for (let i = 0; i < requestsInThisBatch; i++) {
          promises.push(this.makeRequest(endpointConfig, results));
        }
        
        await Promise.all(promises);
        
        // Small delay between batches to avoid overwhelming the server
        if (batch < batches - 1) {
          await this.sleep(50);
        }
      }
      
      results.endTime = Date.now();
      this.calculateMetrics(results);
      this.results.set(endpointConfig.name, results);
      
      // Show immediate results
      this.showEndpointResult(results);
      
    } catch (error) {
      console.log(chalk.red(`    ❌ Failed: ${error.message}`));
      results.error = error.message;
      this.results.set(endpointConfig.name, results);
    }
  }

  /**
   * Make individual HTTP request and record metrics
   */
  async makeRequest(endpointConfig, results) {
    const startTime = process.hrtime.bigint();
    
    try {
      const response = await axios({
        method: endpointConfig.method,
        url: this.baseUrl + endpointConfig.url,
        data: endpointConfig.data,
        headers: this.getDefaultHeaders(),
        timeout: this.config.timeout,
      });
      
      const endTime = process.hrtime.bigint();
      const responseTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
      
      results.responseTimes.push(responseTime);
      this.incrementStatusCode(results.statusCodes, response.status);
      
    } catch (error) {
      const endTime = process.hrtime.bigint();
      const responseTime = Number(endTime - startTime) / 1000000;
      
      results.responseTimes.push(responseTime);
      results.errors++;
      
      if (error.response) {
        this.incrementStatusCode(results.statusCodes, error.response.status);
      } else {
        this.incrementStatusCode(results.statusCodes, 'NETWORK_ERROR');
      }
    }
  }

  /**
   * Calculate performance metrics
   */
  calculateMetrics(results) {
    const responseTimes = results.responseTimes.sort((a, b) => a - b);
    const totalTime = (results.endTime - results.startTime) / 1000; // seconds
    
    results.metrics = {
      totalDuration: totalTime,
      requestsPerSecond: results.totalRequests / totalTime,
      avgResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
      minResponseTime: responseTimes[0],
      maxResponseTime: responseTimes[responseTimes.length - 1],
      p50: this.percentile(responseTimes, 50),
      p90: this.percentile(responseTimes, 90),
      p95: this.percentile(responseTimes, 95),
      p99: this.percentile(responseTimes, 99),
      errorRate: (results.errors / results.totalRequests) * 100,
      successRate: ((results.totalRequests - results.errors) / results.totalRequests) * 100,
    };
  }

  /**
   * Calculate percentile
   */
  percentile(sortedArray, p) {
    const index = Math.ceil((p / 100) * sortedArray.length) - 1;
    return sortedArray[index] || 0;
  }

  /**
   * Show individual endpoint result
   */
  showEndpointResult(results) {
    const metrics = results.metrics;
    const rpsStatus = metrics.requestsPerSecond >= results.expectedRps ? '✅' : '⚠️';
    const errorStatus = metrics.errorRate < 5 ? '✅' : '❌';
    const responseStatus = metrics.p95 < 2000 ? '✅' : '⚠️';
    
    console.log(chalk.gray(`    ${rpsStatus} RPS: ${metrics.requestsPerSecond.toFixed(1)} (expected: ${results.expectedRps})`));
    console.log(chalk.gray(`    ${responseStatus} P95: ${metrics.p95.toFixed(0)}ms | Avg: ${metrics.avgResponseTime.toFixed(0)}ms`));
    console.log(chalk.gray(`    ${errorStatus} Success: ${metrics.successRate.toFixed(1)}% | Errors: ${results.errors}`));
    console.log('');
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    console.log(chalk.blue('\n📊 COMPREHENSIVE PERFORMANCE REPORT\n'));
    
    // Summary table
    const summaryTable = new Table({
      head: [
        chalk.white('Endpoint'),
        chalk.white('Priority'),
        chalk.white('RPS'),
        chalk.white('Expected'),
        chalk.white('P95 (ms)'),
        chalk.white('Success %'),
        chalk.white('Status')
      ],
      colWidths: [20, 10, 8, 10, 10, 10, 8]
    });

    let totalEndpoints = 0;
    let criticalPassing = 0;
    let totalPassing = 0;

    for (const [name, result] of this.results) {
      if (!result.metrics) continue;
      
      totalEndpoints++;
      const metrics = result.metrics;
      const rpsGood = metrics.requestsPerSecond >= result.expectedRps;
      const responseGood = metrics.p95 < 2000;
      const errorGood = metrics.errorRate < 5;
      const overallGood = rpsGood && responseGood && errorGood;
      
      if (overallGood) {
        totalPassing++;
        if (result.priority === 'CRITICAL') criticalPassing++;
      }
      
      const status = overallGood ? chalk.green('✅ PASS') : chalk.red('❌ FAIL');
      const rpsColor = rpsGood ? chalk.green : chalk.yellow;
      const responseColor = responseGood ? chalk.green : chalk.yellow;
      const successColor = errorGood ? chalk.green : chalk.red;
      
      summaryTable.push([
        name,
        this.getPriorityColor(result.priority),
        rpsColor(metrics.requestsPerSecond.toFixed(1)),
        result.expectedRps,
        responseColor(metrics.p95.toFixed(0)),
        successColor(metrics.successRate.toFixed(1)),
        status
      ]);
    }

    console.log(summaryTable.toString());
    
    // Overall assessment
    console.log(chalk.blue('\n🎯 PERFORMANCE ASSESSMENT\n'));
    
    const overallTable = new Table({
      head: [chalk.white('Metric'), chalk.white('Value'), chalk.white('Status')],
    });
    
    const passRate = (totalPassing / totalEndpoints) * 100;
    const passStatus = passRate >= 80 ? chalk.green('✅ EXCELLENT') : 
                     passRate >= 60 ? chalk.yellow('⚠️ NEEDS IMPROVEMENT') : 
                     chalk.red('❌ POOR');
    
    overallTable.push(['Total Endpoints Tested', totalEndpoints, '']);
    overallTable.push(['Endpoints Passing', `${totalPassing}/${totalEndpoints}`, '']);
    overallTable.push(['Pass Rate', `${passRate.toFixed(1)}%`, passStatus]);
    overallTable.push(['Critical Endpoints OK', criticalPassing, criticalPassing > 0 ? chalk.green('✅') : chalk.red('❌')]);
    
    console.log(overallTable.toString());
    
    // Recommendations
    this.generateRecommendations();
  }

  /**
   * Generate performance recommendations
   */
  generateRecommendations() {
    console.log(chalk.blue('\n💡 RECOMMENDATIONS\n'));
    
    const recommendations = [];
    
    for (const [name, result] of this.results) {
      if (!result.metrics) continue;
      
      const metrics = result.metrics;
      
      if (metrics.requestsPerSecond < result.expectedRps) {
        recommendations.push(`🔴 ${name}: Increase capacity - only ${metrics.requestsPerSecond.toFixed(1)} RPS (need ${result.expectedRps})`);
      }
      
      if (metrics.p95 > 2000) {
        recommendations.push(`🟡 ${name}: Optimize response time - P95 is ${metrics.p95.toFixed(0)}ms`);
      }
      
      if (metrics.errorRate > 5) {
        recommendations.push(`🔴 ${name}: Fix errors - ${metrics.errorRate.toFixed(1)}% error rate`);
      }
      
      if (metrics.avgResponseTime > 1000) {
        recommendations.push(`🟡 ${name}: Average response time too high - ${metrics.avgResponseTime.toFixed(0)}ms`);
      }
    }
    
    if (recommendations.length === 0) {
      console.log(chalk.green('✅ All endpoints performing within acceptable limits!'));
    } else {
      recommendations.forEach(rec => console.log(rec));
    }
    
    console.log(chalk.blue('\n🚀 OPTIMIZATION PRIORITIES:\n'));
    console.log('1. Critical path endpoints (Search, Product Details, Product List)');
    console.log('2. Implement caching for frequently accessed data');
    console.log('3. Optimize database queries and add proper indexing');
    console.log('4. Consider CDN for static content');
    console.log('5. Implement connection pooling and keep-alive');
  }

  /**
   * Export results to JSON file
   */
  exportResults() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `benchmark-results-${timestamp}.json`;
    const filepath = path.join(__dirname, '..', 'results', filename);
    
    // Ensure results directory exists
    const resultsDir = path.dirname(filepath);
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    const exportData = {
      timestamp: new Date().toISOString(),
      config: this.config,
      baseUrl: this.baseUrl,
      results: Object.fromEntries(this.results),
      summary: {
        totalEndpoints: this.results.size,
        averageRps: Array.from(this.results.values())
          .filter(r => r.metrics)
          .reduce((sum, r) => sum + r.metrics.requestsPerSecond, 0) / this.results.size,
      }
    };
    
    fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2));
    console.log(chalk.green(`\n📁 Results exported to: ${filepath}`));
  }

  // Helper methods
  getDefaultHeaders() {
    return {
      'Content-Type': 'application/json',
      'Accept-Language': 'uz',
      'App-Type': 'user',
    };
  }

  incrementStatusCode(map, code) {
    map.set(code, (map.get(code) || 0) + 1);
  }

  getPriorityColor(priority) {
    switch (priority) {
      case 'CRITICAL': return chalk.red(priority);
      case 'HIGH': return chalk.yellow(priority);
      case 'MEDIUM': return chalk.blue(priority);
      case 'LOW': return chalk.gray(priority);
      default: return priority;
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run benchmark if called directly
if (require.main === module) {
  const baseUrl = process.argv[2] || 'http://localhost:5000';
  const benchmark = new APIBenchmarkSuite(baseUrl);
  
  benchmark.runFullBenchmark().catch(console.error);
}

module.exports = APIBenchmarkSuite;