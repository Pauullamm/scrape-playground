import React, { useState } from "react";
import hbg from '../../assets/hbg.png'
import StartingInput from '../StartingInput.jsx'
import '../../App.css'

export default function HomePage() {
    const [url, setUrl] = useState("");

    const handleInputChange = (e) => {
        setUrl(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle the URL submission here
        console.log("URL submitted:", url);
    };

    return (
        <div className="relative">
            {/* Background image */}
            <img
                src={hbg}
                className="fixed opacity-50 w-full h-full object-cover"
                alt="Background"
            />

            {/* Hero text */}
            <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 text-center text-white z-10">
                <h1 className="text-8xl font-bold mb-4">Explore. Build. Extract.</h1>
                <p className="text-xl mb-6">Your comprehensive solution for web scraping</p>
                <StartingInput />
                
            </div>
        </div>
    );
}
