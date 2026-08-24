# Setup Guide

---

### System Requirements
- **OS:** Linux / Windows (WSL)  
- **Node.js:** `22.x` (as defined in `backend/package.json`)  
- **npm:** latest (bundled with Node)  
- **Docker:** optional – used for local PostgreSQL in integration tests (see `backend/.env.example`)  

### Required Tools
| Tool | Install command |
|------|-----------------|
| Node.js (v22) | `curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt-get install -y nodejs` *(or use nvm: `nvm install 22 && nvm use 22`)* |
| npm (comes with Node) | — |
| PostgreSQL (for local dev) | `sudo apt-get install postgresql` |
| Docker + docker‑compose (optional) | `curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh && sudo usermod -aG docker $USER` |
| Expo CLI (mobile app) | `npm install -g expo-cli` |
| pnpm / yarn (optional) | `npm install -g pnpm` or `npm install -g yarn` |

### Clone & Install Dependencies
```bash
# Clone the repo
git clone https://github.com/your-org/rosihome.git
cd rosihome

# Backend dependencies
cd backend
npm install

# Mobile (React Native) dependencies
cd mobile
npm install
```

### Environment Configuration
1. Copy the example env file for the backend:
```bash
cd backend
cp .env.example .env
```
2. Edit `.env` and set the required values:
- `DATABASE_URL` – connection string to a local PostgreSQL instance (default works with a local DB).  
- `JWT_SECRET` – a long random string (e.g., `openssl rand -hex 32`).  
- Email / Expo / Supabase keys as needed for the features you intend to use.


### Build / Compile
#### Backend
```bash
# Development (auto‑restart)
npm run dev      # runs `tsx watch src/server.ts`

# Production build
npm run build    # runs `tsc -p tsconfig.json`
npm start        # runs compiled `dist/server.js`
```
#### Mobile (Expo)
- Get the IPv4 address of the laptop running the backend.
- Update the `apiUrl` in `mobile/app.json` with your IPv4 address:
    ```json
    "extra": {
        "apiUrl": "http://<YOUR_IPV4>:3000",
    ```
- Run mobile
    ```bash
    cd ../mobile
    npm install
    npx expo start -c --go
    ```
The backend API will be available at `http://localhost:3000` (or your machine's IP), and the Expo client will launch the mobile app.

### Database Migrations
```bash
# Generate migration files (when schema changes)
npm run db:generate

# Apply pending migrations
npm run db:migrate

# Push schema directly (use with caution)
npm run db:push

# Seed the database (sample data)
npm run db:seed
```

### Running Tests
```bash
# Unit / API tests
npm run test

# Integration tests (requires disposable test DB)
npm run test:integration
# Or spin up the test DB automatically
npm run test:integration:local
```

### Health‑Check (quick verification)
```bash
# Verify the server starts
npm run dev &   # should log "Listening on port 3000"

# Check API is reachable
curl http://localhost:3000/health   # expect a JSON status response
```

### Common Setup Issues & Fixes
| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| `Error: Cannot find module 'tsx'` | Packages not installed correctly | Delete `node_modules` & run `npm ci` again in both `backend` and `mobile`. |
| `ECONNREFUSED` when connecting to PostgreSQL | DB not running or wrong `DATABASE_URL` | Start PostgreSQL (`sudo service postgresql start`) and ensure credentials match `.env`. |
| Expo “Failed to download Java” on Android | Missing JDK / Android SDK | Install OpenJDK 17 (`sudo apt-get install openjdk-17-jdk`) and Android Studio command‑line tools. |
| Migration error: “relation does not exist” | DB schema out of sync | Run `npm run db:push` to sync schema, or drop and recreate the local DB. |
