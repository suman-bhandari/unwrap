
# 🎁 Unwrap - Magical Gift Experiences

Transform any moment into a magical surprise with Unwrap! Create digital gift experiences by uploading reservation details, adding personal messages or videos, and scheduling them for perfect delivery moments.

![Unwrap Hero](https://via.placeholder.com/800x400/FF6B6B/FFFFFF?text=Unwrap+🎁)

## ✨ Features

- **🎬 Video Messages**: Record personal video messages with webcam
- **📸 Rich Media**: Upload images, QR codes, and reservation details  
- **⏰ Smart Scheduling**: Schedule gifts for future delivery
- **🎭 Magical Unwrapping**: Beautiful animated gift opening experience
- **📧 Email Delivery**: Automatic email notifications to recipients
- **📱 Mobile Optimized**: Responsive design that works everywhere
- **🎨 Modern UI**: Beautiful interface with smooth animations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Resend account (for emails)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd unwrap
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your credentials:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
   
   # Resend Configuration
   RESEND_API_KEY=your_resend_api_key_here
   
   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up Supabase database**
   
   Run the SQL commands in `database/schema.sql` in your Supabase SQL editor to create the necessary tables and policies.

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
unwrap/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Landing page
│   │   ├── login/             # Authentication
│   │   ├── create/            # Gift creation
│   │   └── gift/[id]/         # Gift unwrapping
│   ├── components/            # Reusable components
│   │   ├── ui/                # Shadcn/ui components
│   │   ├── GiftBox.tsx        # Animated gift box
│   │   ├── VideoRecorder.tsx  # Video recording
│   │   └── FileUpload.tsx     # File upload handling
│   └── lib/                   # Utilities and configuration
│       ├── supabase.ts        # Supabase client
│       ├── email.ts           # Email templates
│       └── types.ts           # TypeScript types
├── database/
│   └── schema.sql             # Database schema
└── public/                    # Static assets
```

## 🎨 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui
- **Animations**: Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Email**: Resend
- **Forms**: React Hook Form + Zod
- **Video**: React Webcam

## 📱 User Flows

### 🎁 Creating a Gift

1. **Sign up/Login** - Quick authentication with email or Google
2. **Recipient Details** - Enter recipient email and gift title
3. **Upload Content** - Add images, QR codes, reservation details
4. **Personal Touch** - Write a message or record a video
5. **Schedule & Send** - Choose delivery time and send

### 🎉 Receiving a Gift

1. **Email Notification** - Beautiful email with gift preview
2. **Gift Page** - Animated gift box with countdown (if scheduled)
3. **Unwrapping** - Magical opening animation with confetti
4. **Gift Content** - View message, video, and gift details
5. **Thank You** - Option to send thanks to the sender

## 🔧 Configuration

### Supabase Setup

1. Create a new Supabase project
2. Run the SQL schema from `database/schema.sql`
3. Enable Row Level Security (RLS)
4. Configure authentication providers (email, Google, etc.)
5. Set up storage buckets for file uploads

### Resend Setup

1. Sign up for Resend
2. Get your API key
3. Verify your domain (for production)
4. Configure email templates

### Google OAuth (Optional)

1. Create Google OAuth app
2. Add redirect URIs in Google Console
3. Configure in Supabase Auth settings

## 🎯 Key Features Implementation

### Animated Gift Box
- 3D CSS transforms for realistic gift box
- Framer Motion for smooth animations
- Interactive hover effects
- Opening sequence with confetti

### Video Recording
- WebRTC for camera access
- MediaRecorder API for recording
- File compression and preview
- 60-second duration limit

### File Uploads
- Drag & drop interface
- Multiple file support
- File type and size validation
- Preview thumbnails

### Email Templates
- Responsive HTML emails
- Animated gift box preview
- Scheduled delivery support
- Thank you notifications

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Framer Motion](https://www.framer.com/motion/) for smooth animations
- [Supabase](https://supabase.com/) for backend infrastructure
- [Resend](https://resend.com/) for email delivery
- [Lucide](https://lucide.dev/) for icons

## 📞 Support

If you have any questions or need help setting up the project:

- Open an issue on GitHub
- Check the documentation
- Review the example environment file

---

Made with ❤️ for creating magical moments# Deployment Status
