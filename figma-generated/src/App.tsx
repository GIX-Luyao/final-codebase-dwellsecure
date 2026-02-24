import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Welcome } from './pages/Welcome';
import { PropertyType } from './pages/PropertyType';
import { AddressInput } from './pages/AddressInput';
import { PropertyPhoto } from './pages/PropertyPhoto';
import { GasShutoffInfo } from './pages/GasShutoffInfo';
import { EnterUtility } from './pages/EnterUtility';
import { Success } from './pages/Success';
import { PropertyDetails } from './pages/PropertyDetails';
import './styles/global.css';

const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="app">
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/property-type" element={<PropertyType />} />
            <Route path="/property-address" element={<AddressInput />} />
            <Route path="/property-photo" element={<PropertyPhoto />} />
            <Route path="/gas-shutoff-info" element={<GasShutoffInfo />} />
            <Route path="/enter-utility" element={<EnterUtility />} />
            <Route path="/success" element={<Success />} />
            <Route path="/property-details" element={<PropertyDetails />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
