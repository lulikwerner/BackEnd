document.addEventListener("DOMContentLoaded", () => {
const form = document.getElementById('restoreRequestForm')
const text = document.getElementById('message');
form.addEventListener('submit', async(event)=>{
    event.preventDefault();
    console.log('click')
    const data = new FormData(form);
    const  obj ={};
    data.forEach((value,key)=>(obj[key] = value));
    const response = await fetch("/api/sessions/restoreRequest", {
        method:'POST',
        body:JSON.stringify(obj),
        headers:{
            "Content-Type":"application/json"
        }
    });
    console.log(response)
    const responseData = await response.json();
    if(responseData.status === "success"){
        text.innerHTML = "Se ha enviado un correo de verificación"
    }else{
        text.innerHTML = responseData.error
    }
})
})
