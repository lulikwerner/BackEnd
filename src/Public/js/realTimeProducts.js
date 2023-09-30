document.addEventListener('DOMContentLoaded', () => {

  const formProducts = document.getElementById('formProducts');
  const creatProductsFiles = document.getElementById('creatProductsFiles');

  formProducts.addEventListener('submit', async (event) => {
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
      const formData = new FormData(formProducts);
      // Append  userEmail al formData
      formData.append('userEmail', userEmail);
      const response = await fetch(`/api/products/`, {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        showConfirmationDialog()
        window.location.reload();

      } else {
        showNotConfirmationDialog()
      }
    } catch (error) {
      console.log(error)
    }
    formProducts.reset();
  })
})

const deleteProductsbuttons = document.querySelectorAll('.btn-danger');


deleteProductsbuttons.forEach(btn => {
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
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const dataProduct = await product.json();

      if (product.ok) {
        //Extraigo el producto del owner
        const ownerEmail = dataProduct.message.resultDelete.owner;

        if (userRole === 'PREMIUM' && userEmail === ownerEmail || userRole == 'ADMIN') {
          showDeleteConfirmationDialog(btn.id)
          window.location.reload();
        }
      }
      else {

        showNotDeleteConfirmationDialog()
      }
    } catch (error) {
      console.error('Error fetching current user or product:', error);
    }
  });
});


async function showConfirmationDialog() {
  return Swal.fire({
    position: 'top-end',
    icon: 'success',
    title: 'Producto agregado exitosamente',
    showConfirmButton: false,
    timer: 1500
  });
}

async function showNotConfirmationDialog() {
  return Swal.fire({
    position: 'top-end',
    icon: 'error',
    title: 'El producto no se pudo crear',
    showConfirmButton: false,
    timer: 1500
  });
}

async function showDeleteConfirmationDialog(param) {
  return Swal.fire({
    position: 'top-end',
    icon: 'success',
    title: `Deleting product with id ${param}`,
    showConfirmButton: false,
    timer: 1500
  });
}

async function showNotDeleteConfirmationDialog() {
  return Swal.fire({
    position: 'top-end',
    icon: 'error',
    title: 'No puedes borrar productos de otros',
    showConfirmButton: false,
    timer: 1500
  });
}