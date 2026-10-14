const titleInput=document.getElementById("title_input");
const bodyInput=document.getElementById("content_input");
const tagInput=document.getElementById("tag_input");
const enterButton=document.getElementById("enter");
enterButton.addEventListener("click",()=>{
    document.getElementById("error_board").style.opacity="0";
    if(!titleInput.value.trim()||!bodyInput.value.trim()){
        err(0);
        return;
    }
    if(enterButton.disabled){
        return;
    }
    enterButton.disabled=true;
    async function createPostData(lat,lng,type){
        const post={
            "title":titleInput.value.trim(),
            "body":bodyInput.value,
            "lat":lat,
            "lng":lng,
            "tag":tagInput.value,
            "type":type
        };
        if(type==="current"){
            post.lat=lat;
            post.lng=lng;
        }
        try{
            const response = await fetch("/api/posts",{
                method:"POST",
                headers:{
                    "Content-Type": "application/json"
                },
                credentials:"same-origin",
                body:JSON.stringify(post)
            });
            const result=await response.json().catch(()=>({}));
            if(!response.ok){
                err(result.error||"Publish failed. HTTP "+response.status);
                return;
            }
            window.location.href="lobby.html";
        }
        catch(error){
            err(1);
        }
        finally{
            enterButton.disabled=false;
        }
    }
    if(!navigator.geolocation){
        err(2);
        spare()
        return;
    }
    navigator.geolocation.getCurrentPosition(
        async (pos)=>{
            createPostData(pos.coords.latitude,pos.coords.longitude,"current");
        },
        async (_error)=>{
            err(2);
            await spare();
        },
        {
            enableHighAccuracy:true,
            timeout:15000,
            maximumAge:0
        }
    );
});
async function spare(){
    await createPostData(null,null,"primary_area");
}
function err(msg){
    document.getElementById("error_board").style.opacity="1";
    if(msg==0){
        document.getElementById("error_msg").innerText="Title or body can't be empty.";
    }
    else if(msg==1){
        document.getElementById("error_msg").innerText="Failed to connect to the server.";
    }
    else if(msg==2){
        document.getElementById("error_msg").innerText="Location error.";
    }
    else{
        document.getElementById("error_msg").innerText=msg;
    }
}