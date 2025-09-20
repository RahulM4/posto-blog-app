# Posto client

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure the API and admin URLs (optional):

   - Copy `.env.example` to `.env.local` and update `VITE_API_BASE_URL` if your backend is not available at `http://localhost:4000/api`.
   - If the admin dashboard is hosted elsewhere, set `VITE_ADMIN_URL` so the “Admin” link in the header points to the right place. Without it, the link targets `/admin` on the current origin.

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Build for production:

   ```bash
   npm run build
   ```

## Linting

```bash
npm run lint
```
