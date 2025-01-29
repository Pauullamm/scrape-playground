import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateLink } from '../store/linkSlice.js'; // Make sure to import the action

export default function StartingInput() {
  const dispatch = useDispatch();
  const startingUrl = useSelector((state) => state.startingUrl.startingUrl); // Get the value from Redux state

  const handleFocus = () => setIsFocused(true);
  const handleBlur = (e) => {
    setIsFocused(false);
    setHasValue(e.target.value !== '');
  };

  const handleChange = (e) => {
    const value = e.target.value;
    dispatch(updateLink({ startingUrl: value })); // Dispatch action to update the store
  };

  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(startingUrl !== ''); // Initialize with Redux state value

  return (
    <div className="relative mx-auto my-12 w-96">
      {/* Input field */}
      <input
        type="text"
        id="input"
        required
        value={startingUrl} // Set input value to Redux state
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange} // Update Redux store on change
        className="w-full px-0 pb-1 text-lg border-b-2 border-gray-400 bg-transparent outline-none focus:border-gray-700"
      />
      
      {/* Label */}
      <label
        htmlFor="input"
        className={`absolute left-0 transition-all duration-300 ease-in-out pointer-events-none ${
          (isFocused || hasValue) ? '-top-5 text-sm text-gray-600' : 'top-0 text-gray-300'
        }`}
      >
        Enter URL to begin
      </label>

      {/* Underline */}
      <div
        className={`absolute bottom-0 left-0 h-[2px] w-full bg-gray-700 transform transition-all duration-300 ease-in-out ${
          isFocused || hasValue ? 'scale-x-100' : 'scale-x-0'
        }`}
      ></div>
    </div>
  );
};

