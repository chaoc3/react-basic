import React, { createContext, useState, useContext } from 'react';

const SummaryContext = createContext();

export const SummaryProvider = ({ children }) => {
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [onCloseAction, setOnCloseAction] = useState(null);

  const openSummary = (onCloseCallback = null) => {
    // We register a function to be called when the modal closes
    setOnCloseAction(() => onCloseCallback); 
    setIsSummaryOpen(true);
  };

  const closeSummary = () => {
    setIsSummaryOpen(false);
    if (onCloseAction) {
      onCloseAction(); // Execute the callback if it exists
      setOnCloseAction(null); // Clear it after execution
    }
  };

  return (
    <SummaryContext.Provider value={{ isSummaryOpen, openSummary, closeSummary }}>
      {children}
    </SummaryContext.Provider>
  );
};

export const useSummary = () => useContext(SummaryContext);