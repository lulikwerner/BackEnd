const form = document.getElementById('loginForm')

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const obj = {};
    data.forEach((value, key) => (obj[key] = value));

console.log(obj)
    const response = await fetch("/api/sessions/login", {
        method: 'POST',
        body: JSON.stringify(obj),
        headers: {
            "Content-Type": "application/json"
        }
    });
console.log(response)
    const responseText = await response.text();
    const responseData = JSON.parse(responseText);

    if (responseData.status !== "success") {
        Swal.fire({
            position: 'top-end',
            icon: 'error',
            title: 'Usuario o contrasenia invalidos',
            showConfirmButton: false,
            timer: 1500
        });
    } else {
        const role = responseData.payload.user.role;

        Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Login Exitoso',
            showConfirmButton: false,
            timer: 1500
        }).then(() => {
            if (role === 'USER' || role === 'user' || role === 'PREMIUM') {
             window.location.replace('/products');
            } else if (role === 'ADMIN') {
                window.location.replace('/realTimeProducts');
            }
        });
    }
});
