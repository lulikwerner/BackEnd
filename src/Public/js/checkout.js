
let checkoutData;
const checkoutButton = document.getElementById('checkoutButton');

document.addEventListener('DOMContentLoaded', () => {
  // Get the checkout button element
  //const checkoutButton = document.getElementById('checkoutButton');
  if (checkoutButton) {
    checkoutButton.addEventListener('click', async () => {
      const cid = checkoutButton.dataset.cid;

      const response = await fetch(`/api/carts/${cid}/purchase`, {
        method: 'POST',
        body: JSON.stringify(),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json', //Es para decirle que estoy esperando un json 
        },
      });

      if (response.ok) {
        checkoutData = await response.json(); 
        window.location.href = `/api/carts/${cid}/purchase`;
      } else {
        console.error('Error:', response.status, response.statusText);
      }
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const deleteButtons = document.querySelectorAll('.deleteButtonStyle');
  //Para cada boton delete
  deleteButtons.forEach(deleteButton => {
    deleteButton.addEventListener('click', async () => {

      const cid = checkoutButton.dataset.cid;
      const pid = deleteButton.getAttribute('data-pid');

      const deleteResponse = await fetch(`/api/carts/${cid}/product/${pid}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      if (deleteResponse.ok) {
        window.location.reload();
      } else {
        console.error('Failed to delete product from the cart.');
      }
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  let quantity = 0;
  const addButtons = document.querySelectorAll('.addButtonStyle');

  addButtons.forEach(addButton => {
    addButton.addEventListener('click', async () => {

      quantity = quantity + 1;
      const cid = checkoutButton.dataset.cid;
      const pid = addButton.getAttribute('data-pid');

      const addQuantity = await fetch(`/api/carts/${cid}/product/${pid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ quantity })
      });
      if (addQuantity.ok) {
        window.location.reload();
      } else {
        console.error('Failed to update product in the cart.');
      }
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const substractButtons = document.querySelectorAll('.substractButtonStyle');

  substractButtons.forEach(substractButton => {
    substractButton.addEventListener('click', async () => {

      const cid = checkoutButton.dataset.cid;
      const pid = substractButton.getAttribute('data-pid');
      const quantity = -1;
      console.log(typeof (quantity))

      const substractQuantity = await fetch(`/api/carts/${cid}/product/${pid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ quantity })
      });

      if (substractQuantity.ok) {
        window.location.reload();
      } else {
        console.error('Failed to update product in the cart.');
      }
    });
  });
});



