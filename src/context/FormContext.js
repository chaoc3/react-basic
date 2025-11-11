import React, { createContext, useState, useContext } from 'react';

const FormContext = createContext();

export const FormProvider = ({ children }) => {
  const [formData, setFormData] = useState({
    targetUser: null,
    targetPainpoint: null,
    targetStage: null,
    user: null,
    scenario: null,
    mechanisms: [],
    infoSources: [],
    mode: null,
    // Add any other fields you collect
  });

  // A function to update a specific part of the form data
  const updateFormData = (field, value) => {
    setFormData(prevData => ({
      ...prevData,
      [field]: value,
    }));
  };

  return (
    <FormContext.Provider value={{ formData, updateFormData }}>
      {children}
    </FormContext.Provider>
  );
};

// Custom hook for easy access to the context
export const useForm = () => useContext(FormContext);