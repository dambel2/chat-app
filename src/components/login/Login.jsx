import { useState } from "react"
import "./login.css"
import { toast } from "react-toastify"
import {createUserWithEmailAndPassword, signInWithEmailAndPassword} from "firebase/auth"
import {auth, db} from "../../lib/firebase"
import {collection, doc, getDocs, query, setDoc, where} from "firebase/firestore"
import upload from "../../lib/upload"


const Login = () => {

const [avatar, setAvatar] = useState({
    file:null,
    url:""
})

const [loading, setLoading] = useState(false)

const handleAvatar = e =>{
    if(e.target.files[0]){
    setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0])
    })
    }
}

const handleLogin = async (e) =>{
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.target)
    const {email, password} = Object.fromEntries(formData)

    try{

      await signInWithEmailAndPassword(auth,email,password)
      
    }catch(err){
      console.log(err)
      toast.error(err.message)
    } finally{
      setLoading(false)
    }
}

const handleRegister = async (e) =>{
  e.preventDefault()
  setLoading(true)
  
  const formData = new FormData(e.target)
  const {username, email, password} = Object.fromEntries(formData)

  

  
  
  

  try{

    const usersRef = collection(db, "users");
  const q = query(usersRef, where("username", "==", username));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    return toast.warn("Nazwa została już zajęta!");
  }

    if (!username || !email || !password)
      return toast.warn("Wypełnij wszystkie pola!");
    
    
    const res = await createUserWithEmailAndPassword(auth,email,password)

    const imgUrl = avatar.file ? await upload(avatar.file) : "./avatar.png";

    await setDoc(doc(db, "users", res.user.uid), {
      username,
      email,
      password,
      avatar: imgUrl,
      id: res.user.uid,
      blocked: [],
    })

    await setDoc(doc(db, "userschats", res.user.uid), {
      chats: [],
    })

    toast.success("Konto utworzone! Możesz bezpiecznie zalogować się do SafeLink!")

    window.location.href = "/dashboard";

  }catch(err){
    console.log(err)
    toast.error(err.message)
  }finally{
    setLoading(false)
  }

}

  return (
    <div className="login">
      <div className="item">
        <h2>Witamy ponownie,</h2>
        <form onSubmit={handleLogin}>
            <input type="text" placeholder="Email" name="email" />
            <input type="password" placeholder="Hasło" name="password" />
            <button disabled={loading}>{loading ? "Ładowanie..." : "Zaloguj się"}</button>
        </form>
      </div>
      <div className="separator"></div>
      <div className="item">
        <h2>Stwórz Konto</h2>
        <form onSubmit={handleRegister}>
            <label htmlFor="file">
                <img src={avatar.url || "./avatar.png"} />
                Dodaj swoje profilowe</label>
            <input type="file" id="file" style={{display:"none"}} onChange={handleAvatar}/>
            <input type="text" placeholder="Nazwa Użytkownika" name="username" />
            <input type="text" placeholder="Email" name="email" />
            <input type="password" placeholder="Hasło" name="password" />
            <button disabled={loading}>{loading ? "Ładowanie..." : "Zarejestruj się"}</button>
        </form>
      </div>
    </div>
  )
}

export default Login
