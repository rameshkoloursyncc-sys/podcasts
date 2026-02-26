import { useState } from 'react'
import './App.css'
import NavBar from './components/layout/Navbar'
import HeroSection from './components/section/HeroSection'
import FeatersSection from './components/section/FeatersSection'
import PrivacySection from './components/section/PrivacySection'
import ComposeSection from './components/section/CompositionSection'
import ThinkSection from './components/section/ThinkSection'
import TestimonialSection from './components/section/Testimonial'
import FooterSection from './components/section/FooterSection'
import FloatingBottomNav from './components/layout/BottomNavbar'

function App() {
  return (
    <div className="bg-white">
      <NavBar />
      <HeroSection />
      <FeatersSection />
      <PrivacySection />
      <ComposeSection/>
      <ThinkSection />
      <TestimonialSection  />
      <FooterSection />
      <FloatingBottomNav/>
    </div>
  )
}

export default App
