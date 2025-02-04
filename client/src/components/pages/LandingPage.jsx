import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion'
import { GiSniffingDog } from "react-icons/gi"
import { MdOutlineFindInPage } from "react-icons/md"
import { TbRobot } from "react-icons/tb"
import { FiArrowRight } from "react-icons/fi";
import demo from "../../assets/demo.mov"

import '../../App.css'

export default function LandingPage() {
    const navigate = useNavigate();
    const [isInView, setIsInView] = useState(false);
    const videoRef = useRef(null);

    useEffect(() => {
        if (isInView && videoRef.current) {
            videoRef.current.play().catch(error => {
                // Handle autoplay restrictions
                console.log('Video autoplay failed:', error);
            });
        } else if (!isInView && videoRef.current) {
            videoRef.current.pause();
        }
    }, [isInView]);
    const handleGetStarted = () => {
        navigate('/home');
    }

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    }

    return (
        <div className="relative min-h-screen bg-gradient-to-b from-black to-gray-900 text-white overflow-hidden">
            {/* Hero Section */}
            <div className="container mx-auto px-4 pt-32 pb-20">
                <motion.div
                    className="text-center max-w-4xl mx-auto"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <motion.h1
                        className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight transform transition duration-500 hover:scale-105"
                    >
                        <motion.span
                            className="block bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-600"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            Hunt.
                        </motion.span>
                        <motion.span
                            className="block mt-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-300 to-amber-100"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            Discover.
                        </motion.span>
                        <motion.span
                            className="block mt-4 bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-600"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            Extract.
                        </motion.span>
                    </motion.h1>

                    <motion.p
                        className="text-xl md:text-2xl text-gray-200 font-medium max-w-2xl mx-auto leading-relaxed mt-8"
                        {...fadeInUp}
                    >
                        Terrier sniffs out hidden information and retrieves it for you to assist with your web scraping process.
                    </motion.p>
                    <motion.div
                        className="max-w-2xl mx-auto mt-12"
                        {...fadeInUp}
                    >
                        <div className='flex justify-center'>
                            <div className="relative group">
                                {/* Aura background */}
                                <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-600 rounded-lg blur opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>

                                {/* Button */}
                                <button
                                    onClick={handleGetStarted}
                                    className="relative px-6 py-2 bg-gradient-to-r from-amber-400 to-orange-600 rounded-lg hover:opacity-90 transition-all duration-300 flex items-center z-10"
                                >
                                    Begin the hunt
                                    <FiArrowRight className="ml-2" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                    <div className="flex justify-center space-x-6 opacity-75 mt-8">
                        <div className="h-1 w-16 bg-amber-400 rounded-full animate-pulse" />
                        <div className="h-1 w-16 bg-orange-500 rounded-full animate-pulse delay-100" />
                        <div className="h-1 w-16 bg-red-600 rounded-full animate-pulse delay-200" />
                    </div>
                </motion.div>
            </div>

            {/* Features Section - Hunting Grounds */}
            <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 bg-gray-900/80 backdrop-blur-lg">
                <div className="max-w-7xl mx-auto">
                    <motion.h2
                        className="text-3xl md:text-4xl font-bold text-center mb-16"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-600">
                            Pack Hunting Features
                        </span>
                    </motion.h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            {
                                icon: <GiSniffingDog className="w-12 h-12" />,
                                title: 'Background request sniffing',
                                desc: 'Sniff out additional resource calls made from a site'
                            },
                            {
                                icon: <MdOutlineFindInPage className="w-12 h-12" />,
                                title: 'DOM parsing with agents',
                                desc: 'Tired of manually checking for resource variables? Let our agents handle it for you'
                            },
                            {
                                icon: <TbRobot className="w-12 h-12" />,
                                title: 'Browser Automation',
                                desc: 'Good old-fashioned breaking in'
                            }
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                className="p-8 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 transform transition-all hover:scale-105 hover:border-amber-500/30"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <div className="text-amber-400 mb-6">{feature.icon}</div>
                                <h3 className="text-2xl font-bold text-amber-400 mb-4">{feature.title}</h3>
                                <p className="text-gray-300 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Code Section - Alpha Wolf Den */}
            <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 to-gray-800">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                    <motion.div
                        className="space-y-8"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-400">
                                Born to Hunt
                            </span>
                        </h2>
                        <p className="text-md text-gray-300 leading-relaxed">
                            Terrier enhances traditional web scraping by first sniffing and searching valuable data from background resources.
                            <br />
                            <br />
                            This enables a more efficient approach, allowing you to gather critical information before leveraging common techniques like browser automation, proxies, and captcha bypasses.
                            <br />
                            <br />
                            With Terrier, you can simplify your scraping process and ensure that you’re always retrieving the most relevant data.
                        </p>
                    </motion.div>


                    <motion.div
                        className="relative group"
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false, margin: "0px 0px -100px 0px" }}
                        onViewportEnter={() => setIsInView(true)}
                        onViewportLeave={() => setIsInView(false)}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition-all duration-500"></div>
                        <div className="relative rounded-xl bg-gray-900 border border-gray-700/50">
                            <video
                                ref={videoRef}
                                src={demo}
                                muted
                                playsInline
                                controls={false} // Set to true if you want controls
                                className="w-full h-auto object-cover rounded-xl"
                            />
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}

