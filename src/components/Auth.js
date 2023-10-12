import { auth, googleProvider } from "../config/firebase"
import { signInWithPopup, signOut } from "firebase/auth"
import { Button } from "primereact/button"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"

export const Auth = () => {

  const navigate = useNavigate()


  useEffect(() => {
    if (localStorage.getItem("firebaseToken")) {
      navigate("/protected")
    }
   }
  )
  const signInWithGoogle = async () => {
    try {
      const a = await signInWithPopup(auth, googleProvider)
      localStorage.setItem("firebaseToken", a._tokenResponse.idToken)
      navigate("/protected")  
    } catch (error) {
      console.log(error)
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      localStorage.removeItem("firebaseToken")
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="align-items-center flex h-30rem justify-content-center w-full">
      <div className="">
        <Button
          icon="pi pi-google"
          onClick={signInWithGoogle}
          severity="danger"
          className="mr-2"
        >
          Sign in with google
        </Button>
        <Button onClick={logout} severity="warning">
          Signout
        </Button>
      </div>
    </div>
  )
}
