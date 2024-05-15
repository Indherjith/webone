let formlogin = document.getElementById("loginForm");
formlogin.addEventListener("submit",async(event)=>{
    event.preventDefault();
    document.getElementsByTagName("body")[0].style.opacity = 0.3;
    let formData = new FormData(formlogin);
    let formObject = {};
    formData.forEach((value, key) => {
        formObject[key] = value;
    });
    // console.log(formData);
    try{
        const response = await fetch(`/login`, 
        {method: "POST",mode: "cors",
        headers: {"Content-Type": "application/json"},body:JSON.stringify(formObject)})
        const res = await response.json();
        document.getElementsByTagName("body")[0].style.opacity = 1;
        alert(res.msg)
        let token = res.token;
        if(token){
            localStorage.setItem("token",JSON.stringify(token));
        }

    }
    catch(err){
        document.getElementsByTagName("body")[0].style.opacity = 1;
        alert("Something went wrong! Try Again.")
        console.log(err);
    }
    window.location.reload();
})



























