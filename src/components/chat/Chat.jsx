import { useState, useRef, useEffect } from "react"
import "./chat.css"
import EmojiPicker from "emoji-picker-react"
import {arrayUnion, doc, getDoc, onSnapshot, updateDoc} from "firebase/firestore"
import {db} from "../../lib/firebase"
import { useChatStore } from "../../lib/chatStore"
import { useUserStore } from "../../lib/userStore"
import upload from "../../lib/upload"

const Chat = () => {
const [open,setOpen] = useState(false)
const [text,setText] = useState("")
const [chat, setChat] = useState()
const [img, setImg] = useState({
    file: null,
    url: "",
})

const {chatId, user, isCurrentUserBlocked, isReceiverBlocked,} = useChatStore()
const {currentUser} = useUserStore()


const endRef = useRef(null)

useEffect(()=>{
    endRef.current?.scrollIntoView({behavior: "smooth"})
},[])

useEffect(() => {
    const unSub = onSnapshot(doc(db,"chats", chatId), (res) => {
        setChat(res.data())
    })

    return () =>{
        unSub()
    }
}, [chatId])



function handleEmoji(e){
    setText((prev) => prev + e.emoji)
    setOpen(false)
}

const handleImg = e =>{
    if(e.target.files[0]){
    setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0])
    })
    }
}

const handleSend = async () => {
    if(text === "") return

    let imgUrl = null

    try{

        if(img.file){
            imgUrl = await upload(img.file)
        }

        await updateDoc(doc(db, "chats", chatId),{
            messages:arrayUnion({
                senderId: currentUser.id,
                text,
                createdAt: new Date(),
                ...(imgUrl && {img: imgUrl})
            }),
        })

        const userIDs = [currentUser.id, user.id]

        userIDs.forEach(async (id)=> {

        const userChatsRef = doc(db,"userschats", id)
        const userChatsSnapshot = await getDoc(userChatsRef)

        if(userChatsSnapshot.exists()){
            const userChatsData = userChatsSnapshot.data()

            const chatIndex = userChatsData.chats.findIndex(c=>c.chatId === chatId)

            userChatsData.chats[chatIndex].lastMessage = text
            userChatsData.chats[chatIndex].isSeen = id === currentUser.id ? true : false
            userChatsData.chats[chatIndex].updatedAt = Date.now()

            await updateDoc(userChatsRef, {
                chats: userChatsData.chats,
            })
            
        }
    })
    endRef.current?.scrollIntoView({behavior: "smooth"})
    }catch(err){
        console.log(err)
    }

    setImg({
        file: null,
        url: "",
    })

    setText("")
}

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
            <img src={user?.avatar || "./avatar.png"} />
            <div className="texts">
                <span>{user?.username}</span>
                <p>Lorem ipsum dolor sit, amet.</p>
            </div>
        </div>
        {/*<div className="icons">
            <img src="./phone.png" />
            <img src="./video.png" />
            <img src="./info.png" />
        </div>*/}
      </div>
      <div className="center">
        { chat?.messages?.map((message) => (
            <div className={message.senderId === currentUser?.id ? "message own": "message"} key={message.createAt}>
                <div className="texts">
                {message.img && <img src={message.img} />}
                    <p>
                        {message.text}
                    </p>
                    {/* <span>{message}</span> */}
                </div>
            </div>
        ))}
        {img.url && (<div className="message own">
            <div className="texts">
                <img src={img.url} />
            </div>
        </div>)}
        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <div className="icons">
            <label htmlFor="file">
            <img src="./img.png" />
            </label>
            <input type="file" id="file" style={{display:"none"}} onChange={handleImg} disabled={isCurrentUserBlocked || isReceiverBlocked}/>
            {/*<img src="./camera.png" />
            <img src="./mic.png" />*/}
        </div>
        <div className="emoji" disabled={isCurrentUserBlocked || isReceiverBlocked}>
            <img src="./emoji.png" onClick={() => setOpen(!open)}/>
            <div className="picker" >
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
            </div>
        </div>
        <input type="text" placeholder={isCurrentUserBlocked || isReceiverBlocked ? "Nie możesz wysyłać wiadomości" : "Aa"} onChange={e=>setText(e.target.value)} value={text} disabled={isCurrentUserBlocked || isReceiverBlocked} />
        <button className="sendButton" onClick={handleSend} disabled={isCurrentUserBlocked || isReceiverBlocked}>Wyślij</button>
      </div>
    </div>
  )
}

export default Chat