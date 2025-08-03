# Financial Tracker

A comprehensive React Native budgeting app built with Expo and Firebase, featuring dynamic category management and real-time data synchronization.

## 🚀 Features

### Core Functionality
- **Income & Expense Tracking**: Add, view, and delete financial transactions
- **Dynamic Categories**: Use default categories or create your own custom ones
- **Real-time Sync**: Automatic synchronization with Firebase Firestore
- **Budget Analytics**: View income, expenses, net savings, and savings rate
- **User Authentication**: Secure login with Firebase Auth

### Technical Features
- **TypeScript**: Full type safety throughout the application
- **Zustand State Management**: Lightweight and efficient state management
- **Firebase Integration**: Authentication and Firestore database
- **Offline Support**: Local storage with AsyncStorage
- **Modern UI**: Clean, intuitive interface with React Native

## 📱 Screens

### Home Dashboard
- Overview of monthly income, expenses, and net savings
- Quick action buttons for common tasks
- Recent transactions list
- Savings rate calculation

### Transactions Screen
- Add new income or expense transactions
- View all transactions with details
- Delete transactions with confirmation
- Category selection with visual indicators
- Transaction type toggle (Income/Expense)

## 🏗️ Architecture

### Models
- **Transaction**: Base class for all financial transactions
- **Income**: Extends Transaction with income-specific methods
- **Expense**: Extends Transaction with expense-specific methods
- **Budget**: Manages collections of transactions and provides analytics
- **CategoryManager**: Handles dynamic category creation and management

### State Management
- **Zustand Store**: Centralized state management with persistence
- **Firebase Sync**: Automatic data synchronization
- **Error Handling**: Comprehensive error management

### Database Structure
```
users/
  {userId}/
    budgets/
      {budgetId}/
        data: JSON string of budget data
        updatedAt: timestamp
```

## 🛠️ Setup

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI
- Firebase project with Authentication and Firestore enabled

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Firebase:
   - Add your Firebase config to `firebase.ts`
   - Set up environment variables for Firebase credentials

4. Start the development server:
   ```bash
   npx expo start
   ```

### Environment Variables
Create a `.env` file with your Firebase configuration:
```
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_DATABASE=your_database_url
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 📊 Usage

### Adding Transactions
1. Navigate to the Transactions screen
2. Tap the "+" button
3. Choose transaction type (Income or Expense)
4. Fill in the details:
   - Name (required)
   - Description (optional)
   - Amount (required)
   - Category (required)
5. Tap "Add Transaction"

### Managing Categories
- **Default Categories**: Pre-built categories for common transactions
- **Custom Categories**: Create your own categories with custom colors
- **Category Types**: Income, Expense, or Both

### Viewing Analytics
- **Home Screen**: Monthly overview with key metrics
- **Transactions List**: Detailed view of all transactions
- **Real-time Updates**: Changes sync automatically across devices

## 🔧 Customization

### Adding New Categories
The system supports dynamic category creation. Users can:
- Create custom categories with unique names
- Choose category types (Income/Expense/Both)
- Select custom colors for visual distinction
- Delete custom categories (default categories are protected)

### Extending the System
The modular architecture makes it easy to add new features:
- New transaction types
- Additional analytics
- Custom reporting
- Export functionality

## 🚀 Deployment

### Expo Build
```bash
npx expo build:android
npx expo build:ios
```

### Firebase Deployment
Ensure your Firebase project is properly configured with:
- Authentication enabled
- Firestore database created
- Security rules configured

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support or questions, please open an issue in the repository.
