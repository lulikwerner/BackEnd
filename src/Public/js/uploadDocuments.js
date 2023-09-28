document.addEventListener('DOMContentLoaded', () => {
    
    const uploadForm = document.getElementById('uploadForm');
    const uploadFiles = document.getElementById('uploadFiles');

    uploadForm.addEventListener('submit', async (event) => {
        console.log('click submit')
        event.preventDefault();

        const userId = uploadFiles.getAttribute('data-id');
        const formData = new FormData(uploadForm); 
console.log('aca')
        try {
            const response = await fetch(`/api/users/premium/${userId}/documents`, {
                method: 'POST',
                body: formData,
            }); 
            console.log('antes de respuesta')
            console.log(response)
            if(response.ok){
                Swal.fire({
                    icon: 'success',
                    title: 'Files Updated',
                    text: 'Los archivos se cargaron exitosamente',
                  });
                 /*setTimeout(() => {
                    window.location.href = `https://backend-commerce-dev.onrender.com/profile`;
                  }, 2000);*/
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