document.querySelector('#signupForm').addEventListener('submit',(e)=>{
    e.preventDefault();
    clearErrorMessages();
    const username = document.querySelector('#username').value.trim();
    const password = document.querySelector('#password').value.trim();
    const confirmPassword = document.querySelector('#confirm_password').value.trim();
    var error = false;
    
    if(password != confirmPassword){
        logErrorMessage("Passwords must match");
        document.querySelector('#password').classList.add('is-invalid');
        document.querySelector('#confirm_password').classList.add('is-invalid');
        error = true;
    }
    if(!username.match(/^[a-zA-Z0-9_]*$/) || username.length < 3 || username.length > 30){
        logErrorMessage("Invalid username")
        document.querySelector('#username').classList.add('is-invalid');
        error = true;
    }
    if(password.length < 6){
        logErrorMessage("Invalid Password");
        document.querySelector('#password').classList.add('is-invalid');
        error = true;
    }
    if(!error){
        //valid user account
        var user = {
            username: username,
            password: password
        };
        fetch(API_URL+'auth/signup',{
            method: 'POST',
            body: JSON.stringify(user),
            headers: {
                'content-type':'application/json'
            }
        }).then((response) => {
            if(response.ok){return response.json();}
                throw response;
        }).then((result)=>{
            localStorage.token = result.token;
            window.location.replace("../pages/dashboard.html");
        }).catch((error)=>{
            error.text().then(msg =>{
                logErrorMessage(JSON.parse(msg).message);
                console.error(JSON.parse(msg).message);
            });
        });
    }
});

function logErrorMessage(msg){
    var div = document.createElement('div');
    div.innerHTML = `<div class="alert alert-danger">`+msg+`</div>`;
    document.querySelector('#error').appendChild(div);
}
function clearErrorMessages(){
    document.querySelector('#error').innerHTML="";
    document.querySelector('#username').classList.remove('is-invalid');
    document.querySelector('#password').classList.remove('is-invalid');
    document.querySelector('#confirm_password').classList.remove('is-invalid');
}