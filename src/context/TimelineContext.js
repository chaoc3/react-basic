// src/context/TimelineContext.js

import React, { createContext, useState, useContext } from 'react';


// Define the shape of the data and functions we'll share
const TimelineContext = createContext({
  activeStageId: 1,
  completedStages: new Set(),
  selectedCards: {}, // e.g., { 3: new Set([1, 2]), 4: new Set([5]) }
  setActiveStage: () => {},
  completeStage: () => {},
  toggleCardSelection: () => {},
});

// Create a custom hook for easy access
export const useTimeline = () => {
  return useContext(TimelineContext);
};

// Create the Provider component that will manage the state
export const TimelineProvider = ({ children }) => {
  const [activeStageId, setActiveStageId] = useState(1);
  const [completedStages, setCompletedStages] = useState(new Set());
  const [selectedCards, setSelectedCards] = useState({});

  // Function to set the currently active page/stage
  const handleSetActiveStage = (id) => {
    setActiveStageId(id);
  };

  // Function to mark a main stage as completed
  const handleCompleteStage = (id) => {
    // We don't want to remove completion status if the user goes back
    if (!completedStages.has(id)) {
      setCompletedStages(prev => new Set(prev).add(id));
    }
  };

  // Function to handle selecting/deselecting a card (sub-node)
  const handleToggleCardSelection = (stageId, cardId) => {
    setSelectedCards(prev => {
      const newSelected = { ...prev };
      const stageSelections = new Set(newSelected[stageId] || []);

      if (stageSelections.has(cardId)) {
        stageSelections.delete(cardId);
      } else {
        stageSelections.add(cardId);
      }
      
      newSelected[stageId] = stageSelections;
      return newSelected;
    });
  };

  const value = {
    activeStageId,
    completedStages,
    selectedCards,
    setActiveStage: handleSetActiveStage,
    completeStage: handleCompleteStage,
    toggleCardSelection: handleToggleCardSelection,
  };

  return (
    <TimelineContext.Provider value={value}>
      {children}
    </TimelineContext.Provider>
  );
};