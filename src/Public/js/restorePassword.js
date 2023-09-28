document.addEventListener("DOMContentLoaded", () => {
const form = document.getElementById('restorePasswordForm')
const text = document.getElementById('message');
const urlParams = new Proxy(new URLSearchParams(window.location.search),{
    get: (searchParams,prop) =>searchParams.get(prop)
})
//console.log(urlParams.token)
form.addEventListener('submit', async(event)=>{
    event.preventDefault();
     
    const data = new FormData(form);
    const  obj ={};
    data.forEach((value,key)=>(obj[key] = value));
    obj.token = urlParams.token;
    const response = await fetch("/api/sessions/restorePassword", {
        method:'POST',
        body:JSON.stringify(obj),
        headers:{
            "Content-Type":"application/json"
        }
    });

    console.log(response)
    const responseData = await response.json();
    if(responseData.status === "success"){
        text.innerHTML = "Su contrasenia ha sido modificada exitosamente"
        window.location.replace('/login');
    }else{
        text.innerHTML = responseData.error;
    }
});
});