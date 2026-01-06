import React, { createContext, useState, useContext, useEffect } from 'react';
import { getAllLabels, createLabel as apiCreateLabel, updateLabel as apiUpdateLabel, deleteLabel as apiDeleteLabel } from '../services/label.service';

const LabelContext = createContext();

export const useLabels = () => useContext(LabelContext);

export const LabelProvider = ({ children }) => {
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch labels
  const fetchLabels = async () => {
    try {
      setLoading(true);
      const data = await getAllLabels();
      setLabels(data || []);
    } catch (error) {
      console.error("Error fetching labels:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if we have a token (user logged in) presumably. 
    // Assuming this provider is inside Auth check or we check for token here?
    // Depending on when it's mounted. Safe to try fetch, it might fail 401.
    if (localStorage.getItem('token')) {
        fetchLabels();
    }
  }, []);

  const addLabel = async (name) => {
    try {
      const newLabel = await apiCreateLabel(name);
      setLabels(prev => [...prev, newLabel]);
      return newLabel;
    } catch (error) {
      console.error("Error creating label:", error);
      throw error;
    }
  };

  const updateLabel = async (id, name) => {
    try {
      // Optimistic update
      setLabels(prev => prev.map(l => l._id === id ? { ...l, name } : l));
      await apiUpdateLabel(id, name);
    } catch (error) {
      console.error("Error updating label:", error);
      fetchLabels(); // Revert
      throw error;
    }
  };

  const deleteLabel = async (id) => {
    try {
      // Optimistic delete
      setLabels(prev => prev.filter(l => l._id !== id));
      await apiDeleteLabel(id);
    } catch (error) {
      console.error("Error deleting label:", error);
      fetchLabels(); // Revert
      throw error;
    }
  };

  const refreshLabels = fetchLabels;

  return (
    <LabelContext.Provider value={{ labels, loading, addLabel, updateLabel, deleteLabel, refreshLabels }}>
      {children}
    </LabelContext.Provider>
  );
};

export default LabelContext;
