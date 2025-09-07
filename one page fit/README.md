# 🏋️ Gym TODO - Workout Planner

A simple, mobile-first workout planning app built with React, TypeScript, and Tailwind CSS. Perfect for tracking your gym exercises with a clean, intuitive interface.

## ✨ Features

### 📱 **Mobile-First Design**
- Responsive design optimized for mobile devices
- Touch-friendly interface with smooth animations
- Collapsible exercise cards for better space utilization

### 🏃‍♂️ **Exercise Management**
- **Add exercises** with detailed information (series, reps, weight, rest time)
- **Collapsible cards** - see exercise name at a glance, expand for full details
- **Inline editing** - modify exercises directly in the expanded view
- **Duplicate last** - quickly add similar exercises

### 📁 **Section Organization**
- **Create sections** to group related exercises (e.g., "Warm-up", "Main Exercises")
- **Insert sections** between existing exercises via context menu
- **Delete sections** with confirmation
- **Visual separation** with clear section headers

### 🔄 **Smart Reordering**
- **Long press** (500ms) on any exercise or section to open context menu
- **Move options**: Up, Down, Move to Top, Move to Bottom
- **Smooth animations** for all interactions
- **No interference** with native browser gestures

### 🍔 **Advanced Menu**
- **Burger menu** in header to avoid accidental clicks
- **Copy workout plan** - export your entire workout as formatted text
- **Clear all** - reset your workout with confirmation
- **Animated dropdown** with smooth transitions

### 💾 **Data Persistence**
- **Automatic saving** to localStorage
- **Data persists** across browser sessions
- **No data loss** when closing/refreshing the page

### 🎨 **User Experience**
- **Smooth animations** throughout the app
- **Context menus** with beautiful fade-in/out effects
- **Header hide/show** on scroll for more content space
- **Floating Action Button** (FAB) for adding exercises
- **Bottom sheet** composer panel with slide animations

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd one-page-fit-exercise/one\ page\ fit
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start development server**
   ```bash
   pnpm dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
pnpm build
```

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Lucide React** - Icons
- **Local Storage** - Data persistence

## 📱 How to Use

### Adding Exercises
1. Tap the **"+"** button (FAB) at bottom right
2. Fill in exercise details (name, series, reps, weight, rest)
3. Tap **"Add"** or press Enter

### Organizing Workouts
1. **Long press** any exercise or section
2. Choose from movement options or section management
3. Use **"Copy workout plan"** to share your workout

### Managing Sections
1. Add section title in the composer panel
2. Tap **"Add section"** to create a new group
3. Long press exercises to insert sections above them

## 🎯 Use Cases

- **Gym workouts** - Track exercises, sets, and rest times
- **Home training** - Organize bodyweight exercises
- **Personal training** - Share workout plans with clients
- **Progress tracking** - Keep detailed exercise logs
- **Workout sharing** - Export and share routines

## 🔧 Development

### Project Structure
```
src/
├── components/ui/     # shadcn/ui components
├── hooks/            # Custom React hooks
├── types.ts          # TypeScript type definitions
├── App.tsx           # Main application component
└── main.tsx          # Application entry point
```

### Key Features Implementation
- **Local Storage Hook** (`useLocalList.ts`) - Manages exercise data persistence
- **Context Menus** - Long press interactions with smooth animations
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Type Safety** - Full TypeScript coverage with discriminated unions

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Built with ❤️ for fitness enthusiasts who want a simple, effective workout planning tool.**