import React from 'react';
import { useApp } from '../../context/AppContext';
import { PrintExportModal } from '../print/PrintExportModal';

export const PrintModal: React.FC = () => {
  const { printModalOpen, setPrintModalOpen, currentReport } = useApp();

  return (
    <PrintExportModal
      isOpen={printModalOpen}
      onClose={() => setPrintModalOpen(false)}
      report={currentReport}
    />
  );
};

