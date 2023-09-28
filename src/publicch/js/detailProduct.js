
console.log('detailProduct.js loaded');
const socket = io();


const AddProductToCart =  () => {
  const addProductButtons = document.querySelectorAll('.addButtonStyle');
  addProductButtons.forEach(btn => { 
    btn.addEventListener('click', async() => {
      const pid = btn.getAttribute('data-id');
         //Traigo la informacion del user loggeado
         const user = await fetch('/api/sessions/current', {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json'
          }
      });
      if (!user.ok) {
          throw new Error('Failed to fetch current user');
      }
      const data = await user.json();
      //Extraigo la informacion del email y el role del user
      const currentUser = data.message; 
      const emailUser = currentUser.email;
      console.log(emailUser)

      
      //Traigo la informacion del product seleccionado
      const product = await fetch(`/api/products/${pid}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const dataProduct = await product.json();
    //Extraigo el owner del producto
    const currentProduct = dataProduct.payload;
    const ownerEmail = currentProduct.payload.owner;
     console.log(ownerEmail)

     if(emailUser!==ownerEmail){
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: `El producto ${pid} ha sido aniadido exitosamente`,
        showConfirmButton: false,
        timer: 1500
      })
      socket.emit('addedProduct', pid)
     }
     else{
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        title: 'No podes comprar tu propio producto',
        showConfirmButton: false,
        timer: 1500
      });

     }
    });
  });
};
// Call the function after the DOM is loaded
document.addEventListener('DOMContentLoaded', AddProductToCart);


const cartButton = document.getElementById('CartButton');

cartButton.addEventListener('click', async (event) => {
  console.log('clickeo el checkout')
  event.preventDefault();
  //Traigo la informacion del user desde current
  const response = await fetch('/api/sessions/current', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

//Si me trae info entonces extraigo el cid
  if (response.ok) {
    const data = await response.json();
    const cid = data.message.cart; 
    console.log(cid)
    //Le paso el cid a la ruta y me redirije a la misma
    if (cid) {
      window.location.replace(`/api/carts/${cid}`);
    } else {
      console.error('Invalid cart ID');
    }
  } else {
    console.error('Failed to fetch current session');
  }
});




