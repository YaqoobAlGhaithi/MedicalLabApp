import { User as FirebaseUser } from 'firebase/auth';
import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { INITIAL_DOCTORS, INITIAL_PATIENTS, INITIAL_REPORTS, INITIAL_SETTINGS } from '../data/mockData';
import {
  db,
  handleFirestoreError,
  OperationType,
  testConnection
} from '../lib/firebase';
import { ActiveScreen, Doctor, LabReport, LabSettings, Patient } from '../types';
import { AuthProvider, useAuth } from './AuthContext';

interface AppContextType {
  activeScreen: ActiveScreen;
  setActiveScreen: (screen: ActiveScreen) => void;
  reports: LabReport[];
  patients: Patient[];
  doctors: Doctor[];
  settings: LabSettings;
  currentReport: LabReport | null;
  setCurrentReport: (report: LabReport | null) => void;
  isAuthenticated: boolean;
  authLoading: boolean;
  user: { uid?: string; username: string; name: string; role: string; email?: string } | null;
  firebaseUser: FirebaseUser | null;
  firebaseConnected: boolean;
  offlineSessionActive: boolean;
  hasValidLocalSession: () => boolean;
  continueOffline: () => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  addReport: (report: LabReport) => void;
  updateReport: (report: LabReport) => void;
  deleteReport: (id: string) => void;
  addPatient: (patient: Patient) => void;
  addDoctor: (doctor: Doctor) => void;
  updateSettings: (settings: LabSettings) => void;
  exportBackupJson: () => void;
  importBackupJson: (jsonString: string) => boolean;
  printModalOpen: boolean;
  setPrintModalOpen: (open: boolean) => void;
  viewReportForPrint: (report: LabReport) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebarCollapse: () => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const AppProviderInternal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading: authLoading, isAuthenticated: isFirebaseAuthenticated, signInWithGoogle, logout: authLogout } = useAuth();

  const [activeScreen, setActiveScreenState] = useState<ActiveScreen>('splash');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('almanar_sidebar_collapsed') === 'true';
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [firebaseConnected, setFirebaseConnected] = useState<boolean>(false);

  /**
   * A valid offline session must originate from a real Firebase sign-in (it carries a uid).
   * This prevents creating a session for an arbitrary username.
   */
  function hasValidLocalSession(): boolean {
    try {
      const authFlag = localStorage.getItem('almanar_auth');
      const savedUser = localStorage.getItem('almanar_user');
      if (authFlag !== 'true' || !savedUser) return false;
      const parsed = JSON.parse(savedUser);
      return typeof parsed?.uid === 'string' && parsed.uid.length > 0;
    } catch {
      return false;
    }
  }

  const [offlineSessionActive, setOfflineSessionActive] = useState<boolean>(() => {
    return hasValidLocalSession();
  });

  const setActiveScreen = (screen: ActiveScreen) => {
    setActiveScreenState(screen);
    setIsMobileSidebarOpen(false);
  };

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('almanar_sidebar_collapsed', String(next));
      return next;
    });
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(prev => !prev);
  };

  const [reports, setReports] = useState<LabReport[]>(() => {
    const saved = localStorage.getItem('almanar_reports');
    return saved ? JSON.parse(saved) : INITIAL_REPORTS;
  });
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('almanar_patients');
    return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
  });
  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    const saved = localStorage.getItem('almanar_doctors');
    return saved ? JSON.parse(saved) : INITIAL_DOCTORS;
  });
  const [settings, setSettings] = useState<LabSettings>(() => {
    const saved = localStorage.getItem('almanar_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [currentReport, setCurrentReport] = useState<LabReport | null>(null);
  const [user, setUser] = useState<{ uid?: string; username: string; name: string; role: string; email?: string } | null>(() => {
    const saved = localStorage.getItem('almanar_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [printModalOpen, setPrintModalOpen] = useState(false);

  // Test Firebase connection on boot
  useEffect(() => {
    testConnection().then(connected => {
      setFirebaseConnected(connected);
    });
  }, []);

  // Update user info when Firebase currentUser changes
  useEffect(() => {
    if (currentUser) {
      const userData = {
        uid: currentUser.uid,
        username: currentUser.email?.split('@')[0] || 'User',
        name: currentUser.displayName || 'أخصائي المختبر',
        role: 'Lab Specialist',
        email: currentUser.email || undefined,
      };
      setUser(userData);
      setOfflineSessionActive(false);
      localStorage.setItem('almanar_auth', 'true');
      localStorage.setItem('almanar_user', JSON.stringify(userData));
    } else if (!offlineSessionActive) {
      // No Firebase user and no valid offline session → not authenticated.
      setUser(null);
      localStorage.setItem('almanar_auth', 'false');
      localStorage.removeItem('almanar_user');
    }
  }, [currentUser, offlineSessionActive]);

  // Sync with Firestore in real-time when authenticated with Firebase
  useEffect(() => {
    if (!currentUser) return;

    // Reports subscription
    const reportsPath = 'reports';
    const unsubReports = onSnapshot(
      collection(db, reportsPath),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: LabReport[] = [];
          snapshot.forEach((d) => {
            list.push({ ...(d.data() as LabReport), id: d.id });
          });
          setReports(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, reportsPath);
      }
    );

    // Patients subscription
    const patientsPath = 'patients';
    const unsubPatients = onSnapshot(
      collection(db, patientsPath),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Patient[] = [];
          snapshot.forEach((d) => {
            list.push({ ...(d.data() as Patient), id: d.id });
          });
          setPatients(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, patientsPath);
      }
    );

    // Doctors subscription
    const doctorsPath = 'doctors';
    const unsubDoctors = onSnapshot(
      collection(db, doctorsPath),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Doctor[] = [];
          snapshot.forEach((d) => {
            list.push({ ...(d.data() as Doctor), id: d.id });
          });
          setDoctors(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, doctorsPath);
      }
    );

    // Settings subscription
    const settingsPath = 'settings';
    const unsubSettings = onSnapshot(
      collection(db, settingsPath),
      (snapshot) => {
        snapshot.forEach((d) => {
          if (d.id === 'general') {
            setSettings(d.data() as LabSettings);
          }
        });
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, settingsPath);
      }
    );

    return () => {
      unsubReports();
      unsubPatients();
      unsubDoctors();
      unsubSettings();
    };
  }, [currentUser]);

  // Auto transition from splash screen after 2.4 seconds
  useEffect(() => {
    if (activeScreen === 'splash') {
      const timer = setTimeout(() => {
        if (isFirebaseAuthenticated || offlineSessionActive) {
          setActiveScreen('dashboard');
        } else {
          setActiveScreen('login');
        }
      }, 2400);
      return () => clearTimeout(timer);
    }
  }, [activeScreen, isFirebaseAuthenticated, offlineSessionActive]);

  // Persist state changes locally
  useEffect(() => {
    localStorage.setItem('almanar_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('almanar_patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('almanar_doctors', JSON.stringify(doctors));
  }, [doctors]);

  useEffect(() => {
    localStorage.setItem('almanar_settings', JSON.stringify(settings));
  }, [settings]);

  const continueOffline = () => {
    if (!hasValidLocalSession()) {
      setActiveScreen('login');
      return;
    }
    setOfflineSessionActive(true);
    setActiveScreen('dashboard');
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithGoogle();
      // Popup flow (web) resolves with a user; the redirect flow (Capacitor native) navigates
      // away and completes via onAuthStateChanged / resolveRedirectResult.
      if (result) {
        setActiveScreen('dashboard');
      }
    } catch (err) {
      console.error('Firebase Google Login Error:', err);
      throw err;
    }
  };

  const logout = () => {
    authLogout().catch(console.error);
    setUser(null);
    setOfflineSessionActive(false);
    localStorage.setItem('almanar_auth', 'false');
    localStorage.removeItem('almanar_user');
    setActiveScreen('login');
  };

  const addReport = async (newReport: LabReport) => {
    setReports(prev => [newReport, ...prev]);

    if (currentUser) {
      const path = `reports/${newReport.id}`;
      try {
        await setDoc(doc(db, 'reports', newReport.id), newReport);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }

    if (!patients.some(p => p.name.trim() === newReport.patientName.trim())) {
      addPatient({
        id: 'pat_' + Date.now(),
        name: newReport.patientName,
        age: newReport.patientAge,
        sex: newReport.patientSex,
        createdAt: newReport.reportDate
      });
    }
  };

  const updateReport = async (updated: LabReport) => {
    setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
    if (currentReport?.id === updated.id) {
      setCurrentReport(updated);
    }

    if (currentUser) {
      const path = `reports/${updated.id}`;
      try {
        await setDoc(doc(db, 'reports', updated.id), updated);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    }
  };

  const deleteReport = async (id: string) => {
    setReports(prev => prev.filter(r => r.id !== id));
    if (currentReport?.id === id) {
      setCurrentReport(null);
    }

    if (currentUser) {
      const path = `reports/${id}`;
      try {
        await deleteDoc(doc(db, 'reports', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }
  };

  const addPatient = async (p: Patient) => {
    setPatients(prev => [p, ...prev]);
    if (currentUser) {
      const path = `patients/${p.id}`;
      try {
        await setDoc(doc(db, 'patients', p.id), p);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }
  };

  const addDoctor = async (d: Doctor) => {
    setDoctors(prev => [...prev, d]);
    if (currentUser) {
      const path = `doctors/${d.id}`;
      try {
        await setDoc(doc(db, 'doctors', d.id), d);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }
  };

  const updateSettingsHandler = async (newSettings: LabSettings) => {
    setSettings(newSettings);
    if (currentUser) {
      const path = 'settings/general';
      try {
        await setDoc(doc(db, 'settings', 'general'), newSettings);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }
  };

  const exportBackupJson = () => {
    const backupData = {
      appName: 'Al-Manar Medical Lab Report Pro',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      reports,
      patients,
      doctors,
      settings
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AlManar_Lab_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importBackupJson = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.reports && Array.isArray(parsed.reports)) setReports(parsed.reports);
      if (parsed.patients && Array.isArray(parsed.patients)) setPatients(parsed.patients);
      if (parsed.doctors && Array.isArray(parsed.doctors)) setDoctors(parsed.doctors);
      if (parsed.settings) setSettings(parsed.settings);
      return true;
    } catch (err) {
      console.error('Backup import failed:', err);
      return false;
    }
  };

  const viewReportForPrint = (report: LabReport) => {
    setCurrentReport(report);
    setActiveScreen('report_view');
  };

  return (
    <AppContext.Provider
      value={{
        activeScreen,
        setActiveScreen,
        reports,
        patients,
        doctors,
        settings,
        currentReport,
        setCurrentReport,
        isAuthenticated: isFirebaseAuthenticated || offlineSessionActive,
        authLoading,
        user,
        firebaseUser: currentUser,
        firebaseConnected,
        offlineSessionActive,
        hasValidLocalSession,
        continueOffline,
        loginWithGoogle,
        logout,
        addReport,
        updateReport,
        deleteReport,
        addPatient,
        addDoctor,
        updateSettings: updateSettingsHandler,
        exportBackupJson,
        importBackupJson,
        printModalOpen,
        setPrintModalOpen,
        viewReportForPrint,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebarCollapse,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        toggleMobileSidebar
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <AppProviderInternal>
        {children}
      </AppProviderInternal>
    </AuthProvider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
