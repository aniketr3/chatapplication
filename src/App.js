import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import { Client} from '@stomp/stompjs';
let client;



function App() {
 const[username,Setusername] = useState('');
 const[submitbuttonclicked,Setsubmitbuttonclicked] = useState(false)
 const[createroomname,Setcreateroomname] = useState('')
 const[joinroomname,Setjoinroomname] = useState('')
 const [rooms,Setrooms] = useState([])
 const[room,Setroom] = useState('');
 const[message,Setmessage]= useState('')
 const[messages,Setmessages] = useState([])

//  useEffect(()=>[
//     console.log(rooms)
//  ],[rooms])

 const intiliaseconnections=()=>{
  client = new Client({
    brokerURL: 'ws://localhost:8080/ws',
    onConnect: () => {
      console.log("connected");
      client.subscribe('/topic/common', message =>{
       console.log(`Received coomon: ${message.body}`)
        
      }
      );

      // const roomrecieved = JSON.parse(message.body);
      // console.log(`Received username: ${message.body}`)
      // Setrooms(roomrecieved);
      //   console.log(roomrecieved);

      client.subscribe(`/topic/${username}`, message=>{
        
        console.log(`Received username: ${message.body}`)
        const roomrecieved = JSON.parse(message.body);
       if(roomrecieved.type!=="ACK"){
        Setrooms(roomrecieved);
        console.log(roomrecieved);
       }
      }
      );


      client.publish({ destination: '/app/newUser', body: JSON.stringify({messageType:"NEWUSER",messageString:`${username}`,username:username }) });

      
    },
    onWebSocketError : ()=>{
      console.log(`error with webscoket`)
    },

    onStompError :()=>{
      console.log(`error with stomp `)
    },

    onDisconnect :()=>{
      console.log(`dissconnetd`)
    }
       
  });
         
  client.activate();
 }

 const handleroomcreate=()=>{
  console.log(createroomname)
  const message = JSON.stringify({messageType:"CREATEROOM" , messageString:createroomname, username:username})
  client.publish({destination:`/app/createRooms`,body:message })
  // client.publish({destination:`/topic/common` ,body:message})
  

  client.subscribe(`/topic/${createroomname}`,message=>{
    console.log("recieved message in room" , message.body)
    // const response = JSON.parse(message.body)
    // Setmessages((prevState)=>[...prevState,{username:response.messageSender,text:response.messageText}])
  })

  Setcreateroomname('')
 }


//  const handleroomjoin=()=>{
//   const message = JSON.stringify({messageType:"JOINROOM" , messageString:joinroomname, username:username})
//   client.publish({destination:`/app/joinRoom` ,body:message})
//   Setjoinroomname('')
//  }

 const handleroomjoin=(room)=>{
  client.unsubscribe(`/topic/${room}`)
  const message = JSON.stringify({messageType:"JOINROOM" , messageString:room, username:username})
  client.publish({destination:`/app/joinRoom` ,body:message})
     Setroom(room);
  client.subscribe(`/topic/${room}`,message=>{
    console.log(`${message.body}`)
    const response = JSON.parse(message.body)
    Setmessages((prevState)=>[{username:response.messageSender,text:response.messageText},...prevState])

  })
 }
 

 const handlesubmitclick=()=>{
    if(username===''){
      return;
    }
     else{
      Setsubmitbuttonclicked(true);
      intiliaseconnections();
     }
 }

 const handlesendmsg=()=>{
       const messagebody = {messageText:message,messageRoom:room,messageSender:username}
     client.publish({destination:`/app/message`,body:JSON.stringify(messagebody)})

     Setmessage('')
 }

  return (
    <div className="container " style={{textAlign:'center'}} >
      
      {!submitbuttonclicked && <div className='input-field'>
        <input type='text' onChange={(event)=>Setusername(event.target.value)}/>

        <button onClick={handlesubmitclick}>Submit</button>
      </div>}

        <label>Create Rooms</label>
     

        {submitbuttonclicked && <div className='join-room'>
        <input type='text' onChange={(event)=>Setcreateroomname(event.target.value) }/>
        <button onClick={handleroomcreate}>Createe room</button>
      </div>}

      {/* {submitbuttonclicked && <div className='input-room-field'>
        <input type='text' onChange={(event)=>Setroom(event.target.value) }/>
        <button onClick={handleroomjoin}>Enter Room</button>
      </div>} */}

      <div className='mainbody'>
      <div className='roomlist'>
            ROOMS AVAILABLE
        {rooms.length>0 && rooms?.map((room)=>{
          return <div className="roomname" key={room} onClick={()=>handleroomjoin(room)}>
            {room}
            </div>
        })}
      </div>  

      <div className='messagebox'>
        <div className='messages'>
          
            {messages.map((item)=>(
              <div className='message' style={{backgroundColor: `${item.username === username ? '#616161':'#a8a8a8'} `,
               left: `${item.username === username ? '55%' : '2%'}` }}>
               <div className='messageusername'> {item.username}</div>
               <div className='messagetext'>{item.text}</div>
               </div>
            ))}
        </div>

        <div className='messageinput'>
         <input type="text" className='messageinputtext' placeholder='type your message' onChange={(event)=>Setmessage(event.target.value)} value={message}/>
         <button onClick={()=>handlesendmsg()}>Send the message</button>
        </div>
      </div>
      </div>

         
      
      
    </div>
  );
}

export default App;
