# 🚀 VitaCoin - Gamified Learning Platform

VitaCoin is an interactive learning platform that transforms education into an engaging experience by rewarding users with coins for their learning activities. Built with Next.js, Firebase, and modern UI components, VitaCoin makes learning fun and rewarding.

## ✨ Key Features

### 🎯 Core Functionality
- **Secure Authentication** - Email/Password and Google OAuth sign-in with Firebase
- **Daily Rewards** - Progressive coin bonuses for consecutive logins
- **Interactive Quizzes** - Daily challenges across multiple categories:
  - Mathematics (Medium difficulty, 1 min/quiz)
  - Aptitude (Hard difficulty, 2 min/quiz)
  - Grammar (Easy difficulty, 1 min/quiz)
  - Programming (Hard difficulty, 2 min/quiz)
- **Badge System** - Collectible badges with various rarities and achievements
- **Streak Mechanics** - Maintain daily streaks with penalties for missed days
- **Real-time Leaderboard** - Compete with other learners globally

### 📊 Learning Analytics
- **Performance Tracking** - Monitor your quiz scores and improvements
- **Coin Analytics** - Visualize your earnings and spending patterns
- **Achievement System** - Unlock badges for milestones and perfect scores
- **Daily Progress** - Track your learning consistency and growth

### 🏆 Rewards & Motivation
- **Streak Bonuses** - Earn more coins for maintaining daily streaks
- **Perfect Scores** - Special rewards for 100% correct answers
- **Category Mastery** - Badges for excelling in specific subjects
- **Motivational System** - Encouraging messages and rewards for consistency

### ⚠️ Penalty System
VitaCoin implements a fair penalty system to encourage consistent engagement and learning habits.

#### Types of Penalties
- **Missed Login Penalty**
  - **10 coins** deducted for each missed day
  - **Login streak resets to 0** when missing a day
  - Maximum of 30 days of penalties applied at once
  - Applied automatically on next login
  - Each penalty is recorded with the specific date it applies to
  - Previous streak length is preserved in transaction history for reference

- **Missed Quiz Penalty**
  - **10 coins** deducted for each day without completing a quiz
  - Separate penalties for each quiz category
  - Applied automatically when checking daily progress

#### Key Features
- **No Negative Balance** - Penalties won't reduce your coins below zero
- **Detailed Transaction History** - Each penalty is logged with date and reason
- **Streak Reset** - Missing a day resets your login streak to 0
- **Transparent Tracking** - Transaction history shows both penalties and streak resets
- **Streak Protection** - Maintain your streaks to avoid penalties
- **Transparent System** - All penalties are clearly visible in your transaction history

#### How Penalties Work
1. **Login Penalties**
   - Checked when you log in
   - Applies to all days since your last login (up to 30 days)
   - Each missed day incurs a 10-coin penalty

2. **Quiz Penalties**
   - Checked daily at 23:59 IST
   - Applies to each category where no quiz was completed
   - Each missed category incurs a 10-coin penalty

#### Avoiding Penalties
1. **Log in daily** to maintain your login streak and avoid login penalties
2. **Complete at least one quiz per day** to avoid quiz penalties
3. **Check the app regularly** to stay on top of your learning goals
4. **View your transaction history** to track any penalties applied

#### Example Scenario
If you miss 3 days of logins and quizzes:
- **Day 1 Missed**: 10 coins penalty (login) + 10 coins (quiz) = 20 coins
- **Day 2 Missed**: 10 coins penalty (login) + 10 coins (quiz) = 20 coins
- **Day 3 Missed**: 10 coins penalty (login) + 10 coins (quiz) = 20 coins

Total penalty: **60 coins** (recorded as separate transactions for each day)

#### Viewing Penalties
All penalties are visible in your transaction history with the following details:
- Date of the penalty
- Amount deducted
- Reason (e.g., "Missed login penalty")
- Category (for quiz penalties)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Firebase project with Firestore and Authentication enabled
- Git for version control

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/JonnalagaddaNihith/VitaCoin.git
   cd VitaCoin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Firebase Configuration

1. Create a new project in the [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password and Google providers
3. Set up Firestore database in production mode
4. Configure your Firebase project:
   - Go to Project Settings
   - Under "Your apps", add a new web app
   - Copy the configuration object

5. Create a `.env.local` file in the root directory and add your Firebase config:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

### Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```
2. Open [http://localhost:3000](http://localhost:3000) in your browser
3. Build for production:
   ```bash
   npm run build
   npm start
   ```

Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# SendGrid Configuration (Optional)
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Initialize Sample Data

Run the initialization script to populate your Firebase with sample quiz questions and badges:

```bash
npx tsx src/scripts/initializeData.ts
```

This will add:
- 20 quiz questions across 4 categories (Math, Aptitude, Grammar, Programming)
- 16 badges (5 purchasable + 11 achievement badges)

### 5. Firebase Security Rules

Update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Allow reading other users' public data for leaderboard
      allow read: if request.auth != null;
      
      // Subcollections
      match /{subcollection=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Public collections
    match /badges/{document} {
      allow read: if request.auth != null;
    }
    
    match /quizQuestions/{document} {
      allow read: if request.auth != null;
    }
    
    match /system/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 6. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to see your VitaCoin app!

## 📱 Usage Guide

### For New Users
1. **Sign Up** - Create account with email/password or Google
2. **Welcome Bonus** - Receive 500 coins upon registration
3. **Daily Login** - Claim daily bonus to build login streak
4. **Take Quizzes** - Complete daily quizzes in all 4 categories
5. **Earn Badges** - Purchase badges or earn them through achievements
6. **Track Progress** - View analytics and transaction history

### Daily Activities
- **Login Bonus**: Claim once per day, increases by 5 coins per streak day

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with by [Your Name]
- Inspired by gamified learning platforms
- Special thanks to all contributors

## Project Structure
```
src/
├── app/                 # Next.js app router
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── Dashboard.tsx   # Main dashboard with tabs
│   ├── BadgeStore.tsx  # Badge management
│   ├── CoinAnalytics.tsx # Analytics charts
│   └── ...
├── lib/
│   ├── firebase.ts     # Firebase configuration & functions
│   ├── email.ts        # SendGrid email functions
│   └── types.ts        # TypeScript interfaces
└── scripts/
    └── initializeData.ts # Sample data initialization
```

### Database Schema
- **users/**: User profiles with coins, streaks, badges
- **users/{uid}/transactions/**: Transaction history
- **users/{uid}/notifications/**: In-app notifications
- **users/{uid}/quizResults/**: Quiz attempt records
- **badges/**: Available badges (purchasable & achievement)
- **quizQuestions/**: Quiz questions by category
- **system/**: System data (leaderboard cache, etc.)

## 🎯 Key Features Explained

### Streak System
- **Login Streaks**: Day 1: 100 coins, Day 2: 105 coins, Day 3: 110 coins...
- **Quiz Streaks**: Separate streaks for each category
- **Penalties**: Coins deducted for missed days with motivational messages

### Badge Categories
- **Purchasable**: Bronze (1000), Silver (2000), Gold (5000), Platinum (10000), Diamond (20000)
- **Login Streaks**: 1, 7, 30, 100 days
- **Quiz Streaks**: 7-day streaks per category
- **Perfect Scores**: Daily, weekly, monthly perfect completion

### Notification System
- **In-app**: Leaderboard changes, achievements, penalties
- **Email**: Daily reminders, streak alerts, badge notifications

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Firebase Hosting
```bash
npm run build
firebase deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the GitHub Issues page
2. Review Firebase and SendGrid documentation
3. Ensure all environment variables are correctly set

---

**Happy Learning with VitaCoin! 🪙📚**
