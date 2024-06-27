"use client"

import  {useEffect,useState} from 'react';
import {socket} from "@/utils/socket-cleint"
export default function Home() {
    
  const [message,setMessage] = useState('hello')

  useEffect(() => {
    socket.on('news', (message) => {
      console.log('received');
      console.log(message,'cli');
        setMessage(message)
    })
    return () => {
      socket.off('connect')
    }
  }, [])
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} className='bg-white text-black'/>
      <button onClick={() => socket.emit('news',message)}>send</button>
         {message}
    </main>
  );
}
