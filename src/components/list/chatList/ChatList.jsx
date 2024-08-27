import { useEffect, useState } from "react";
import "./chatList.css";
import AddUser from "./addUser/addUser";
import { useUserStore } from "../../../lib/userStore";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import {useChatStore} from "../../../lib/chatStore"


const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [addMode, setAddMode] = useState(false);
  

  const { currentUser } = useUserStore();
  const { changeChat } = useChatStore();
 

  useEffect(() => {
    const unSub = onSnapshot(
      doc(db, "userschats", currentUser.id),
      async (res) => {
        const items = res.data().chats;

        const promises = items.map(async (item) => {
          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);

          const user = userDocSnap.data();

          return { ...item, user };
        });

        const chatData = await Promise.all(promises);

        setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
      }
    );

    return () => {
      unSub();
    };
  }, [currentUser.id]);


  const handleSelect = async (chat) => {

    const userChats = chats.map(item => {
      const {user, ...rest} = item
      return rest
    })

    const chatIndex = userChats.findIndex(item => item.chatId === chat.chatId)

    userChats[chatIndex].isSeen = true

    const userChatsRef = doc(db, "userschats", currentUser.id)

    try{

      await updateDoc(userChatsRef,{
        chats: userChats,
      })
      changeChat(chat.chatId, chat.user)
    }catch(err){
      console.log(err)
    }

  }

function closeAddMode(){
  setAddMode(false)
}
  
  
  return (
    <div className="chatList">
      <div className="search">
        <div className="friends" onClick={() => setAddMode((prev) => !prev)}>
          <p>{addMode ? "Wyjdź" : "Dodaj Znajomych"}</p>
          <img
            src={addMode ? "./minus.png" : "./plus.png"}
            alt=""
            className="add"
          />
        </div>
        
      </div>
      {chats && chats.map((chat) => {
                return (
                    <div 
                      className="item" 
                      key={chat.chatId} 
                      onClick={() => handleSelect(chat)}
                      style={{
                        backgroundColor: chat?.isSeen ? "transparent" : "#5183fe"
                      }}
                      >
                        <img src={chat.user.blocked.includes(currentUser.id) ? "./avatar.png" : chat.user.avatar || "./avatar.png"} alt="" />
                        <div className="texts">
                            <span>{chat.user.blocked.includes(currentUser.id) ? "Użytkownik" : chat.user.username}</span>
                            <p>{chat.lastMessage}</p>
                        </div>
                    </div>
                )
            }
            )}
      {addMode && <AddUser closeAddMode={closeAddMode}/>}
    </div>
  );
};

export default ChatList;