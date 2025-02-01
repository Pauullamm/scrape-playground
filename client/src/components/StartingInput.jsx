import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateLink } from '../store/linkSlice.js'; // Redux action
import { Search } from 'lucide-react'; // Import search icon

export default function StartingInput() {
  const dispatch = useDispatch();
  const startingUrl = useSelector((state) => state.startingUrl.startingUrl); // Get Redux state

  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(startingUrl !== ''); // Initialize based on state

  const handleFocus = () => setIsFocused(true);
  const handleBlur = (e) => {
    setIsFocused(false);
    setHasValue(e.target.value !== '');
  };

  const handleChange = (e) => {
    const value = e.target.value;
    dispatch(updateLink({ startingUrl: value })); // Update Redux store
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (startingUrl.trim()) {
      console.log("Searching for:", startingUrl); // Replace with actual search functionality
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative mx-auto my-12 w-96 flex items-center border-b-2 border-gray-400">
      {/* Input field */}
      <input
        type="text"
        id="input"
        required
        value={startingUrl} // Bind input to Redux state
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange} // Update Redux store on change
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)} // Handle Enter key
        className="w-full px-4 py-2 text-lg bg-transparent outline-none focus:border-gray-700"
        placeholder="Enter URL to begin"
      />

      {/* Search button */}
      <button 
        type="submit" 
        className="p-2 hover:text-gray-500 transition"
      >
        <Search className="w-5 h-5" />
      </button>
    </form>
  );
};