const form = document.getElementById('registerForm')

form.addEventListener('submit', async(event)=>{
    event.preventDefault();
    const data = new FormData(form);
    const  obj ={};
    data.forEach((value,key)=>(obj[key] = value));
    console.log(obj);
    const response = await fetch('/api/sessions/register', {
        method:'POST',
        body:JSON.stringify(obj),
        headers:{
            "Content-Type":"application/json"
        }

    })
    const responseData = await response.json();
    console.log(responseData);
    if(responseData.status ==="success"){
        console.log("Registration success");
        Swal.fire({
            toast:true,
            position:'top-end',
            showConfirmButton: false,
            timer:2000,
            title:`Se ha registrado exitosamente`,
            icon:"success"
        }).then(() => {
            window.location.replace('/login');
          });
    }else{
        Swal.fire({
            toast:true,
            position:'top-end',
            showConfirmButton: false,
            timer:2000,
            title:`Por favor complete todos los campos`,
            icon:"error"
        }) 
    }
    
})