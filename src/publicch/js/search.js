const searchForm = document.getElementById('searchForm');
const searchUserButton = document.getElementById('searchUserButton');

searchUserButton.addEventListener('click', async (event) => {
    event.preventDefault();
    const data = new FormData(searchForm);
    const id = data.get('id');
    console.log(id);

    // Check if the ID is empty or not valid
    if (!id) {
        showInvalidDialog()
        return;
    }

    const response = await fetch(`/search/${id}`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (response.ok) {
        showConfirmationDialog(id);
        console.log(response);
    } else {
        showNotConfirmationDialog();
    }
});




async function showConfirmationDialog(id) {
    return Swal.fire({
        position: 'top-end',
            icon: 'success',
            title: 'Usuario encontrado',
            showConfirmButton: false,
            timer: 1500
        }).then(() => {
            setTimeout(() => {
               window.location.replace(`/search/${id}`);
            }, 500); 
        });
    }

async function showNotConfirmationDialog() {
        return Swal.fire({
                position: 'top-end',
                icon: 'error',
                title: 'No se encontro el usuario.',
                text: ' Intente buscar otro Usuario',
                showConfirmButton: false,
                timer: 1500
            });
        }

async function showInvalidDialog() {
            return Swal.fire({
                    position: 'top-end',
                    icon: 'error',
                    title: 'Usuario Invalido',
                    text: ' Ingrese un usuario valido',
                    showConfirmButton: false,
                    timer: 1500
                });
            }      
    
    
    
    
