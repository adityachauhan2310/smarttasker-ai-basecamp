// Simple i18n utility for SmartTasker

// Add at the beginning of the file
console.log("Loading i18n.ts module");

// Define the available languages
export type Language = 'en' | 'es' | 'fr';

// Define translation structure
interface TranslationDictionary {
  [key: string]: string;
}

// Translation dictionaries by language
const translations: Record<Language, TranslationDictionary> = {
  en: {
    // Common
    appName: 'SmartTasker',
    save: 'Save',
    saveChanges: 'Save Changes',
    savePreferences: 'Save Preferences',
    saveSettings: 'Save Settings',
    cancel: 'Cancel',
    loading: 'Loading...',
    saving: 'Saving...',
    error: 'Error',
    success: 'Success',
    name: 'Name',
    email: 'Email',
    yourName: 'Your name',
    yourEmail: 'your@email.com',
    connectToSupabase: 'Connect to Supabase to manage your email address.',
    reloadRecommended: 'To fully apply the language change, a page reload is recommended.',
    reloadNow: 'Reload Now',
    receiveViaEmail: 'Receive notifications via email.',
    getRemindedTasks: 'Get reminded about upcoming tasks.',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    signUp: 'Sign Up',
    password: 'Password',
    welcomeTo: 'Welcome to',
    signInOrCreateAccount: 'Sign in or create a new account to get started',
    signingIn: 'Signing in...',
    creatingAccount: 'Creating account...',
    
    // Navigation
    dashboard: 'Dashboard',
    tasks: 'Tasks',
    chat: 'Chat',
    settings: 'Settings',
    
    // Dashboard
    totalTasks: 'Total Tasks',
    completed: 'Completed',
    upcoming: 'Upcoming',
    overdue: 'Overdue',
    viewingDemoVersion: 'You are viewing the demo version with sample data.',
    noTasksYet: 'You have no tasks yet. Click "New Task" to get started!',
    
    // Tasks
    newTask: 'New Task',
    taskTitle: 'Title',
    taskDescription: 'Description',
    taskPriority: 'Priority',
    taskStatus: 'Status',
    dueDate: 'Due Date',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    todo: 'To Do',
    inProgress: 'In Progress',
    done: 'Done',
    
    // Settings
    profileInformation: 'Profile Information',
    accountSettings: 'Account Settings',
    notificationPreferences: 'Notification Preferences',
    language: 'Language',
    timezone: 'Timezone',
    emailNotifications: 'Email Notifications',
    taskReminders: 'Task Reminders',
    appearance: 'Appearance',
    darkMode: 'Dark Mode',
    darkModeEnabled: 'Dark mode is enabled.',
    lightModeEnabled: 'Light mode is enabled.',
    manageAccountSettings: 'Manage your account settings and appearance.',
    reloadToApply: 'Some settings may require a reload to fully apply.',
    reloadApp: 'Reload App',
    updatePersonalInfo: 'Update your personal information.',
    manageAccountPrefs: 'Manage your account settings and preferences.',
    controlNotifications: 'Control how you receive notifications.',
    preferencesUpdated: 'Your preferences have been updated.',
    errorSavingPreferences: 'There was a problem saving your preferences.',
    
    // Languages
    english: 'English',
    spanish: 'Spanish',
    french: 'French',
    
    // Timezones
    utc: 'UTC (Coordinated Universal Time)',
    est: 'EST (Eastern Standard Time)',
    pst: 'PST (Pacific Standard Time)',
    
    // Landing page
    manageTasksWithAI: 'Manage Tasks with AI-Powered Efficiency',
    helpsYouOrganize: 'helps you organize, prioritize, and complete your tasks with intelligent assistance.',
    getStarted: 'Get Started',
    viewDemo: 'View Demo',
    whyChooseSmartTasker: 'Why Choose SmartTasker?',
    aiDrivenTaskManager: 'Our AI-driven task manager helps you stay organized and focused on what matters most.',
    readyToGetStarted: 'Ready to get started?',
    joinThousandsOfUsers: 'Join thousands of users who have transformed their productivity with SmartTasker.',
    signUpNow: 'Sign Up Now',
    terms: 'Terms',
    privacy: 'Privacy',
    contact: 'Contact',
    allRightsReserved: 'All rights reserved.',
    
    // Notifications
    notifications: 'Notifications',
    noNotifications: 'No notifications',
    viewAllNotifications: 'View all notifications',
    justNow: 'just now',
    minutesAgo: 'minutes ago',
    hoursAgo: 'hours ago',
    daysAgo: 'days ago',
    overdueTask: 'Overdue Task',
    dueTodayTask: 'Due Today',
    dueThisWeek: 'Due This Week',
    productivityTip: 'Productivity Tip',
    completeYourFirstTask: 'Complete your first task to boost productivity!',
    allNotifications: 'All Notifications',
    all: 'All',
    reminders: 'Reminders',
    system: 'System',
    today: 'Today',
    yesterday: 'Yesterday',
    relatedTask: 'Task',
    noNotificationsInCategory: 'No notifications in this category',
    achievementUnlocked: 'Achievement Unlocked',
    completedFirstTask: 'You completed your first task!',
    welcomeToSmartTasker: 'Welcome to SmartTasker',
    getStartedMessage: 'Start by creating your first task to get organized!',
  },
  
  es: {
    // Common
    appName: 'SmartTasker',
    save: 'Guardar',
    saveChanges: 'Guardar Cambios',
    savePreferences: 'Guardar Preferencias',
    saveSettings: 'Guardar Configuración',
    cancel: 'Cancelar',
    loading: 'Cargando...',
    saving: 'Guardando...',
    error: 'Error',
    success: 'Éxito',
    name: 'Nombre',
    email: 'Correo electrónico',
    yourName: 'Tu nombre',
    yourEmail: 'tu@email.com',
    connectToSupabase: 'Conéctate a Supabase para gestionar tu dirección de correo electrónico.',
    reloadRecommended: 'Para aplicar completamente el cambio de idioma, se recomienda recargar la página.',
    reloadNow: 'Recargar Ahora',
    receiveViaEmail: 'Recibir notificaciones por correo electrónico.',
    getRemindedTasks: 'Recibir recordatorios sobre tareas próximas.',
    signIn: 'Iniciar Sesión',
    signOut: 'Cerrar Sesión',
    signUp: 'Registrarse',
    password: 'Contraseña',
    welcomeTo: 'Bienvenido a',
    signInOrCreateAccount: 'Inicia sesión o crea una cuenta para comenzar',
    signingIn: 'Iniciando sesión...',
    creatingAccount: 'Creando cuenta...',
    
    // Navigation
    dashboard: 'Tablero',
    tasks: 'Tareas',
    chat: 'Chat',
    settings: 'Configuración',
    
    // Dashboard
    totalTasks: 'Tareas totales',
    completed: 'Completadas',
    upcoming: 'Próximas',
    overdue: 'Atrasadas',
    viewingDemoVersion: 'Estás viendo la versión de demostración con datos de ejemplo.',
    noTasksYet: '¡Aún no tienes tareas. Haz clic en "Nueva tarea" para comenzar!',
    
    // Tasks
    newTask: 'Nueva tarea',
    taskTitle: 'Título',
    taskDescription: 'Descripción',
    taskPriority: 'Prioridad',
    taskStatus: 'Estado',
    dueDate: 'Fecha límite',
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
    todo: 'Por hacer',
    inProgress: 'En progreso',
    done: 'Completada',
    
    // Settings
    profileInformation: 'Información del perfil',
    accountSettings: 'Configuración de cuenta',
    notificationPreferences: 'Preferencias de notificación',
    language: 'Idioma',
    timezone: 'Zona horaria',
    emailNotifications: 'Notificaciones por correo',
    taskReminders: 'Recordatorios de tareas',
    appearance: 'Apariencia',
    darkMode: 'Modo Oscuro',
    darkModeEnabled: 'El modo oscuro está activado.',
    lightModeEnabled: 'El modo claro está activado.',
    manageAccountSettings: 'Administra tu configuración de cuenta y apariencia.',
    reloadToApply: 'Algunos ajustes pueden requerir recargar para aplicarse completamente.',
    reloadApp: 'Recargar Aplicación',
    updatePersonalInfo: 'Actualiza tu información personal.',
    manageAccountPrefs: 'Administra tus preferencias de cuenta.',
    controlNotifications: 'Controla cómo recibes notificaciones.',
    preferencesUpdated: 'Tus preferencias han sido actualizadas.',
    errorSavingPreferences: 'Hubo un problema al guardar tus preferencias.',
    
    // Languages
    english: 'Inglés',
    spanish: 'Español',
    french: 'Francés',
    
    // Timezones
    utc: 'UTC (Tiempo Universal Coordinado)',
    est: 'EST (Hora Estándar del Este)',
    pst: 'PST (Hora Estándar del Pacífico)',
    
    // Landing page
    manageTasksWithAI: 'Gestiona tareas con eficiencia potenciada por IA',
    helpsYouOrganize: 'te ayuda a organizar, priorizar y completar tus tareas con asistencia inteligente.',
    getStarted: 'Comenzar',
    viewDemo: 'Ver Demo',
    whyChooseSmartTasker: '¿Por qué elegir SmartTasker?',
    aiDrivenTaskManager: 'Nuestro gestor de tareas impulsado por IA te ayuda a mantenerte organizado y enfocado en lo más importante.',
    readyToGetStarted: '¿Listo para comenzar?',
    joinThousandsOfUsers: 'Únete a miles de usuarios que han transformado su productividad con SmartTasker.',
    signUpNow: 'Regístrate ahora',
    terms: 'Términos',
    privacy: 'Privacidad',
    contact: 'Contacto',
    allRightsReserved: 'Todos los derechos reservados.',
    
    // Notifications
    notifications: 'Notificaciones',
    noNotifications: 'No hay notificaciones',
    viewAllNotifications: 'Ver todas las notificaciones',
    justNow: 'ahora mismo',
    minutesAgo: 'minutos atrás',
    hoursAgo: 'horas atrás',
    daysAgo: 'días atrás',
    overdueTask: 'Tarea Atrasada',
    dueTodayTask: 'Vence Hoy',
    dueThisWeek: 'Vence Esta Semana',
    productivityTip: 'Consejo de Productividad',
    completeYourFirstTask: '¡Completa tu primera tarea para aumentar la productividad!',
    allNotifications: 'Todas las Notificaciones',
    all: 'Todas',
    reminders: 'Recordatorios',
    system: 'Sistema',
    today: 'Hoy',
    yesterday: 'Ayer',
    relatedTask: 'Tarea',
    noNotificationsInCategory: 'No hay notificaciones en esta categoría',
    achievementUnlocked: 'Logro Desbloqueado',
    completedFirstTask: '¡Completaste tu primera tarea!',
    welcomeToSmartTasker: 'Bienvenido a SmartTasker',
    getStartedMessage: 'Comienza creando tu primera tarea para organizarte!',
  },
  
  fr: {
    // Common
    appName: 'SmartTasker',
    save: 'Enregistrer',
    saveChanges: 'Enregistrer les modifications',
    savePreferences: 'Enregistrer les préférences',
    saveSettings: 'Enregistrer les paramètres',
    cancel: 'Annuler',
    loading: 'Chargement...',
    saving: 'Enregistrement...',
    error: 'Erreur',
    success: 'Succès',
    name: 'Nom',
    email: 'Email',
    yourName: 'Votre nom',
    yourEmail: 'votre@email.com',
    connectToSupabase: 'Connectez-vous à Supabase pour gérer votre adresse e-mail.',
    reloadRecommended: 'Pour appliquer complètement le changement de langue, un rechargement de la page est recommandé.',
    reloadNow: 'Recharger maintenant',
    receiveViaEmail: 'Recevez des notifications par email.',
    getRemindedTasks: 'Recevez des rappels de tâches à venir.',
    signIn: 'Se Connecter',
    signOut: 'Se Déconnecter',
    signUp: 'S\'inscrire',
    password: 'Mot de passe',
    welcomeTo: 'Bienvenue à',
    signInOrCreateAccount: 'Connectez-vous ou créez un compte pour commencer',
    signingIn: 'Connexion en cours...',
    creatingAccount: 'Création de compte...',
    
    // Navigation
    dashboard: 'Tableau de bord',
    tasks: 'Tâches',
    chat: 'Chat',
    settings: 'Paramètres',
    
    // Dashboard
    totalTasks: 'Tâches totales',
    completed: 'Terminées',
    upcoming: 'À venir',
    overdue: 'En retard',
    viewingDemoVersion: 'Vous consultez la version de démonstration avec des exemples de données.',
    noTasksYet: 'Vous n\'avez pas encore de tâches. Cliquez sur "Nouvelle tâche" pour commencer!',
    
    // Tasks
    newTask: 'Nouvelle tâche',
    taskTitle: 'Titre',
    taskDescription: 'Description',
    taskPriority: 'Priorité',
    taskStatus: 'Statut',
    dueDate: 'Date d\'échéance',
    low: 'Faible',
    medium: 'Moyenne',
    high: 'Élevée',
    todo: 'À faire',
    inProgress: 'En cours',
    done: 'Terminée',
    
    // Settings
    profileInformation: 'Informations de profil',
    accountSettings: 'Paramètres du compte',
    notificationPreferences: 'Préférences de notification',
    language: 'Langue',
    timezone: 'Fuseau horaire',
    emailNotifications: 'Notifications par email',
    taskReminders: 'Rappels de tâches',
    appearance: 'Apparence',
    darkMode: 'Mode sombre',
    darkModeEnabled: 'Le mode sombre est activé.',
    lightModeEnabled: 'Le mode clair est activé.',
    manageAccountSettings: 'Gérez vos paramètres de compte et d\'apparence.',
    reloadToApply: 'Certains paramètres peuvent nécessiter un rechargement pour être entièrement appliqués.',
    reloadApp: 'Recharger l\'application',
    updatePersonalInfo: 'Mettez à jour vos informations personnelles.',
    manageAccountPrefs: 'Gérez vos préférences de compte.',
    controlNotifications: 'Contrôlez comment vous recevez les notifications.',
    preferencesUpdated: 'Vos préférences ont été mises à jour.',
    errorSavingPreferences: 'Un problème est survenu lors de l\'enregistrement de vos préférences.',
    
    // Languages
    english: 'Anglais',
    spanish: 'Espagnol',
    french: 'Français',
    
    // Timezones
    utc: 'UTC (Temps Universel Coordonné)',
    est: 'EST (Heure Normale de l\'Est)',
    pst: 'PST (Heure Normale du Pacifique)',
    
    // Landing page
    manageTasksWithAI: 'Gérez vos tâches avec l\'efficacité de l\'IA',
    helpsYouOrganize: 'vous aide à organiser, prioriser et accomplir vos tâches avec une assistance intelligente.',
    getStarted: 'Commencer',
    viewDemo: 'Voir la démo',
    whyChooseSmartTasker: 'Pourquoi choisir SmartTasker?',
    aiDrivenTaskManager: 'Notre gestionnaire de tâches alimenté par l\'IA vous aide à rester organisé et concentré sur l\'essentiel.',
    readyToGetStarted: 'Prêt à commencer?',
    joinThousandsOfUsers: 'Rejoignez des milliers d\'utilisateurs qui ont transformé leur productivité avec SmartTasker.',
    signUpNow: 'Inscrivez-vous maintenant',
    terms: 'Conditions',
    privacy: 'Confidentialité',
    contact: 'Contact',
    allRightsReserved: 'Tous droits réservés.',
    
    // Notifications
    notifications: 'Notifications',
    noNotifications: 'Pas de notifications',
    viewAllNotifications: 'Voir toutes les notifications',
    justNow: 'à l\'instant',
    minutesAgo: 'minutes',
    hoursAgo: 'heures',
    daysAgo: 'jours',
    overdueTask: 'Tâche en Retard',
    dueTodayTask: 'À Faire Aujourd\'hui',
    dueThisWeek: 'À Faire Cette Semaine',
    productivityTip: 'Conseil de Productivité',
    completeYourFirstTask: 'Terminez votre première tâche pour augmenter votre productivité!',
    allNotifications: 'Toutes les Notifications',
    all: 'Tout',
    reminders: 'Rappels',
    system: 'Système',
    today: 'Aujourd\'hui',
    yesterday: 'Hier',
    relatedTask: 'Tâche',
    noNotificationsInCategory: 'Pas de notifications dans cette catégorie',
    achievementUnlocked: 'Objectif Débloqué',
    completedFirstTask: 'Vous avez terminé votre première tâche!',
    welcomeToSmartTasker: 'Bienvenue à SmartTasker',
    getStartedMessage: 'Commencez par créer votre première tâche pour vous organiser!',
  }
};

/**
 * Get the current language from localStorage
 */
export function getCurrentLanguage(): Language {
  try {
    const prefs = localStorage.getItem('accountPreferences');
    if (prefs) {
      const { language } = JSON.parse(prefs);
      if (language in translations) {
        return language as Language;
      }
    }
  } catch (error) {
    console.error('Error retrieving language preference:', error);
  }
  
  return 'en'; // Default to English
}

/**
 * Translate a key into the current language
 */
export function t(key: string): string {
  const language = getCurrentLanguage();
  const translation = translations[language][key];
  
  if (translation) {
    return translation;
  }
  
  // Fallback to English if the key doesn't exist in the current language
  return translations.en[key] || key;
}

/**
 * Apply language settings to HTML document
 */
export function applyLanguage(): void {
  try {
    console.log("Applying language translations");
    const language = getCurrentLanguage();
    console.log("Current language:", language);
    
    // Dispatch event for components to update
    const event = new CustomEvent('languageChanged', { detail: { language } });
    window.dispatchEvent(event);
    console.log("Dispatched languageChanged event");
  } catch (error) {
    console.error("Error applying language:", error);
  }
}

/**
 * Initialize i18n module (call this at app startup)
 */
export function initializeI18n(): void {
  console.log("Initializing i18n system");
  try {
    const savedLanguage = localStorage.getItem('language') as Language || 'en';
    console.log("Retrieved language from localStorage:", savedLanguage);
    
    document.documentElement.lang = savedLanguage;
    console.log("Set document language attribute to:", savedLanguage);
    
    // Apply translations for saved language
    applyLanguage();
    console.log("Applied language translations");
  } catch (error) {
    console.error("Error initializing i18n:", error);
  }
} 