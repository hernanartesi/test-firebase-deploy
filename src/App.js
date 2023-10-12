import "./App.css"
import React, { useEffect } from "react"
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom"
import { Auth } from "./components/Auth"
import { auth } from "./config/firebase"
import { ProtectedContent } from "./components/ProtectedContent"
import { Menubar } from "primereact/menubar"
import { signOut } from "firebase/auth"

function App() {
  const items = [
    {
      label: "Caja",
      icon: "pi pi-dollar",
      to: "protected",
    },
    {
      label: "LOGOUT",
      icon: "pi pi-sign-out",
      command: async () => {
        await signOut(auth)
        localStorage.removeItem("firebaseToken")
      },
    }
  ]
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth></Auth>}></Route>
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <Menubar model={items} />

              <div className="my-5 mr-8 ml-8">
                <ProtectedContent></ProtectedContent>
              </div>
            </ProtectedRoute>
          }
        ></Route>
      </Routes>
    </BrowserRouter>
  )
}

const ProtectedRoute = ({ redirectPath = "/", children }) => {
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("firebaseToken")
    if (token) {
      auth.onAuthStateChanged((user) => {
        if (!user) {
          navigate(redirectPath)
        }
      })
    } else {
      navigate(redirectPath)
    }
  }, [])

  return children
}

export default App
