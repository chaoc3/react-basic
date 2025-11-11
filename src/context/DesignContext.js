import React, { createContext, useState, useContext } from 'react';

// 1. Create the context
const DesignContext = createContext();

// 2. Create a Provider component
export const DesignProvider = ({ children }) => {
  // This state will hold all the data from the entire flow
  const [designData, setDesignData] = useState({
    targetUser: null,       // From Page 3
    targetPainpoint: null,  // From Page 4
    targetStage: null,      // From Page 5
    userCard: null,         // From Page 6 (e.g., { id: 1, name: '慢病患者' })
    userDetails: null,      // From Page 7 (e.g., { age: 25, gender: 'Male' })
    scenarioCard: null,     // From Page 8
    scenarioDetails: null,  // From Page 9
    mechanismCards: [],     // From Page 10 (can be multiple)
    mechanismDetails: {},   // From Page 11
    infoSourceCards: [],    // From Page 12
    infoSourceDetails: {},  // From Page 13
    modeCard: null,         // From Page 14
    modeDetails: {},        // From Page 15
  });

  // A single function to update any part of the design data
  const updateDesignData = (key, value) => {
    setDesignData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
    console.log('Design data updated:', { [key]: value });
  };

  // The value provided to consuming components
  const value = { designData, updateDesignData };

  return (
    <DesignContext.Provider value={value}>
      {children}
    </DesignContext.Provider>
  );
};

// 3. Create a custom hook for easy access to the context
export const useDesign = () => {
  return useContext(DesignContext);
};