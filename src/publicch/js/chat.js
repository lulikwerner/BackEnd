const socket = io({
    autoConnect:false //No quiero que se conecte cuando se cargue la pagina
});
const chatBox = document.getElementById('chatBox')

let user;


Swal.fire({
    title:"Identificate",
    text:"Para acceder al chat coloca tu nombre",
    icon:"question",
    input:"text",
    inputValidator:(value)=>{
        return !value && 'Necesitas identificarte para poder ingresar' //Si no ingreso nada mando el mensaje
    },
    allowOutsideClick:false, //No me permite salirme cuando hago click afuera
    allowEscapeKey: false //No me permite salirme cuando hago escape
}).then(result =>{
    if(result.isConfirmed) {
        user = result.value;
        socket.connect();
        socket.emit('chat:newParticipant',user)//Envio el usuario que se conecto
    }//Solo se va a conectar cuando tengo un usuario
})

chatBox.addEventListener('keyup', evt => {
    if (evt.key === "Enter") {
        if (chatBox.value.trim().length > 0) {
            socket.emit('chat:message', { user, message: chatBox.value.trim() });
            chatBox.value = ''; // clear the input field
        }
    }
});

socket.on('chat:messageLogs',data=>{
    const logs = document.getElementById('logs');
    let message = " ";
    data.forEach(log=>{
        message+=`${log.user} dice: ${log.message}</br>`
    })
    logs.innerHTML =message;
})

socket.on('chat:newConnection',data=>{
    if(!user) return;
    //Envio alerta toastify xxx se conecto al chat
    Swal.fire({
        toast:true,
        position:'top-end',
        showCOnfirmButton: false,
        timer: 2000,
        title:`${data} se unio al chat`,
        icon:"succes"
    })
})