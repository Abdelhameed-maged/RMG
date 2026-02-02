# RMG - Product & Invoice Management SPA

A modern, feature-rich single-page application (SPA) built with **Angular 19** and **Angular Material** for managing products and invoices. This application demonstrates professional front-end development practices including authentication, CRUD operations, responsive design, and performance optimization.

![Angular](https://img.shields.io/badge/Angular-19-red?logo=angular)
![Material](https://img.shields.io/badge/Material-Design-blue?logo=material-design)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)

## 🎯 Features

### Core Features
- **🔐 User Authentication** - Secure login system with route guards
- **📦 Product Management** - Complete CRUD operations for products
- **🧾 Invoice Creation** - Dynamic invoice generation with product selection
- **🎨 Material Design** - Modern, polished UI with Angular Material components
- **📱 Responsive Design** - Optimized for desktop and mobile devices
- **⚡ Performance** - Lazy loading and code splitting for optimal performance

### Technical Highlights
- Clean, modular architecture following Angular best practices
- Signal-based state management for reactive UIs
- Standalone components for better tree-shaking
- Functional route guards and interceptors
- JSON Server for simulated REST API
- Comprehensive form validation
- Professional error handling and user feedback

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd RMG
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the application**
   ```bash
   npm start
   ```
   
   This will concurrently start:
   - Angular development server on `http://localhost:4200`
   - JSON Server (fake API) on `http://localhost:3000`

4. **Access the application**
   - Open your browser and navigate to `http://localhost:4200`
   - Use one of the demo credentials to login

### Deployment to Vercel

1. **Install Vercel CLI (optional)**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```
   
   Or connect your GitHub repository to Vercel for automatic deployments:
   - Go to [vercel.com](https://vercel.com)
   - Import your Git repository
   - Vercel will automatically detect Angular and deploy

3. **API Routes**
   The project includes Vercel serverless functions in the `/api` directory that replace json-server in production:
   - `/api/products.json` - Product management API
   - `/api/users.json` - User authentication API
   - `/api/invoices.json` - Invoice management API

### Demo Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@rmg.com | admin123 | Admin |
| user@rmg.com | user123 | User |

## 📁 Project Structure

```
src/
├── app/
│   ├── core/                    # Core services and guards
│   │   ├── guards/              # Route guards (auth, guest)
│   │   ├── interceptors/        # HTTP interceptors
│   │   └── services/            # Core services (auth, products, invoices)
│   ├── features/                # Feature modules
│   │   ├── auth/                # Authentication feature
│   │   │   └── pages/login/     # Login component
│   │   ├── dashboard/           # Dashboard/Home page
│   │   ├── products/            # Product management
│   │   │   └── pages/
│   │   │       ├── product-list/     # Product listing
│   │   │       └── product-form/     # Create/Edit form
│   │   └── invoices/            # Invoice management
│   │       └── pages/
│   │           ├── invoice-list/     # Invoice listing
│   │           └── invoice-create/   # Invoice creation
│   ├── shared/                  # Shared components and models
│   │   ├── components/          # Reusable components
│   │   └── models/              # TypeScript interfaces
│   └── app.routes.ts            # Application routes
├── assets/                      # Static assets
└── material-theme.scss          # Material Design theme
```

## 🏗️ Architecture & Design Decisions

### 1. **Standalone Components**
All components use the standalone API introduced in Angular 15+ for better modularity and tree-shaking.

### 2. **Signal-based State Management**
Utilizes Angular Signals for reactive state management, providing better performance and simpler state updates.

### 3. **Lazy Loading**
Routes are configured with lazy loading to reduce initial bundle size and improve application load time.

### 4. **JSON Server**
Simulates a REST API backend without requiring an actual server, perfect for front-end development and demonstrations.

### 5. **Material Design System**
Consistent, professional UI using Angular Material components with a custom theme.

### 6. **Reactive Forms**
All forms use Angular's reactive forms for better control, validation, and testability.

### 7. **Route Guards**
- `authGuard`: Protects authenticated routes
- `guestGuard`: Prevents authenticated users from accessing login page

## 🎨 Features in Detail

### Authentication
- Simple email/password authentication
- Token-based session management
- Automatic redirection based on auth state
- Protected routes with guards

### Product Management
- View all products in a data table
- Create new products with validation
- Edit existing products
- Delete products with confirmation
- Search and filter capabilities (UI ready)
- Stock level tracking

### Invoice Management
- Create invoices with multiple line items
- Select products from dropdown
- Automatic calculation of subtotal, tax, and total
- Invoice number generation
- Customer information capture
- Invoice status tracking (paid, pending, cancelled)

## 🛠️ Available Scripts

```bash
# Start both Angular dev server and JSON Server
npm start

# Start only Angular dev server
npm run client

# Start only JSON Server
npm run server

# Build for production
npm run build

# Run unit tests
npm run test

# Watch build (development mode)
npm run watch
```

## 📊 API Endpoints (JSON Server)

The JSON Server provides the following endpoints:

- `GET /users` - Get all users
- `GET /products` - Get all products
- `GET /products/:id` - Get product by ID
- `POST /products` - Create new product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product
- `GET /invoices` - Get all invoices
- `GET /invoices/:id` - Get invoice by ID
- `POST /invoices` - Create new invoice
- `DELETE /invoices/:id` - Delete invoice

## 🎯 Best Practices Implemented

1. **Code Organization** - Clear separation of concerns with feature-based structure
2. **Type Safety** - Comprehensive TypeScript interfaces and models
3. **Error Handling** - Graceful error handling with user-friendly messages
4. **Responsive Design** - Mobile-first approach with Material's responsive utilities
5. **Performance** - Lazy loading, OnPush change detection where applicable
6. **Accessibility** - Semantic HTML and Material's built-in accessibility features
7. **Clean Code** - Consistent formatting, clear naming conventions, and comments

## 🚀 Deployment

To deploy this application:

1. **Build for production**
   ```bash
   npm run build
   ```

2. **Deploy the `dist/` folder** to your hosting provider (Vercel, Netlify, Firebase, etc.)

3. **For the backend**, you can:
   - Deploy JSON Server to a cloud platform
   - Replace with a real backend API
   - Use services like Firebase, Supabase, or AWS

### Recommended Hosting Platforms
- **Vercel** - Excellent Angular support with zero configuration
- **Netlify** - Simple deployment with continuous integration
- **Firebase Hosting** - Google's hosting platform with CDN
- **GitHub Pages** - Free hosting for static sites

## 📝 Future Enhancements

- [ ] Advanced search and filtering
- [ ] Export invoices to PDF
- [ ] Email invoice functionality
- [ ] User role management
- [ ] Dark mode toggle
- [ ] Invoice templates
- [ ] Analytics dashboard
- [ ] Unit and E2E tests
- [ ] PWA capabilities
- [ ] Multi-language support

## 👨‍💻 Development

### Code Quality
- Follow Angular style guide
- Use Prettier for code formatting
- Implement ESLint rules
- Write meaningful commit messages

### Testing
```bash
# Run unit tests
npm test

# Run e2e tests (if configured)
npm run e2e
```

## 📄 License

This project was created for the RMG Technical Assignment.

## 🤝 Contributing

This is a technical assignment project. For any questions or suggestions, please contact the repository owner.

---

**Built with ❤️ using Angular 19 and Material Design**

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
