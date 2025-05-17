import React, { useState, useEffect } from 'react';

const TestPage: React.FC = () => {
  const [errors, setErrors] = useState<string[]>([]);
  
  useEffect(() => {
    // Override console.error to capture errors
    const originalError = console.error;
    const capturedErrors: string[] = [];
    
    console.error = (...args) => {
      originalError(...args);
      const errorMsg = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      capturedErrors.push(errorMsg);
      setErrors([...capturedErrors]);
    };
    
    // Restore original console.error on component unmount
    return () => {
      console.error = originalError;
    };
  }, []);
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Page</h1>
      <p className="mb-4">This is a simple test page to verify that rendering is working.</p>
      <div className="p-4 mb-4 bg-blue-100 rounded-md">
        If you can see this box, React rendering is functioning correctly.
      </div>
      
      {errors.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-red-600">Console Errors:</h2>
          <div className="p-4 mt-2 bg-red-50 border border-red-300 rounded-md max-h-[400px] overflow-auto">
            {errors.map((error, i) => (
              <div key={i} className="mb-4 p-2 border-b border-red-200">
                <pre className="whitespace-pre-wrap">{error}</pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestPage; 