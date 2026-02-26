import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import NavBar from './components/layout/navbar'
import HeroSection from './components/section/HeroSection'
import FeatersSection from './components/section/FeatersSection'
import PrivacySection from './components/section/PrivacySection'
import ComposeSection from './components/section/CompositionSection'
import ThinkSection from './components/section/ThinkSection'
import TestimonialSection from './components/section/Testimonial'
import FooterSection from './components/section/FooterSection'
import FloatingBottomNav from './components/layout/BottomNavbar'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="bg-white">
      <NavBar />
      <HeroSection />
      <FeatersSection />
      <PrivacySection />
      <ComposeSection/>
      <ThinkSection/>
      <TestimonialSection/>
      <FooterSection/>
      <FloatingBottomNav/>


    </div>
  )
}

export default App
