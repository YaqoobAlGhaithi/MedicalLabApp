import React, { useEffect } from 'react';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { MobileSidebarDrawer } from './components/common/MobileSidebarDrawer';
import { PrintModal } from './components/common/PrintModal';
import { AddInvoiceScreen } from './components/screens/AddInvoiceScreen';
import { BackupSettingsScreen } from './components/screens/BackupSettingsScreen';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { LoginScreen } from './components/screens/LoginScreen';
import { PatientProfileScreen } from './components/screens/PatientProfileScreen';
import { ReportsListScreen } from './components/screens/ReportsListScreen';
import { ReportViewScreen } from './components/screens/ReportViewScreen';
import { SplashScreen } from './components/screens/SplashScreen';
import { AppProvider, useApp } from './context/AppContext';

const ScreenRouter: React.FC = () => {
  const { activeScreen, setActiveScreen, isAuthenticated, authLoading } = useApp();

  // Redirect to LoginScreen when the user is not authenticated (Firebase or valid offline session)
  useEffect(() => {
    if (!isAuthenticated) {
      if (activeScreen !== 'login' && activeScreen !== 'splash') {
        setActiveScreen('login');
      }
    }
  }, [isAuthenticated, activeScreen, setActiveScreen]);

  // While checking the initial Firebase auth state
  if (authLoading && activeScreen === 'splash') {
    return <SplashScreen />;
  }

  // Protected screens are only accessible to authenticated users (Firebase or offline session)
  if (!isAuthenticated && activeScreen !== 'splash') {
    return <LoginScreen />;
  }

  switch (activeScreen) {
    case 'splash':
      return <SplashScreen />;
    case 'login':
      return <LoginScreen />;
    case 'dashboard':
      return <DashboardScreen />;
    case 'add_invoice':
      return <AddInvoiceScreen />;
    case 'report_view':
      return <ReportViewScreen />;
    case 'reports_list':
      return <ReportsListScreen />;
    case 'patient_profile':
      return <PatientProfileScreen />;
    case 'backup_settings':
      return <BackupSettingsScreen />;
    default:
      return <DashboardScreen />;
  }
};

const NavigationControls: React.FC = () => {
  const { activeScreen, isAuthenticated } = useApp();

  if (!isAuthenticated || activeScreen === 'login' || activeScreen === 'splash') {
    return null;
  }

  return (
    <>
      <MobileSidebarDrawer />
      <MobileBottomNav />
      <PrintModal />
    </>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="font-sans antialiased text-slate-900 bg-slate-100 min-h-screen relative overflow-x-hidden selection:bg-blue-600 selection:text-white">
        <ScreenRouter />
        <NavigationControls />
      </div>
    </AppProvider>
  );
}
