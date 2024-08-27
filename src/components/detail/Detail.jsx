import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore'
import { useChatStore } from '../../lib/chatStore'
import { auth, db } from '../../lib/firebase'
import { useUserStore } from '../../lib/userStore'
import './detail.css'

const Detail = () => {

  const { user, isCurrentUserBlocked, isReceiverBlocked, changeBlock} = useChatStore()
  const {currentUser} = useUserStore()

  const handleBlock = async () => {
    if (!user) return

    const userDocRef = doc(db, "users", currentUser.id)

    try{
      await updateDoc(userDocRef,{
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id)
      })
      changeBlock()
    }catch(err){
      console.log(err)
    }
  }


  return (
    <div className='detail'>
      <div className="user">
        <img src={user?.avatar || "./avatar.png"} />
        <h2>{user?.username}</h2>
        <p>Lorem ipsum dolor sit, amet.</p>
      </div>
      <div className="info">
       { /*<div className="option">
          <div className="title">
            <span>Chat Settings</span>
            <img src="./arrowUp.png" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Chat Settings</span>
            <img src="./arrowUp.png" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Privacy & help</span>
            <img src="./arrowUp.png" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared photos</span>
            <img src="./arrowDown.png" />
          </div>
          <div className="photos">
            <div className="photoItem">
              <div className="photoDetail">
                <img src="./avatar.png" />
                <span>photo_2040_2.png</span>
              </div>
            
            <img src="./download.png" className='icon'/>
            </div>
            <div className="photoItem">
              <div className="photoDetail">
                <img src="./avatar.png" />
                <span>photo_2040_2.png</span>
              </div>
            
            <img src="./download.png" className='icon'/>
            </div>
            <div className="photoItem">
              <div className="photoDetail">
                <img src="./avatar.png" />
                <span>photo_2040_2.png</span>
              </div>
            
            <img src="./download.png" className='icon'/>
            </div>
            <div className="photoItem">
              <div className="photoDetail">
                <img src="./avatar.png" />
                <span>photo_2040_2.png</span>
              </div>
            
            <img src="./download.png" className='icon'/>
            </div>
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Files</span>
            <img src="./arrowUp.png" />
          </div>
        </div>*/}
        <h3>Brak Informacji o użytkowniku w SafeLine Stawiamy na Anonimowość!</h3>
        <button onClick={handleBlock}>{isCurrentUserBlocked ? "Jesteś zablokowany!" : isReceiverBlocked ? "Użytkownik zablokowany" : "Zablokuj"}</button>
        <button className='logout' onClick={() => auth.signOut()}>Wyloguj się</button>
      </div>
    </div>
  )
}

export default Detail
