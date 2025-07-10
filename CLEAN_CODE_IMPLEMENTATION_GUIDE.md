# Clean Code Implementation Guide

## Quick Start: Step-by-Step Refactoring

This guide shows you exactly how to implement clean code principles in your NestJS services.

## Phase 1: Immediate Fixes (Start Today)

### Step 1: Replace Magic Numbers with Constants

**Before:**
```typescript
const limit = body.limit ? body.limit : 12;
const batchSize = 100;
const code = counter.seq.toString().padStart(4, '0');
```

**After:**
```typescript
// Create src/common/constants/application.constants.ts
export const PAGINATION_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 100,
  DEFAULT_BATCH_SIZE: 100,
} as const;

// Use in services
const limit = body.limit || PAGINATION_CONSTANTS.DEFAULT_PAGE_SIZE;
const batchSize = PAGINATION_CONSTANTS.DEFAULT_BATCH_SIZE;
```

### Step 2: Standardize Error Handling

**Before:**
```typescript
catch (err) {
  console.log(`adding product ====>  ${err}`);
  throw new AddingModelException(err.message);
}
```

**After:**
```typescript
// Create ErrorHandlingService (see file created above)
// Use in services:
try {
  // ... operation
} catch (error) {
  this.errorHandler.handleServiceError(error, 'create product', 'ProductService.createProduct');
}
```

### Step 3: Add Input Validation

**Before:**
```typescript
async deleteProduct(body: DeleteProductDto): Promise<void> {
  const checkProduct = await this.productModel.findById(body._id);
  // No validation
}
```

**After:**
```typescript
async deleteProduct(productId: string): Promise<void> {
  this.errorHandler.validateObjectId(productId, 'Product');
  
  const product = await this.productModel.findById(productId);
  if (!product) {
    this.errorHandler.handleNotFound('Product', productId);
  }
  
  await this.productModel.updateOne({ _id: productId }, { isDeleted: true });
}
```

## Phase 2: Service Refactoring

### Step 4: Extract Code Duplication

**Before (Duplicated in multiple services):**
```typescript
if (body.productId) {
  const findProduct = await this.productModel.findById(body.productId).lean();
  if (!findProduct) {
    throw new BadRequestException('Product not found');
  }
  customBody.product = {
    productId: findProduct._id.toString(),
    slugUz: findProduct.slugUz,
    slugRu: findProduct.slugRu,
    slugEn: findProduct.slugEn,
  };
}
```

**After (Centralized validation):**
```typescript
// Use EntityValidationService
const productSummary = await this.entityValidator.validateAndGetProduct(body.productId);
customBody.product = productSummary;
```

### Step 5: Break Down Large Methods

**Before (86-line method):**
```typescript
async searchProductsWithMongoDB(body: SearchProductsDto, lang: string) {
  const regex = new RegExp(body.search, 'i');
  let sort: Record<string, 1 | -1> = { createdAt: -1, views: -1 };
  // ... 80+ more lines
}
```

**After (Split into focused methods):**
```typescript
async searchProductsWithMongoDB(body: SearchProductsDto, lang: string): Promise<Product[]> {
  const searchCriteria = this.buildSearchCriteria(body);
  const pagination = this.buildPagination(body);
  const pipeline = this.buildSearchPipeline(searchCriteria, lang, pagination);
  
  return this.productModel.aggregate(pipeline).exec();
}

private buildSearchCriteria(body: SearchProductsDto): SearchCriteria {
  return {
    regex: new RegExp(body.search, SEARCH_CONSTANTS.CASE_INSENSITIVE_FLAG),
    isDeleted: false,
  };
}

private buildPagination(body: SearchProductsDto): PaginationOptions {
  const limit = body.limit || PAGINATION_CONSTANTS.DEFAULT_PAGE_SIZE;
  const skip = body.page ? (body.page - 1) * limit : 0;
  return { limit, skip };
}
```

### Step 6: Improve Method Naming

**Before:**
```typescript
async getProductList() // Returns {data, total} not just a list
async create() // Create what?
async update() // Update what?
const findProduct = await... // Poor variable naming
```

**After:**
```typescript
async getProductListWithPagination(): Promise<PaginatedResponse<Product>>
async createProduct(productData: CreateProductDto): Promise<Product>
async updateProductById(productId: string, updateData: UpdateProductDto): Promise<Product>
const product = await this.productModel.findById(id); // Clear naming
```

## Phase 3: Architecture Improvements

### Step 7: Single Responsibility Principle

**Before (ProductService doing everything):**
```typescript
export class ProductService {
  async addProduct() { /* CRUD */ }
  async searchProducts() { /* Search logic */ }
  async updateProductViewsInBackground() { /* Analytics */ }
  async indexAllProducts() { /* Elasticsearch */ }
}
```

**After (Split responsibilities):**
```typescript
// Main service focuses on core product operations
export class ProductService {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly searchService: IProductSearchService,
    private readonly analyticsService: IProductAnalyticsService,
  ) {}

  async createProduct(data: CreateProductDto): Promise<Product> {
    const product = await this.productRepository.create(data);
    await this.searchService.indexProduct(product);
    return product;
  }
}

// Separate services for specific concerns
export class ProductSearchService {
  async searchProducts(criteria: SearchCriteria): Promise<SearchResult> {}
  async indexProduct(product: Product): Promise<void> {}
}

export class ProductAnalyticsService {
  async trackView(productId: string, metadata: ViewMetadata): Promise<void> {}
}
```

### Step 8: Consistent Return Types

**Before:**
```typescript
async getProduct(body: GetProductDto) {
  if (!body.slug && !body._id) {
    return {}; // Inconsistent
  }
  return findProduct; // Different type
}
```

**After:**
```typescript
async getProduct(productId: string): Promise<Product | null> {
  if (!productId) {
    throw new BadRequestException('Product ID is required');
  }
  
  const product = await this.productModel.findById(productId);
  return product || null; // Always Product or null
}
```

### Step 9: Repository Pattern

**Before (Direct model access):**
```typescript
constructor(
  @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  @InjectModel(Brand.name) private brandModel: Model<BrandDocument>,
) {}
```

**After (Repository abstraction):**
```typescript
interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  create(data: CreateProductDto): Promise<Product>;
  update(id: string, data: UpdateProductDto): Promise<Product>;
  delete(id: string): Promise<void>;
}

constructor(
  private readonly productRepository: IProductRepository,
  private readonly categoryRepository: ICategoryRepository,
  private readonly brandRepository: IBrandRepository,
) {}
```

## Phase 4: Complete User Service Example

Here's how to refactor the incomplete UserService:

**Before:**
```typescript
export class UserService {
  async getAllUsers() {} // Empty
  async getUserById(userId: string) {} // Empty  
  async updateUserById(id: string, body: UpdateUserDto) {
    try {
      const updateUser = await this.userModel
        .findByIdAndUpdate(id, { $set: body }, { new: true })
        .lean();
      return jwt.sign(updateUser, this.configService.get('CONFIG_JWT').JWT_SECRET_KEY);
    } catch (err) {
      console.error('Error updating user', err.message);
      throw new UpdatingModelException('Error updating user');
    }
  }
  async deleteUserById(userId: string) {} // Empty
}
```

**After:**
```typescript
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name) 
    private readonly userModel: Model<UserDocument>,
    private readonly errorHandler: ErrorHandlingService,
    private readonly jwtService: JwtService,
  ) {}

  async getAllUsers(page = 1, limit = 10): Promise<PaginatedResponse<User>> {
    const { page: validPage, limit: validLimit } = this.errorHandler.validatePaginationParams(page, limit);
    
    try {
      const skip = (validPage - 1) * validLimit;
      const [users, total] = await Promise.all([
        this.userModel
          .find({ isDeleted: false })
          .select('-password -__v')
          .skip(skip)
          .limit(validLimit)
          .lean(),
        this.userModel.countDocuments({ isDeleted: false }),
      ]);

      return {
        data: users,
        total,
        pages: Math.ceil(total / validLimit),
        currentPage: validPage,
      };
    } catch (error) {
      this.errorHandler.handleServiceError(error, 'get all users', 'UserService.getAllUsers');
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    this.errorHandler.validateObjectId(userId, 'User');
    
    try {
      const user = await this.userModel
        .findById(userId)
        .where('isDeleted', false)
        .select('-password -__v')
        .lean();
        
      return user || null;
    } catch (error) {
      this.errorHandler.handleServiceError(error, 'get user by ID', 'UserService.getUserById');
    }
  }

  async updateUserById(userId: string, updateData: UpdateUserDto): Promise<string> {
    this.errorHandler.validateObjectId(userId, 'User');
    this.validateUpdateData(updateData);

    try {
      const existingUser = await this.getUserById(userId);
      if (!existingUser) {
        this.errorHandler.handleNotFound('User', userId);
      }

      const updatedUser = await this.userModel
        .findByIdAndUpdate(
          userId, 
          { $set: updateData }, 
          { new: true, lean: true }
        )
        .select('-password -__v');

      this.logger.log(`User updated successfully: ${userId}`);
      
      return this.jwtService.generateToken(updatedUser);
    } catch (error) {
      this.errorHandler.handleServiceError(error, 'update user', 'UserService.updateUserById');
    }
  }

  async deleteUserById(userId: string): Promise<void> {
    this.errorHandler.validateObjectId(userId, 'User');

    try {
      const user = await this.getUserById(userId);
      if (!user) {
        this.errorHandler.handleNotFound('User', userId);
      }

      await this.userModel.updateOne(
        { _id: userId }, 
        { isDeleted: true, deletedAt: new Date() }
      );

      this.logger.log(`User soft deleted: ${userId}`);
    } catch (error) {
      this.errorHandler.handleServiceError(error, 'delete user', 'UserService.deleteUserById');
    }
  }

  private validateUpdateData(data: UpdateUserDto): void {
    if (data.email && !this.isValidEmail(data.email)) {
      this.errorHandler.handleValidationError('Invalid email format');
    }
    
    if (data.phone && !this.isValidPhone(data.phone)) {
      this.errorHandler.handleValidationError('Invalid phone format');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s-()]+$/;
    return phoneRegex.test(phone);
  }
}
```

## Implementation Checklist

### Week 1: Foundation
- [ ] Create `application.constants.ts` with all magic numbers/strings
- [ ] Implement `ErrorHandlingService`
- [ ] Implement `EntityValidationService`  
- [ ] Replace all `console.log/error` with proper logging

### Week 2: Service Refactoring
- [ ] Add input validation to all public methods
- [ ] Extract duplicated code into shared services
- [ ] Break down methods longer than 20 lines
- [ ] Standardize return types (no empty objects)

### Week 3: Architecture
- [ ] Split ProductService into focused services
- [ ] Complete empty method implementations
- [ ] Implement repository pattern
- [ ] Add comprehensive TypeScript types

### Week 4: Testing & Validation
- [ ] Unit tests for refactored services
- [ ] Integration tests for critical paths
- [ ] Performance testing
- [ ] Code review and documentation

## Benefits You'll See Immediately

1. **Fewer Bugs**: Input validation catches errors early
2. **Easier Debugging**: Consistent error handling with proper logging
3. **Faster Development**: No more code duplication
4. **Better Testing**: Smaller, focused methods are easier to test
5. **Improved Maintenance**: Clear separation of concerns

## Quick Wins (30 minutes each)

1. **Replace magic numbers**: Find/replace all hardcoded values
2. **Add input validation**: Use ErrorHandlingService in existing methods
3. **Improve naming**: Rename unclear variables and methods
4. **Extract constants**: Move all hardcoded strings to constants file
5. **Standardize errors**: Replace all console.log with proper error handling

Start with these quick wins to see immediate improvements in code quality!