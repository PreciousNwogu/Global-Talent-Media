// Temporary debug component to test if component renders at all
import { useState, useEffect } from 'react';

const DashboardDebug = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    console.log('DashboardDebug component mounted');
    setMounted(true);
    return () => {
      console.log('DashboardDebug component unmounted');
    };
  }, []);

  return (
    <div className="w-full p-6">
      <h1 className="text-3xl font-bold text-red-600 mb-6">
        Dashboard Debug Component
      </h1>
      <div className="bg-red-100 border-2 border-red-500 p-4 rounded">
        <p className="text-lg font-semibold">If you see this, the component is rendering!</p>
        <p>Mounted: {mounted ? 'Yes' : 'No'}</p>
        <p>Time: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
};

export default DashboardDebug;

