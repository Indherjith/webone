var base64Img;

if(document.getElementById("registerForm")){
    let form = document.getElementById("registerForm");
    form.addEventListener("submit",async(event)=>{
        event.preventDefault();
        document.getElementsByTagName("body")[0].style.opacity = 0.3;
        let formData = new FormData(form);
        let formObject = {};
        formData.forEach((value, key) => {
            formObject[key] = value;
        });
        formObject.profile_picture =  base64Img;
        formObject.account_type = "admin";
        // console.log(formObject);
        try{
            const response = await fetch(`/registration`, 
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

    const fileInput = document.getElementById("profile-picture");
    fileInput.addEventListener("change", e=>{
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.addEventListener("load", ()=>{
            const base64 = reader.result;
            base64Img = base64;
        })
        reader.readAsDataURL(file);
    });
}

