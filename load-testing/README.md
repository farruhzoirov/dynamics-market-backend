# 🚀 API Load Testing Suite

Comprehensive performance testing and benchmarking suite for your NestJS e-commerce API. This suite tests all 45+ endpoints across your application to determine requests per second capacity, response times, error rates, and breaking points.

## 📋 Quick Start

### 1. Prerequisites
- **Node.js** 16+ and npm installed
- **Your NestJS API running** on `http://localhost:5000` (or specify different URL)
- **Terminal/Command Line** access

### 2. One-Command Setup & Run
```bash
# Clone/copy this load-testing directory
cd load-testing

# Make script executable and run all tests
chmod +x setup-and-run.sh
./setup-and-run.sh
```

### 3. Custom Test Scenarios
```bash
# Test specific URL with medium duration
./setup-and-run.sh -u http://your-api.com -d medium

# Run only baseline tests with 20 concurrent users
./setup-and-run.sh -t baseline -c 20

# Stress test to find breaking point
./setup-and-run.sh -t stress

# Full test suite on production API
./setup-and-run.sh -u https://api.yoursite.com -d long -c 50
```

## 🎯 What Gets Tested

### **Critical Business Endpoints** (Revenue Impact)
- ✅ **Product Search** - Primary discovery method (Target: 50+ RPS)
- ✅ **Product Details** - Product page views (Target: 40+ RPS) 
- ✅ **Add to Cart** - Conversion critical (Target: 25+ RPS)
- ✅ **Order Creation** - Revenue critical (Target: 15+ RPS)
- ✅ **Authentication** - User login (Target: 20+ RPS)

### **High Traffic Endpoints** (User Experience)
- ✅ **Category Listing** - Navigation (Target: 40+ RPS)
- ✅ **Cart Management** - Shopping flow (Target: 30+ RPS)
- ✅ **Brand Filtering** - Product discovery (Target: 20+ RPS)
- ✅ **Banner Display** - Homepage content (Target: 25+ RPS)

### **Content & Admin Endpoints**
- ✅ **News & FAQ** - Content browsing (Target: 8+ RPS)
- ✅ **User Profile** - Account management (Target: 15+ RPS)
- ✅ **Order History** - Customer service (Target: 12+ RPS)

## 📊 Test Types Explained

### **Baseline Testing** 
- **Purpose**: Establish normal performance under light load
- **Load**: 10 concurrent users for 2 minutes
- **Measures**: Response times, basic error rates
- **When to use**: Daily performance checks, after deployments

### **Critical Path Testing**
- **Purpose**: Test core user journeys that generate revenue
- **Load**: Simulates realistic user behavior patterns
- **Measures**: Complete user flows from search to purchase
- **When to use**: Before major releases, marketing campaigns

### **Stress Testing**
- **Purpose**: Find breaking points and capacity limits
- **Load**: Gradually increases to 400+ concurrent users
- **Measures**: When does performance degrade? At what load?
- **When to use**: Capacity planning, infrastructure scaling

### **Spike Testing**
- **Purpose**: Test resilience to sudden traffic bursts
- **Load**: Sudden spike from 10 → 200 users in seconds
- **Measures**: Recovery time, error rates during spikes
- **When to use**: Preparing for viral traffic, product launches

## 📈 Understanding Results

### **Key Metrics Explained**

#### **Requests Per Second (RPS)**
```
Excellent: > 150% of target RPS
Good:      > 100% of target RPS  
Acceptable: > 75% of target RPS
Poor:      < 75% of target RPS
```

#### **Response Time Percentiles**
```
P50 (Median): 50% of requests complete in this time
P95:          95% of requests complete in this time  
P99:          99% of requests complete in this time

Target Thresholds:
├── P50: < 500ms
├── P95: < 2000ms  
└── P99: < 5000ms
```

#### **Error Rates**
```
Excellent:  < 0.1% errors
Good:       < 1% errors
Acceptable: < 5% errors  
Critical:   > 5% errors
```

### **Reading Your Reports**

#### **Console Output**
```bash
🔴 Testing Critical Path Endpoints
  Testing Product Search...
    ✅ RPS: 52.3 (expected: 50)
    ✅ P95: 743ms | Avg: 245ms  
    ✅ Success: 99.8% | Errors: 2
```

#### **HTML Reports**
- Open `reports/*.html` files in your browser
- Interactive charts showing response times over time
- Error distribution and success rates
- Detailed request/response analysis

#### **JSON Data**
- Raw metrics in `results/*.json` files
- Can be imported into monitoring tools
- Historical performance tracking

## 🚨 Performance Thresholds

### **Immediate Action Required**
- ❌ **RPS < 50% of target**: Severe capacity issues
- ❌ **P95 > 5000ms**: Unacceptable response times
- ❌ **Error rate > 10%**: System stability issues
- ❌ **Memory/CPU > 90%**: Resource exhaustion

### **Optimization Recommended**  
- ⚠️ **RPS 50-75% of target**: Capacity concerns
- ⚠️ **P95 2000-5000ms**: Slow response times
- ⚠️ **Error rate 1-5%**: Reliability issues
- ⚠️ **Response time increasing**: Performance degradation

### **Good Performance**
- ✅ **RPS > target**: Sufficient capacity
- ✅ **P95 < 2000ms**: Good response times
- ✅ **Error rate < 1%**: High reliability
- ✅ **Consistent performance**: Stable under load

## 🛠 Troubleshooting

### **Common Issues**

#### **"Cannot connect to API"**
```bash
# Check if your API is running
curl http://localhost:5000/category/list

# Start your NestJS application  
npm run start:dev

# Or specify different URL
./setup-and-run.sh -u http://localhost:3000
```

#### **"High error rates"**
- Check database connections (MongoDB, Redis)
- Verify all required services are running
- Check for missing environment variables
- Review API logs for specific errors

#### **"Poor performance"**
- Database may need indexing
- Consider implementing caching
- Check for memory leaks
- Review query optimization

#### **"Tests fail to start"**
```bash
# Install missing dependencies
npm install

# Install Artillery globally
npm install -g artillery

# Install K6 (Ubuntu/Debian)
sudo apt-get install k6
```

### **Getting Help**

#### **Debug Mode**
```bash
# Enable verbose logging
DEBUG=* ./setup-and-run.sh

# Test single endpoint manually
artillery quick --count 5 --num 10 http://localhost:5000/product/search
```

#### **Monitoring During Tests**
```bash
# Monitor system resources
htop

# Monitor API logs
tail -f your-api.log

# Monitor database performance
mongotop # for MongoDB
```

## 🎯 Optimization Priorities

### **Week 1: Quick Wins**
1. **Database Indexing** - Add indexes for frequently queried fields
2. **Response Caching** - Cache product lists, categories, banners
3. **Connection Pooling** - Optimize database connection settings
4. **Query Optimization** - Review slow MongoDB aggregations

### **Week 2-4: Infrastructure**
1. **Redis Caching Layer** - Implement comprehensive caching strategy
2. **Database Optimization** - Query optimization, read replicas
3. **Load Balancing** - Multiple API instances
4. **CDN Integration** - Static asset optimization

### **Month 2: Advanced**
1. **Microservices** - Split monolithic service if needed
2. **Database Sharding** - For massive scale
3. **Elasticsearch Optimization** - Advanced search performance
4. **Auto-scaling** - Dynamic resource allocation

## 📊 Expected Results for E-commerce APIs

### **Healthy Baselines**
```
Product Search:    50+ RPS, P95 < 800ms
Product Details:   40+ RPS, P95 < 600ms
Category Listing:  40+ RPS, P95 < 600ms
Add to Cart:       25+ RPS, P95 < 500ms
Order Creation:    15+ RPS, P95 < 1500ms
```

### **Scaling Targets**
```
Current Capacity:     100 concurrent users
6-Month Target:       500 concurrent users  
Black Friday Ready:   2000+ concurrent users
```

### **Business Impact**
```
1 second delay = 7% reduction in conversions
3+ second load time = 40% user abandonment
99.9% uptime = ~8 hours downtime per year
```

## 📁 File Structure

```
load-testing/
├── setup-and-run.sh              # Main execution script
├── package.json                  # Dependencies
├── critical-path-test.yml        # Artillery critical path config
├── k6-scenarios.js               # K6 advanced testing scenarios  
├── processors/
│   └── critical-path-processor.js # Artillery custom logic
├── custom-load-tests/
│   └── benchmark-suite.js        # Custom Node.js benchmarking
├── results/                      # Test result data
├── reports/                      # Generated HTML reports
└── README.md                     # This file
```

## 🚀 Next Steps

1. **Run Your First Test**
   ```bash
   ./setup-and-run.sh -t baseline
   ```

2. **Analyze Results**
   - Review console output for immediate issues
   - Open HTML reports for detailed analysis
   - Check API logs for error patterns

3. **Implement Optimizations**
   - Start with database indexing
   - Add caching for frequently accessed data
   - Optimize slow queries identified in tests

4. **Validate Improvements** 
   ```bash
   ./setup-and-run.sh -t critical
   ```

5. **Scale Testing**
   ```bash
   ./setup-and-run.sh -d long -c 100
   ```

---

**Ready to find out how many requests your API can handle? Let's test! 🚀**