const titleInput=document.getElementById("title_input");
const bodyInput=document.getElementById("content_input");
const tagInput=document.getElementById("tag_input");
const enterButton=document.getElementById("enter");
enterButton.addEventListener("click",()=>{
    document.getElementById("error_board").style.opacity="0";
    if(!titleInput.value.trim()||!bodyInput.value.trim()){
        error(101,"");
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
                error(102,result.message);
                return;
            }
            window.location.href="lobby.html";
        }
        catch(err){
            error(103,err);
        }
        finally{
            enterButton.disabled=false;
        }
    }
    if(!navigator.geolocation){
        error(104,"");
        spare()
        return;
    }
    navigator.geolocation.getCurrentPosition(
        async (pos)=>{
            createPostData(pos.coords.latitude,pos.coords.longitude,"current");
        },
        async (err)=>{
            error(105,err);
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
function error(err,msg){
    document.getElementById("error_board").style.zIndex="1";
    document.getElementById("error_board").style.opacity="0";
    let a=0;
    let time=window.setInterval(()=>{
        document.getElementById("error_board").style.opacity=a.toString();
        a+=0.1
        if(a>=0.9){
            window.clearInterval(time);
        }
    },20)
    if(err==101){
        document.getElementById("error_msg").innerText="標題與內文不可空白";
    }
    else if(err==102){
        if(msg==201){
            document.getElementById("error_msg").innerText="尚未登入";
        }
        else if(msg==202){
            document.getElementById("error_msg").innerText="標題字數需在0~80字以內,或標題型態不合格";
        }
        else if(msg==203){
            document.getElementById("error_msg").innerText="內文字數需在0~2000字以內,或內文型態不合格";
        }
        else if(msg==204){
            document.getElementById("error_msg").innerText="未找到使用者座標";
        }
        else if(msg==205){
            document.getElementById("error_msg").innerText="定位座標錯誤";
        }
        else if(msg==206){
            document.getElementById("error_msg").innerText="未找到使用者";
        }
        else if(msg==207){
            document.getElementById("error_msg").innerText="主要活動區域定位錯誤";
        }
        else if(msg==208){
            document.getElementById("error_msg").innerText="主要活動區域未找到座標";
        }
        else if(msg==209){
            document.getElementById("error_msg").innerText="座標錯誤";
        }
        else if(msg==210){
            document.getElementById("error_msg").innerText="發文失敗";
        }
    }
    else if(err==103){
        document.getElementById("error_msg").innerText="伺服器連線失敗: "+msg;
    }
    else if(err==104){
        document.getElementById("error_msg").innerText="定位錯誤";
    }
    else if(err==105){
        document.getElementById("error_msg").innerText="定位錯誤: "+msg;
    }
    window.setTimeout(()=>{
        if(document.getElementById("error_board").style.opacity>"0"){
            document.getElementById("error_board").style.opacity="0.9";
            a=0.9;
            let time=window.setInterval(()=>{
                document.getElementById("error_board").style.opacity=a.toString();
                a-=0.1
                if(a<=0){
                    document.getElementById("error_board").style.zIndex="-1";
                    document.getElementById("error_board").style.opacity="0";
                    window.clearInterval(time);
                }
            },20)
        }
    },5000);
}