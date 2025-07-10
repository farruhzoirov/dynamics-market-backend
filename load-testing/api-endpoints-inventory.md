# API Endpoints Inventory for Load Testing

## Complete API Endpoint Mapping

Based on controller analysis, here are all API endpoints in your e-commerce application:

### 🛒 **Product Module** (High Traffic Expected)
- `GET /product/index-products` - Index all products to Elasticsearch
- `POST /product/search` - Search products (Primary search endpoint)
- `POST /product/list` - Get product list (Admin/User differentiated)
- `POST /product/get-product` - Get single product details
- `POST /product/add` - Add new product (Admin only)
- `POST /product/update` - Update product (Admin only)
- `POST /product/delete` - Delete product (Admin only)

### 🔐 **Authentication Module** (Critical Path)
- `POST /auth/google` - Google OAuth authentication

### 🛍️ **Cart Module** (High Transaction Volume)
- `POST /cart/list` - Get user's cart items
- `POST /cart/add` - Add item to cart
- `POST /cart/update` - Update cart item quantity
- `POST /cart/delete` - Remove item from cart

### 📦 **Order Module** (Critical Business Logic)
- `POST /order/list` - Get orders list (Admin/User)
- `POST /order/get-order` - Get single order details
- `POST /order/create` - Create new order (Critical path)
- `POST /order/update` - Update order status
- `POST /order/delete` - Delete/cancel order

### 👤 **User Module**
- `POST /user/get-user` - Get user profile
- `POST /user/update` - Update user profile

### 🏷️ **Category Module** (Frequently Accessed)
- `POST /category/list` - Get categories hierarchy
- `POST /category/add` - Add new category
- `POST /category/update` - Update category
- `POST /category/delete` - Delete category

### 🏢 **Brand Module**
- `POST /brand/list` - Get brands list
- `POST /brand/add` - Add new brand
- `POST /brand/update` - Update brand
- `POST /brand/delete` - Delete brand

### 🎯 **Banner Module**
- `POST /banner/list` - Get banners for display
- `POST /banner/add` - Add new banner
- `POST /banner/update` - Update banner
- `POST /banner/delete` - Delete banner

### ⭐ **Review Module**
- `POST /review/add` - Add product review
- `POST /review/update` - Update review
- `POST /review/delete` - Delete review

### 📰 **News Module**
- `POST /news/list` - Get news articles
- `POST /news/add` - Add news article
- `POST /news/get-news` - Get single news article
- `POST /news/update` - Update news
- `POST /news/delete` - Delete news

### ❓ **FAQ Module**
- `POST /faq/list` - Get FAQ list
- `POST /faq/add` - Add FAQ
- `POST /faq/get-faq` - Get single FAQ
- `POST /faq/update` - Update FAQ
- `POST /faq/update-order` - Update FAQ order
- `POST /faq/delete` - Delete FAQ

### 📊 **Order Status Module**
- `POST /order-status/list` - Get order statuses
- `POST /order-status/add` - Add order status
- `POST /order-status/update` - Update order status
- `POST /order-status/update-index` - Update status index
- `POST /order-status/delete` - Delete order status

### 📁 **File Upload Module**
- `POST /file-upload/upload` - Upload files/images
- `POST /file-upload/delete-file` - Delete uploaded file

### 🔗 **AmoCRM Integration**
- `GET /amocrm/code` - AmoCRM integration callback

## Endpoint Classification by Performance Priority

### 🔴 **Critical Path (Highest Priority for Testing)**
1. `POST /auth/google` - User authentication
2. `POST /product/search` - Product search (likely most used)
3. `POST /product/list` - Product listing
4. `POST /product/get-product` - Product details
5. `POST /cart/add` - Add to cart (conversion critical)
6. `POST /order/create` - Place order (revenue critical)

### 🟡 **High Traffic (Secondary Priority)**
1. `POST /cart/list` - View cart
2. `POST /category/list` - Browse categories
3. `POST /brand/list` - Filter by brands
4. `POST /banner/list` - Homepage banners
5. `POST /cart/update` - Modify cart

### 🟢 **Standard Load (Tertiary Priority)**
1. `POST /user/get-user` - User profile
2. `POST /order/list` - Order history
3. `POST /news/list` - Content browsing
4. `POST /faq/list` - Support content

### 🔵 **Admin Operations (Low Traffic, High Resource)**
1. All `/add`, `/update`, `/delete` operations
2. `GET /product/index-products` - Elasticsearch reindexing
3. `POST /file-upload/upload` - File operations

## Expected Traffic Patterns

### **User Journey Load Distribution**
1. **Homepage Load**: 40% - banner/list, product/search, category/list
2. **Product Browsing**: 35% - product/list, product/get-product, brand/list
3. **Shopping Flow**: 15% - cart/add, cart/list, cart/update
4. **Checkout Process**: 8% - order/create, user/get-user
5. **Account Management**: 2% - auth/google, user/update

### **Peak Load Scenarios**
- **Black Friday/Sales**: 10x normal traffic on product endpoints
- **Product Launch**: 5x traffic on specific product/get-product
- **Marketing Campaign**: 3x traffic on search and listing endpoints
- **Mobile App Usage**: Higher proportion of cart/add operations

This inventory will be used to create comprehensive load testing scenarios targeting the most critical business paths.