document.addEventListener('DOMContentLoaded', () => {
    
    const uploadForm = document.getElementById('uploadForm');
    const uploadFiles = document.getElementById('uploadFiles');

    uploadForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const userId = uploadFiles.getAttribute('data-id');
        const formData = new FormData(uploadForm); 

        try {
            const response = await fetch(`/api/users/premium/${userId}/documents`, {
                method: 'POST',
                body: formData,
            }); 
            if(response.ok){
                Swal.fire({
                    icon: 'success',
                    title: 'Files Updated',
                    text: 'Los archivos se cargaron exitosamente',
                  });
                  setTimeout(() => {
                    window.location.href = `http://localhost:8080/profile`;
                  }, 2000);
            }
            else{
                Swal.fire({
                    title: 'Error',
                    text: 'Hubo un error al cargar los archivos. Por favor, vuelva a intentarlo.',
                    icon: 'error',
                  });
            }
        }catch (error) {
            console.error('Error:', error);
        }
    })

})