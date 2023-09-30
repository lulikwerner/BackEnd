document.addEventListener('DOMContentLoaded', () => {
    const roleForm = document.getElementById('roleForm');
    const modifyRole = document.getElementById('modifyRole');
    const roleElement = document.getElementById("roleValue");
    const roleText = roleElement.textContent;

    // Log the extracted text
 

    roleForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(roleForm);
        const role = formData.get('role');
    
        const userId = modifyRole.getAttribute('data-id');

        //Le envio el nuevo role del usuario
        try {
    
            const response = await fetch(`/api/users/premium/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ role })
            });
            console.log('soy',response)
            if (!response.ok) {
              
                const responseData = await response.json();
                
                if (responseData.notUploadFiles) {
                    const missingFiles = responseData.notUploadFiles.map(file => file.name).join(', ');
                    Swal.fire({
                        position: 'top-end',
                        icon: 'error',
                        title: 'No puedes modificar el rol aun',
                        text: `Faltan cargar documentos a tu perfil: ${missingFiles}`,
                        showConfirmButton: false,
                        timer: 3000
                    });
                    
                    setTimeout(() => {
                        window.location.href = ` https://backend-commerce-dev.onrender.com/premium/${userId}/documents`;
                    }, 3000);
                } else {
                    // Handle other error cases here
                    console.error('Server error:', responseData);
                    Swal.fire({
                        position: 'top-end',
                        icon: 'error',
                        title: 'No se puedo modificar el rol',
                        text: `Faltan cargar documentos a tu perfil`,
                        showConfirmButton: false,
                        timer: 3000
                    });
                    setTimeout(() => {
                       window.location.href = ` https://backend-commerce-dev.onrender.com/premium/${userId}/documents`;
                      }, 3000);
                }
            } else if(roleText!==role){
                // Handle the case when the response is OK
                Swal.fire({
                    position: 'top-end',
                    icon: 'success',
                    title: `Tienes un nuevo rol asignado`,
                    showConfirmButton: false,
                    timer: 1500
                });
                
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
            
        } catch (error) {
            console.error('Error:', error);
        }
    });
});


