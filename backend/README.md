# SmartTasker Backend Notification Service

This backend service sends email notifications for upcoming tasks that are due within the next hour for users who have enabled email notifications.

## Setup

1. Make sure you have Node.js and npm installed
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env.local` file in the backend directory with the following variables:
   ```
   # Supabase connection
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # Email configuration (Gmail)
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASSWORD=your-app-password-or-password
   ```

   Note: For Gmail, it's recommended to use an "App Password" instead of your actual password. 
   You can create one at: https://myaccount.google.com/apppasswords 
   (This requires 2-step verification to be enabled on your Google account)

## Running the service

To start the service:
```
npm start
```

For development with auto-restart:
```
npm run dev
```

## How it works

1. The service runs a check once per hour using `node-cron`.
2. It checks Supabase for any profiles that have email notifications enabled.
3. For each user with notifications enabled, it looks for tasks due within the next hour.
4. If tasks are found, an email is sent to the user with details of the upcoming tasks.

## Database Requirements

The service expects the following tables in Supabase:

1. `profiles` table with fields:
   - `id`: User ID
   - `name`: User's name
   - `email_notifications`: Boolean flag for email notification preference

2. `tasks` table with fields:
   - `id`: Task ID
   - `user_id`: ID of the user who owns the task
   - `title`: Task title
   - `description`: Task description (optional)
   - `status`: Task status (should have a value like 'done' for completed tasks)
   - `due_date`: ISO timestamp for when the task is due

3. Access to the authentication system to get user emails

## Deployment

For production, this service should be deployed to a server or container that runs 24/7 to ensure notifications are sent on schedule. 