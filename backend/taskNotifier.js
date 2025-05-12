require('dotenv').config({ path: '.env.local' });
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Set up nodemailer transporter with Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Function to send email
async function sendEmail(to, subject, text) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Function to check for tasks due in the next hour and send reminders
async function checkAndSendReminders() {
  console.log('Checking for tasks due within the next hour...');
  
  try {
    // Get all profiles with email notifications enabled
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, email_notifications')
      .eq('email_notifications', true);
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return;
    }
    
    if (!profiles || profiles.length === 0) {
      console.log('No users with email notifications enabled');
      return;
    }
    
    // For each user with notifications enabled
    for (const profile of profiles) {
      // Get user email from auth
      const { data: user, error: userError } = await supabase
        .from('auth')
        .select('email')
        .eq('id', profile.id)
        .single();
      
      if (userError || !user) {
        console.error(`Could not fetch email for user ${profile.id}:`, userError);
        continue;
      }
      
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      
      // Get tasks due in the next hour
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id, title, description, due_date')
        .eq('user_id', profile.id)
        .neq('status', 'done')
        .gte('due_date', now.toISOString())
        .lte('due_date', oneHourFromNow.toISOString());
      
      if (tasksError) {
        console.error(`Error fetching tasks for user ${profile.id}:`, tasksError);
        continue;
      }
      
      if (!tasks || tasks.length === 0) {
        console.log(`No tasks due in the next hour for user ${profile.id}`);
        continue;
      }
      
      // Format email content
      const subject = `SmartTasker: ${tasks.length} task(s) due soon`;
      let emailText = `Hello ${profile.name || 'there'},\n\n`;
      emailText += `You have ${tasks.length} task(s) due within the next hour:\n\n`;
      
      tasks.forEach(task => {
        const dueDate = new Date(task.due_date);
        emailText += `- ${task.title}\n`;
        emailText += `  Due: ${dueDate.toLocaleString()}\n`;
        if (task.description) {
          emailText += `  Description: ${task.description}\n`;
        }
        emailText += '\n';
      });
      
      emailText += 'Login to SmartTasker to view and manage these tasks.\n\n';
      emailText += 'Best regards,\nThe SmartTasker Team';
      
      // Send the email
      await sendEmail(user.email, subject, emailText);
      console.log(`Reminder email sent to ${user.email} for ${tasks.length} tasks`);
    }
  } catch (error) {
    console.error('Error in checkAndSendReminders:', error);
  }
}

// Schedule the task to run every hour
cron.schedule('0 * * * *', () => {
  checkAndSendReminders().catch(error => {
    console.error('Error running scheduled task:', error);
  });
});

console.log('Task reminder service started. Running checks hourly.');

// Run immediately on startup for testing
checkAndSendReminders().catch(error => {
  console.error('Error running initial check:', error);
}); 