window.addEventListener("DOMContentLoaded", () => {
  const deleteUserBtn = document.getElementById("deleteUserBtn");
})

deleteUserBtn.addEventListener('click', async (event) => {
  event.preventDefault();

  const userIdElement = document.querySelector('.UserId');
  const userId = userIdElement.getAttribute('data-id');
  const confirmed = await showConfirmationDialog();

  if (confirmed) {
    try {
      const response = await fetch(`/api/users/search/${userId}/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // Handle non-successful responses here
        throw new Error(`HTTP Error: ${response.status}`);
      }

      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "El usuario fue eliminado",
        showConfirmButton: false,
        timer: 1500,
      });
      setTimeout(() => {
        window.location.replace(`/search`);
      }, 1000);
    } catch (error) {
      console.error(error);
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        title: 'No se pudo completar la transaccion',
        text: 'El usuario no se pudo encontrar para eliminar',
        showConfirmButton: false,
        timer: 1500
      });
    }
  }
});


async function showConfirmationDialog() {
  return Swal.fire({
    title: "Eliminarlos",
    text: "Estás seguro que deseas eliminarlos?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Ok",
  }).then((result) => {
    return result.isConfirmed;
  });
}