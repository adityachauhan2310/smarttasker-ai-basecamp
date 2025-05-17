import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import SimpleApp from './SimpleApp.tsx'
import './index.css'

// Add debugging logs
console.log("Main.tsx - Starting application initialization");

// Toggle this to switch between the full app and the simple test app
const USE_SIMPLE_APP = false;
const AppComponent = USE_SIMPLE_APP ? SimpleApp : App;

try {
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    throw new Error("Root element not found!");
  }
  
  console.log("Main.tsx - Root element found, creating React root");
  
  const root = createRoot(rootElement);
  
  console.log("Main.tsx - Rendering App component");
  
  root.render(<AppComponent />);
  
  console.log("Main.tsx - App rendered successfully");
} catch (error) {
  console.error("Fatal error during application initialization:", error);
  document.body.innerHTML = `
    <div style="padding: 20px; margin: 20px; border: 2px solid red;">
      <h1>Application Error</h1>
      <p>The application could not be initialized properly.</p>
      <pre>${error instanceof Error ? error.stack : String(error)}</pre>
    </div>
  `;
}
