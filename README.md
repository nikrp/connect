# Connect - Student Collaboration Platform

A modern web application designed to help students connect, collaborate, and find opportunities for academic and extracurricular growth.

## Overview

Connect is a platform that facilitates student collaboration by enabling users to post requests, discover opportunities, and communicate directly with peers. Whether you're looking for a teammate for a hackathon, a study partner, or someone to join your club or project, Connect provides the tools to find and coordinate with the right people.

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router and Server Components
- **React 19** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework

### Backend & Database
- **Supabase** - Backend-as-a-Service (BaaS) for authentication, database, and real-time features
- **PostgreSQL** - Relational database (via Supabase)

### UI Components & Libraries
- **shadcn/ui** - Beautifully designed components built on Radix UI
- **Lucide React** - Icon library
- **Heroicons** - Additional icon set

## Key Features

### 🤝 Request Management
- **Create Requests**: Post opportunities for collaboration on projects, competitions, study groups, and more
- **Browse & Search**: Discover relevant requests using tags, keywords, and filters
- **Detailed Views**: View comprehensive information about each collaboration request
- **Data Tables**: Organized display of requests with sorting and filtering capabilities

### 👤 User Profiles
- **Personal Profiles**: Each user has a customizable profile with avatar upload
- **Profile Discovery**: Find and connect with other students
- **Settings Management**: Update account preferences and personal information

### 💬 Communication
- **Notifications**: Stay updated on new opportunities and messages

### 🎨 User Experience
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile devices
- **Sidebar Navigation**: Easy access to all platform features
- **Dark Mode Support**: Theme switching for user preference
- **Onboarding Flow**: Guided setup for new users

### 🔐 Authentication & Security
- **Secure Authentication**: Powered by Supabase Auth
- **Session Management**: Automatic session refresh and middleware protection
- **Protected Routes**: Server-side authentication for secure pages
- **Password Reset**: Self-service password recovery

### 🎯 Additional Features
- **Tag System**: Categorize and filter requests by topics and interests
- **Saved Items**: Bookmark requests for later reference
- **School Integration**: Connect with students from your institution
- **Real-time Updates**: Live data synchronization via Supabase

## Roadmap

### Future Features
- [ ] Email notifications for new messages and matches
- [ ] Group collaboration features
- [ ] Mobile app (React Native)
- [ ] Integration with calendar systems
- [ ] Achievement and reputation system

## Project Purpose

This platform aims to:

- **Facilitate Collaboration**: Enable students to find partners for projects, competitions, study groups, and academic activities
- **Streamline Discovery**: Make it easy to browse and search for relevant opportunities using tags and keywords
- **Enable Direct Communication**: Support direct messaging for efficient coordination
- **Provide Personalized Experience**: Offer intuitive navigation and responsive design across all devices
- **Build Community**: Lower barriers to finding collaborators and foster a supportive student ecosystem

## Project Structure

```
connect/
├── src/
│   ├── app/
│   │   ├── (protected)/       # Protected routes requiring authentication
│   │   │   ├── profile/       # User profile pages
│   │   │   ├── requests/      # Request browsing and management
│   │   │   └── settings/      # User settings
│   │   ├── api/              # API routes
│   │   ├── login/            # Authentication pages
│   │   ├── register/
│   │   └── onboarding/       # New user onboarding flow
│   ├── components/           # React components
│   ├── styles/              # Global styles
│   └── types/               # TypeScript type definitions
├── components/              # Shared component library
│   ├── ui/                 # UI primitives (shadcn/ui)
│   └── react-bits/         # Custom React components
├── lib/                    # Utility functions and configs
│   └── supabase/          # Supabase client configurations
├── contexts/              # React context providers
└── hooks/                 # Custom React hooks
```

## Contributing

This is a Congressional App Challenge project.

## License

This project is developed for the Congressional App Challenge 2025.
