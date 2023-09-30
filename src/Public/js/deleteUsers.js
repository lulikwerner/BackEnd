window.addEventListener("DOMContentLoaded", () => {
  const deleteUserButton = document.getElementById("deleteUserButton");

  deleteUserButton.addEventListener("click", async (event) => {
    event.preventDefault();

    const confirmed = await showConfirmationDialog();

    if (confirmed) {
      const usersToDelete = [];
      const userContainer = document.getElementById("user");
      const userElements = userContainer.querySelectorAll("ul");

      userElements.forEach((userElement) => {
        const userEmail = userElement
          .querySelector("#uemail")
          .innerText.trim()
          .split("Email:")[1]
          .trim();

        usersToDelete.push({ email: userEmail });
        userElement.remove(); 
      });
      deleteUsers(usersToDelete);
    }
    
  });
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

async function deleteUsers(params) {
  const response = await fetch("/api/users/delete", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const data = await response.json();
  if (response.ok) {
    Swal.fire({
      position: "top-end",
      icon: "success",
      title: "Los usuarios fueron eliminados",
      showConfirmButton: false,
      timer: 1500,
    });
  }
}
