import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';



// ====== PAGE WSF ======
import WSFLocatorPage from './pages/wsf/WSFLocatorPage';
import WSFPageFormCell from "./pages/wsf/WSFPageFormCell";
import WSFProgrammePage from "./pages/wsf/WSFProgrammePage";



import ErrorBoundary from './ErrorBoundary';
import { Toaster } from 'react-hot-toast';

function AppContent() {
  return (
    <ErrorBoundary>
      <Toaster position="top-center" />
      
      <Routes>
        {/* ══════════════════════════════════════════
  

        {/* ══════════════════════════════════════════
            WINNERS CHAPEL (WSF)
        ══════════════════════════════════════════ */}
        <Route path="" element={<WSFLocatorPage />} />
        <Route path="/wsf/cells/new" element={<WSFPageFormCell />} />
        <Route path="/wsf/programmes" element={<WSFProgrammePage />} />
        
        {/* Tu peux ajouter tes routes pour Accueil ou CardPage ici si besoin */}
      </Routes>
      
    </ErrorBoundary>
  );
}

export default function AppWrapper() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}