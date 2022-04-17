$(document).ready(function() {
    const userName = document.querySelector(".user-name");
    const email = document.querySelector(".email");
    const phoneNumber = document.querySelector(".phone-number");
    const password = document.querySelector(".password");
    const repeatPassword = document.querySelector(".repeat-password");
    let userNameClicked;
    let emailClicked;
    let phoneClicked;
    let passwordClicked;
    let repeatPasswordClicked;
    let isPassed = true;
    document.addEventListener('click', function(e) {
        isPassed = true;
        var clickedInsideUser = userName.contains(e.target);
        var clickedInsideEmail = email.contains(e.target);
        var clickedInsidePhoneNumber = phoneNumber.contains(e.target);
        var clickedInsidePassword = password.contains(e.target);
        var clickedInsideRepeatPassword = repeatPassword.contains(e.target);
        if(clickedInsideUser){
            userNameClicked = true;
        }
        if(clickedInsideEmail) {
            emailClicked = true;
        }
        if(clickedInsidePhoneNumber){
            phoneClicked = true;
        }
        if(clickedInsidePassword){
            passwordClicked = true;
        }
        if(clickedInsideRepeatPassword){
            repeatPasswordClicked = true;
        }

        // Validate userName
        const userNameRegex = /^.{5,20}$/;
        if(!clickedInsideUser && userNameClicked) {
            if(!userNameRegex.test(userName.value)){
                $('#userName').html('* User name must be 5 to 20 character long.');
                isPassed = false;
            }
            else {
                $('#userName').empty();
            }
        }
        // Validate email
        const emailRegex = /\S+@\S+\.\S+/;
        if(!clickedInsideEmail && emailClicked) {
            if(!emailRegex.test(email.value)){
                $('#emailHelp').html('* This is not correct type of email');
                isPassed = false;
            }
            else {
                const email = $(".email").val();
                $.ajax({
                    type: "post",
                    url: "/auth/check",
                    dataType: "json",
                    data: {
                        email
                    },
                    success: function(data) {
                        if (data.error) {
                            $("#emailHelp").html(data.error);
                            isPassed = false;
                        }
                        else {
                            $("#emailHelp").empty();
                        }
                    }
                })
            }
        }
        // Validate phoneNumber
        const phoneNumberRegex = /^\d{8,11}$/;
        if(!clickedInsidePhoneNumber && phoneClicked) {
            if(!phoneNumberRegex.test(phoneNumber.value)){
                $('#phoneHelp').html('* Invalid phone number');
                isPassed = false;
            }
            else {
                $('#phoneHelp').empty();
                
            }
        }

         // Validate password
         const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
         if(!clickedInsidePassword && passwordClicked) {
             if(!passwordRegex.test(password.value)){
                 $('#passwordHelp').html('* Password cannot be blank and must contain 1 upper letter, 1 normal letter, 1 number');
                 isPassed = false;
             }
             else {
                 $('#passwordHelp').empty();
             }
         }

         // Validate repeat password
         if(!clickedInsideRepeatPassword && repeatPasswordClicked) {
             if( repeatPassword.value !== password.value){
                 $('#repeatPasswordHelp').html('* Both password and repeat password must be the same');
                 isPassed = false;
             }
             else {
                 $('#repeatPasswordHelp').empty();
             }
         }


    })

    $('#register-form').submit(function(e) {
        if(!isPassed) {
            e.preventDefault();
        }

    })



})



  