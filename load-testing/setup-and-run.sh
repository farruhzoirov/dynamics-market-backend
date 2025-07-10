#!/bin/bash

# 🚀 API Load Testing Setup and Execution Script
# This script sets up the testing environment and runs comprehensive load tests

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${BASE_URL:-http://localhost:5000}"
TEST_DURATION="${TEST_DURATION:-short}"  # short, medium, long
CONCURRENT_USERS="${CONCURRENT_USERS:-10}"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check API connectivity
check_api_connectivity() {
    print_status "Checking API connectivity at $BASE_URL..."
    
    if curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/product/list" | grep -q "200\|404\|405"; then
        print_success "API is accessible"
        return 0
    else
        print_error "Cannot connect to API at $BASE_URL"
        print_error "Please ensure your NestJS application is running"
        return 1
    fi
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing load testing dependencies..."
    
    # Install Node.js dependencies
    if [ -f "package.json" ]; then
        npm install
        print_success "Node.js dependencies installed"
    else
        print_error "package.json not found. Please run this script from the load-testing directory"
        exit 1
    fi
    
    # Check for K6
    if ! command_exists k6; then
        print_warning "K6 not found. Installing K6..."
        
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            sudo gpg -k
            sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
            echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
            sudo apt-get update
            sudo apt-get install k6
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            if command_exists brew; then
                brew install k6
            else
                print_error "Please install Homebrew first, then run: brew install k6"
                exit 1
            fi
        else
            print_error "Please install K6 manually from https://k6.io/docs/getting-started/installation/"
            exit 1
        fi
        
        print_success "K6 installed successfully"
    else
        print_success "K6 is already installed"
    fi
    
    # Check for Artillery
    if ! command_exists artillery; then
        print_warning "Artillery not found. Installing globally..."
        npm install -g artillery
        print_success "Artillery installed successfully"
    else
        print_success "Artillery is already installed"
    fi
}

# Function to create results directory
setup_results_directory() {
    mkdir -p results
    mkdir -p reports
    print_success "Results directories created"
}

# Function to run baseline tests
run_baseline_tests() {
    print_status "Running baseline performance tests..."
    
    # Quick connectivity test
    print_status "1. Quick connectivity test"
    artillery quick --count 5 --num 20 "$BASE_URL/category/list" || print_warning "Quick test had some issues"
    
    # Custom benchmark suite
    print_status "2. Running custom benchmark suite"
    node custom-load-tests/benchmark-suite.js "$BASE_URL" || print_warning "Custom benchmark had some issues"
    
    print_success "Baseline tests completed"
}

# Function to run critical path tests
run_critical_path_tests() {
    print_status "Running critical path tests..."
    
    if [ -f "critical-path-test.yml" ]; then
        artillery run critical-path-test.yml --output "results/critical-path-$(date +%Y%m%d-%H%M%S).json"
        print_success "Critical path tests completed"
    else
        print_warning "Critical path test configuration not found"
    fi
}

# Function to run K6 tests
run_k6_tests() {
    print_status "Running K6 advanced scenarios..."
    
    # Set duration based on TEST_DURATION parameter
    case $TEST_DURATION in
        "short")
            export K6_DURATION="1m"
            export K6_VUS="10"
            ;;
        "medium")
            export K6_DURATION="3m"
            export K6_VUS="25"
            ;;
        "long")
            export K6_DURATION="10m"
            export K6_VUS="50"
            ;;
    esac
    
    if [ -f "k6-scenarios.js" ]; then
        BASE_URL="$BASE_URL" k6 run k6-scenarios.js --out json="results/k6-results-$(date +%Y%m%d-%H%M%S).json"
        print_success "K6 tests completed"
    else
        print_warning "K6 test script not found"
    fi
}

# Function to run stress tests
run_stress_tests() {
    print_status "Running stress tests to find breaking point..."
    
    print_warning "Stress tests will push your API to its limits"
    read -p "Continue with stress testing? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [ -f "stress-test.yml" ]; then
            artillery run stress-test.yml --output "results/stress-test-$(date +%Y%m%d-%H%M%S).json"
            print_success "Stress tests completed"
        else
            print_warning "Stress test configuration not found"
        fi
    else
        print_status "Skipping stress tests"
    fi
}

# Function to generate reports
generate_reports() {
    print_status "Generating comprehensive reports..."
    
    # Create HTML reports from Artillery results
    for json_file in results/*.json; do
        if [ -f "$json_file" ]; then
            base_name=$(basename "$json_file" .json)
            artillery report "$json_file" --output "reports/${base_name}.html"
        fi
    done
    
    print_success "Reports generated in the 'reports' directory"
    
    # List generated reports
    echo "Generated reports:"
    ls -la reports/ | grep -E "\.(html|json)$"
}

# Function to show summary
show_summary() {
    print_success "🎉 Load testing completed!"
    echo
    echo "📊 Results Summary:"
    echo "├── Results data: $(ls results/*.json 2>/dev/null | wc -l) files in ./results/"
    echo "├── HTML reports: $(ls reports/*.html 2>/dev/null | wc -l) files in ./reports/" 
    echo "└── Test duration: $(echo $TEST_DURATION | tr '[:lower:]' '[:upper:]')"
    echo
    echo "📋 Next Steps:"
    echo "1. Review HTML reports in ./reports/ directory"
    echo "2. Analyze performance metrics and identify bottlenecks"
    echo "3. Implement optimization recommendations"
    echo "4. Re-run tests to validate improvements"
    echo
    echo "📁 Key Files:"
    echo "├── Latest results: $(ls -t results/*.json 2>/dev/null | head -1)"
    echo "└── Analysis report: ./API_LOAD_TESTING_ANALYSIS.md"
}

# Function to display usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo
    echo "Options:"
    echo "  -u, --url URL          Base URL for API testing (default: http://localhost:5000)"
    echo "  -d, --duration LEVEL   Test duration: short, medium, long (default: short)"
    echo "  -c, --concurrent NUM   Number of concurrent users (default: 10)"
    echo "  -t, --type TYPE        Test type: baseline, critical, k6, stress, all (default: all)"
    echo "  -h, --help            Show this help message"
    echo
    echo "Examples:"
    echo "  $0                                          # Run all tests with defaults"
    echo "  $0 -u http://api.example.com -d medium      # Medium duration test on custom URL"
    echo "  $0 -t baseline -c 20                        # Baseline test with 20 concurrent users"
    echo "  $0 -t stress                                # Only stress testing"
}

# Main execution function
main() {
    local test_type="all"
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -u|--url)
                BASE_URL="$2"
                shift 2
                ;;
            -d|--duration)
                TEST_DURATION="$2"
                shift 2
                ;;
            -c|--concurrent)
                CONCURRENT_USERS="$2"
                shift 2
                ;;
            -t|--type)
                test_type="$2"
                shift 2
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    # Print configuration
    print_status "🚀 Starting API Load Testing Suite"
    echo
    echo "Configuration:"
    echo "├── Base URL: $BASE_URL"
    echo "├── Test Duration: $TEST_DURATION"
    echo "├── Concurrent Users: $CONCURRENT_USERS"
    echo "└── Test Type: $test_type"
    echo
    
    # Check prerequisites
    check_api_connectivity || exit 1
    install_dependencies
    setup_results_directory
    
    # Run tests based on type
    case $test_type in
        "baseline")
            run_baseline_tests
            ;;
        "critical")
            run_critical_path_tests
            ;;
        "k6")
            run_k6_tests
            ;;
        "stress")
            run_stress_tests
            ;;
        "all")
            run_baseline_tests
            run_critical_path_tests
            run_k6_tests
            run_stress_tests
            ;;
        *)
            print_error "Unknown test type: $test_type"
            show_usage
            exit 1
            ;;
    esac
    
    # Generate reports and show summary
    generate_reports
    show_summary
}

# Run main function with all arguments
main "$@"