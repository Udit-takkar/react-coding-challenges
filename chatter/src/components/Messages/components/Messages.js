import React, { useContext, useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import useSound from "use-sound";
import config from "../../../config";
import LatestMessagesContext, {
  LatestMessages,
} from "../../../contexts/LatestMessages/LatestMessages";
import TypingMessage from "./TypingMessage";
import Header from "./Header";
import Footer from "./Footer";
import Message from "./Message";
import "../styles/_messages.scss";
import INITIAL_BOTTY_MESSAGE from "../../../common/constants/initialBottyMessage";

const socket = io(config.BOT_SERVER_ENDPOINT, {
  secure: true,
  upgrade: false,
  transports: ["websocket"],
});
function scrollToBottomOfMessages() {
  const list = document.getElementById("message-list");

  list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
}
function Messages() {
  const [playSend] = useSound(config.SEND_AUDIO_URL);
  const [playReceive] = useSound(config.RECEIVE_AUDIO_URL);
  const { messages, setLatestMessage } = useContext(LatestMessagesContext);

  const [message, setMessage] = useState("");
  const onChangeMessage = (e) => {
    setMessage(e.target.value);
  };
  const [messageList, setMessageList] = useState([
    { user: "bot", message: INITIAL_BOTTY_MESSAGE, id: Date.now() },
  ]);
  const [botTyping, setBotTyping] = useState(false);

  useEffect(() => {
    socket.off();
    socket.on("bot-message", (message) => {
      setBotTyping(false);
      setLatestMessage("bot", message);
      setMessageList([
        ...messageList,
        { user: "bot", message: message, id: Date.now() },
      ]);
      playReceive();
    });
  }, [messageList]);

  useEffect(() => {
    socket.on("bot-typing", () => {
      setBotTyping(true);
    });
  });
  const sendMessage = useCallback(() => {
    if (!message) {
      return;
    }
    setMessageList([
      ...messageList,
      { user: "me", message: message, id: Date.now() },
    ]);
    socket.emit("user-message", message);
    playSend();
    scrollToBottomOfMessages();
    setMessage("");
    document.getElementById("user-message-input").value = "";
  }, [messages, message]);
  return (
    <div className="messages">
      <Header />
      <div className="messages__list" id="message-list">
        {messageList.map((message) => {
          return (
            <Message key={message.id} message={message} botTyping={botTyping} />
          );
        })}
      </div>
      {botTyping ? <TypingMessage /> : null}
      <Footer
        message={message}
        sendMessage={sendMessage}
        onChangeMessage={onChangeMessage}
      />
      {/* <Footer /> */}
    </div>
  );
}

export default Messages;
