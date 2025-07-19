# 🕊️ Words Unheard — Whispering Network

⊹︶⊹︶︶⊹︶︶⊹︶︶୨୧︶︶⊹︶︶⊹︶︶⊹︶⊹  
A poetic, anonymous message-sharing platform —  
inspired by **NGL**, **SendTheSong**, and **The Unsent Project**  
designed for soft expression, emotional release, and elegant anonymity.  
Built with a **custom React + Express + Vite fullstack setup** using **TypeScript**, **TailwindCSS**, and **Drizzle ORM**.  
⊹︶⊹︶︶⊹︶︶⊹︶︶୨୧︶︶⊹︶︶⊹︶︶⊹︶⊹  

░░░███████╗░░██╗░░░░██╗░░░░░░  
░░░██╔════╝░░██║░░░░██║░░░░░░  
░░░█████╗░░░░██║░░░░██║░░░░░░  
░░░██╔══╝░░░░██║░░░░██║░░░░░░  
░░░██║░░░██╗░██║██╗░██║░░░░░░  
░░░╚═╝░░░╚═╝░╚═╝╚═╝░╚═╝░░░░░░  

⊹︶⊹︶︶⊹︶︶⊹︶︶୨୧︶︶⊹︶︶⊹︶︶⊹︶⊹  

## (💡) Features Overview:

(💌) **Anonymous Messaging System**  
- 2000 character limit  
- Optional name field  
- Optional Spotify song link  
- Category dropdown with color-coded tags  
- Public or Private message toggle  
- Recipient dropdown (admin nicknames)  

(📋) **Category Tags Include:**  
- Random, Rants, Advice, Confession, Memory, Ghost, Love Letter, Apology, Hope, Dream, Regret, Unsent, Expression  

(🔍) **Public Dashboard**  
- Displays all public messages  
- Sorted by **latest to oldest**  
- **Search** messages by keyword  

(💬) **Threaded Comments (Optional)**  
- Users can reply to public messages  
- Original posters can delete their own comments  
- Admins can delete any post or comment  

(🔐) **Admin Login System**  
- Code-based login using placeholders like `"username"` / `"password"`  
- Full or limited access depending on role  

(🧠) **Admin Dashboard**  
- View all messages (public + private)  
- Filter by category, sender, date, or recipient  
- Spotify preview embedded inside each message  
- Quote-style modal view for screenshot sharing  
- Downloadable message image format  

(👑) **Main Admin Privileges**  
- Add/Edit/Delete admin accounts  
- Manage nickname dropdown for senders  
- Control message visibility  
- View and moderate all comments  

⊹︶⊹︶︶⊹︶︶⊹︶︶୨୧︶︶⊹︶︶⊹︶︶⊹︶⊹  

## (⚙️) Tech Stack:

- **Frontend:** React + Vite + TypeScript  
- **Styling:** Tailwind CSS, Radix UI, Framer Motion  
- **Backend:** Express.js (Node.js), Drizzle ORM  
- **Database:** Supabase or Neon (PostgreSQL)  
- **Auth:** Passport.js  
- **Deployment:** Render, Replit  

> 💾 State managed for:  
> - Messages  
> - Admin credentials  
> - Recipient nicknames  
> - Public visibility and moderation  
> - Spotify metadata  

⊹︶⊹︶︶⊹︶︶⊹︶︶୨୧︶︶⊹︶︶⊹︶︶⊹︶⊹  

## (📁) Project Structure:

```bash
/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── main.tsx
│   │   └── index.html
├── server/
│   ├── db.ts
│   ├── index.ts
│   ├── routes.ts
│   ├── storage.ts
│   └── vite.ts
├── shared/
│   └── schema.ts
├── .gitignore
├── .replit
├── components.json
├── drizzle.config.ts
├── package-lock.json
├── package.json
├── postcss.config.js
├── readme.txt
├── render.yaml
├── replit.md
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

⊹︶⊹︶︶⊹︶︶⊹︶︶୨୧︶︶⊹︶︶⊹︶︶⊹︶⊹  

## (🚀) Getting Started:

```bash
# 1. Clone the repository
git clone https://github.com/your-username/whispering-network.git  
cd whispering-network

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

- Frontend: http://localhost:5173  
- Backend: http://localhost:3000  

```env
# .env file example
DATABASE_URL=your_postgres_connection_string
SESSION_SECRET=your_session_secret
```

⊹︶⊹︶︶⊹︶︶⊹︶︶୨୧︶︶⊹︶︶⊹︶︶⊹︶⊹  

> _Built with silence, longing, and voices that only needed to be heard once._
