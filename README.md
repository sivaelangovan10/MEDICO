# MEDICO — Vercel-ready project

This project keeps the existing HTML/CSS/Vanilla JavaScript frontend and the Express/Mongoose backend. The frontend is served as static files by Vercel; `/api/*` requests are routed to the Express serverless function in `api/index.js`.

## Project layout

```text
MEDICO/
├── api/
│   └── index.js              # Vercel serverless API entry point
├── backend/
│   ├── app.js                # Express API application
│   ├── server.js             # Local development server
│   ├── config/db.js          # Cached MongoDB connection
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── createAdmin.js
├── css/                      # Existing frontend styles
├── js/                       # Existing frontend scripts
├── pages/                    # Existing website pages
├── source/                   # Existing images
├── index.html
├── package.json
├── package-lock.json
└── vercel.json
```

## Deploy to Vercel

1. Upload/push the contents of this folder to the GitHub repository. The `package.json` and `vercel.json` must be at the repository root.
2. Import that repository into Vercel. Set **Root Directory** to `./` (the repository root).
3. Use the default **Other** framework setting. Do not set a custom output directory. Vercel should install dependencies from the root `package.json`.
4. In Vercel → Project → Settings → Environment Variables, add:
   - `MONGO_URI` — your MongoDB Atlas connection URI.
   - `JWT_SECRET` — a long, random secret used to sign login tokens.
   - `NODE_ENV` — `production`.
5. In MongoDB Atlas → Network Access, allow access from Vercel. For a quick deployment test, Atlas allows `0.0.0.0/0`; use strong database credentials and least-privilege database access.
6. Redeploy. Test `https://YOUR-VERCEL-DOMAIN/api/health`; it should return JSON with `success: true`. Then test patient, doctor, and admin login and appointment flows.

## Local run (Windows PowerShell)

1. Run `npm install` in the project root.
2. Copy `.env.example` to `backend/.env` and fill in real values. Do not commit `backend/.env`.
3. Run `npm run dev`. Open `http://localhost:5000`.

To create or update an administrator locally, run:

```powershell
npm run create-admin -- admin@example.com "Use-A-Strong-Unique-Password" "MEDICO Administrator"
```

## Important security notes

- The original archive contained `.env` files. They have deliberately been excluded from this cleaned project. Add secrets only to local `backend/.env` or Vercel Environment Variables.
- Rotate the MongoDB database-user password and JWT secret if the original archive was shared or committed anywhere.
- Do not upload `node_modules`, `.git`, `.env`, or database credentials.
- This package restructures deployment files; it does not prove every application workflow is bug-free. Run the health check and test each role after deployment.
"# MEDICO" 
