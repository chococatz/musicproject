function toggleMobile(){
    const mobile_nav = document.querySelector(".mobile_nav_items");
    mobile_nav.classList.toggle("active");
}

var close = document.getElementsByClassName("closebtn");
var i;
    for (i = 0; i < close.length; i++){
      close[i].onclick = function(){
        var div = this.parentElement;
        div.style.opacity = "0";
        setTimeout(function(){ div.style.display = "none"; }, 600);
      }
    }

setTimeout(function(){
    var errorbar = document.getElementById("error-bar");
    errorbar.style.opacity = "0";
    errorbar.style.display = "none"
}, 3000);

setTimeout(function(){
    var successbar = document.getElementById("success-bar");
    successbar.style.opacity = "0";
    successbar.style.display = "none"
}, 3000);

function confirmation(){
    var confirmbox = document.getElementById("confirm_frame");
    confirmbox.style.display = "block";
    window.addEventListener("click", function(event){
        if(!event.target.matches("#confirm_question")
        && !event.target.matches(".edit_delete")
        && !event.target.matches("#confirm_icon")
        && !event.target.matches("#confirm_text")
        && !event.target.matches("#confirm_text2")
        && !event.target.matches("#no_btn")
        && !event.target.matches("#yes_btn")){
            document.getElementById("confirm_frame").style.display = "none";
        }
    })
}

function cancel(){
    var confirmbox = document.getElementById("confirm_frame");
    confirmbox.style.display = "none";
}

function confirm(){
    document.getElementById("confirm_verify").click();
}

const inpFile = document.getElementById("inpFile");
const previewContainer = document.getElementById("imagePreview");
const previewImage = previewContainer.querySelector(".image-preview__image");
const margin = document.getElementById("input_img");
const currentImage = document.getElementById("cur_img");

inpFile.addEventListener("change", function(){
    const file = this.files[0];
    if(file){
        const reader = new FileReader();
        previewImage.style.display = "block";
        previewContainer.style.display = "block";
        margin.style.marginBottom = "15px";
        currentImage.style.display = "none"
        reader.addEventListener("load", function(){
            console.log(this);
            previewImage.setAttribute("src", this.result);
        });
        reader.readAsDataURL(file);
    }else{
        previewImage.style.display = "none";
        previewContainer.style.display = "none";
        margin.style.marginBottom = "15px";
        currentImage.style.display = "block";
    }
});