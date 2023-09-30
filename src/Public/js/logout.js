const logOutButton = document.getElementById('logOutButton');

logOutButton.addEventListener('click', async () => {
  Swal.fire({
    title: 'Desea cerrar su sesion?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#73be73',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Si',
    cancelButtonText: 'No'
  }).then(response => {
    if (response.isConfirmed) {
      fetch('/api/sessions/logout', {
        method: 'POST',

      })
        .then(response => {
          if (response.ok) {
            window.location.replace('/login');
          } else {
            response.text().then(errorMsg => {
              console.error('Error:', errorMsg);
              Swal.fire({
                title: 'No ha podido deslogearse',
                icon: 'error'
              });
            });
          }
        })
        .catch(error => {
          console.error('Error al deslogearse:', error);
          Swal.fire({
            title: 'Vuelva a intentarlo',
            icon: 'error'
          });
        });
    }
  });
});
