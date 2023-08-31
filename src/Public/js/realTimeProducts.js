const socket = io();
// Obtengo el Formulario



const form = document.querySelector('form')
const products = document.getElementById('products');

//Muestro el producto agregado
socket.on('productsAdd', (data) => {
console.log('agregando')
    console.log('soyyy',data)
    products.innerHTML  += `<div class="card bg-secondary mb-3 mx-4 my-4" style="max-width: 20rem;">
                       
                        <div class="card-body">
                            <h4 class="card-title">${data.title}</h4>
                            <p class="card-text">
                                <li>
                                    id: ${data._id}
                                </li>
                                <li>
                                    category: ${data.category}
                                </li>
                                <li>
                                    description: ${data.description}
                                </li>
                                <li>
                                    price: $${data.price}
                                </li>
                                
                                <li>
                                code: ${data.code}
                            </li>
                                <li>
                                    stock: ${data.stock}
                                </li>
                                <li>
                                status: ${data.status}
                                </li>
                                <li>
                                thumbnail:
                                <img src="data:image/png;base64, ${data.thumbnail}" alt="Thumbnail">
                            </li>
                            </p>
                        </div>
                        <div class="d-flex justify-content-center mb-4">
                            <button type="button" class=" btn btn-danger" id="${data._id}">Delete</button>
                            <br>
                        </div>
                        
                    </div>
                </div>`;
  

    btnDelete(); // Llamo a la funcion btnEliminar 
})

//Muestro todos los productos
socket.on('products', (data) => {
    let productos = '';
   data.forEach(producto => {
        productos += `<div class="card bg-secondary mb-3 mx-4 my-4" style="max-width: 20rem;">
                       
                        <div class="card-body">
                            <h4 class="card-title">${producto.title}</h4>
                            <p class="card-text">
                                <li>
                                    id: ${producto._id}
                                </li>
                                <li>
                                    category: ${producto.category}
                                </li>
                                <li>
                                    description: ${producto.description}
                                </li>
                                <li>
                                    price: $${producto.price}
                                </li>
                                
                                <li>
                                code: ${producto.code}
                            </li>
                                <li>
                                    stock: ${producto.stock}
                                </li>
                                <li>
                                status: ${producto.status}
                                </li>
                                <li>
                                    thumbnail: ${producto.thumbnails}
                                </li>
                            </p>
                        </div>
                        <div class="d-flex justify-content-center mb-4">
                            <button type="button" class=" btn btn-danger" id="${producto._id}">Delete</button>
                            <br>
                        </div>
                        
                    </div>
                </div>`;
    });
    products.innerHTML = productos;
    btnDelete(); // Llamo a la funcion btnEliminar 
});


const btnDelete = () => {
    const buttons = document.querySelectorAll('.btn-danger');
    buttons.forEach(btn => {
        btn.addEventListener('click', async (event) => {
            event.preventDefault();
            try {
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
                const userEmail = currentUser.email;
                const userRole = currentUser.role;
                   //Traigo la informacion del product seleccionado
                   const product = await fetch(`/api/products/${btn.id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const dataProduct = await product.json();
                //Extraigo el owner del producto
                const currentProduct = dataProduct.payload;
                const ownerEmail = currentProduct.payload.owner;
               
                if (!product.ok) {
                    throw new Error('Failed to fetch current product');
                }
                if(userRole ==='PREMIUM' && userEmail===ownerEmail ||userRole =='ADMIN' ){
                    socket.emit('deleteProduct', btn.id, ownerEmail);
        Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: `Deleting product with id ${btn.id}`,
            showConfirmButton: false,
            timer: 1500
          })
        }else{
            Swal.fire({
                position: 'top-end',
                icon: 'error',
                title: 'No puedes borrar productos de otros',
                showConfirmButton: false,
                timer: 1500
              });
        }
    
            } catch (error) {
                console.error('Error fetching current user or product:', error);
            }
        });
    });
};

// Listen for the submit event on the form  
form.addEventListener('submit', async (event)  => {
    event.preventDefault();
    console.log("Submit event listener function called");
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    console.log('soyladata',data)
    //Traigo la informacion del user desde current
    const response = await fetch('/api/sessions/current', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    //Le pongo por default este email
    let userEmail = 'adminCoder@coder.com'; 

    if (response.ok) {
        const userData = await response.json();
        console.log('User data:', userData);
        userEmail = userData.message.email; // Si el fetch me trae un email entonces envio ese email encambio del de admin
    }
    socket.emit('newProduct', { data, userEmail });
  
   
    form.reset();
  });