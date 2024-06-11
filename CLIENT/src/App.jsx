import React from 'react'
import {Route , Routes} from "react-router-dom"
import Home from "./pages/Home"
import Navbar from './components/Common/Navbar'
import OpenRoute from "./components/core/Auth/OpenRoute"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import "./App.css"

export const App = () => {
  return (
   <div className="w-screen min-h-screen bg-richblack-900 flex flex-col font-inter">
    <Navbar/>
    <Routes>
      <Route path="/" element={<Home/>} />
       {/* Open Route - for Only Non Logged in User */}
       <Route
          path="login"
          element={
            <OpenRoute>
              <Login />
            </OpenRoute>
          }
        />
        <Route
          path="signup"
          element={
            <OpenRoute>
              <Signup />
            </OpenRoute>
          }
        />
    </Routes>
   </div>
  )
}

export default App;