$(document).ready(function() {
    const email = document.querySelector(".email");
    const password = document.querySelector(".password");
    let isPassed = true;
    $('#login-form').submit(function(e) {
        isPassed = true;
        const emailRegex = /\S+@\S+\.\S+/;
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        if(!emailRegex.test(email.value)){
            $('#emailHelp').html('* This is not correct type of email');
            isPassed = false;

        }
        if(!passwordRegex.test(password.value)){
            $('#passwordHelp').html('* Password cannot be blank and must contain 1 upper letter, 1 normal letter, 1 number');
            isPassed = false
        }
        if(!isPassed) {
            e.preventDefault();
        }

    })



})



  