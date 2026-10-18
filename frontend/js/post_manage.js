async function loadMyPosts(){
    document.getElementById("board").innerHTML="";
    try{
        const response=await fetch("/api/my-posts",{
            method:"GET",
            credentials:"same-origin"
        });
        if(response.status===401){
            error(101,"");
            return;
        }
        const data=await response.json();
        if (!response.ok||!data.success){
            error(102,data.message);
            return;
        }
        const posts=data.posts||[];
        if(posts.length===0){
            return;
        }
        posts.forEach(post=>{
            document.getElementById("board").innerHTML+="<br><div class='post'><br><span class='title'>"+post.title+"</span><br><br><span class='tag'>"+post.tags+"</span><br><br><span class='content'>"+post.body+"</span><br><br><div class='del' onclick='javascript:del("+post.id+")'><span class='del_text'>刪除</span></div></div>";
        });
    }
    catch(err){
        error(103,err);
    }
}
async function del(id){
    try{
        const response=await fetch(`/api/posts/${encodeURIComponent(id)}`,{
            method:"DELETE",
            credentials:"same-origin"
        });
        const data=await response.json().catch(()=>({}));
        if(response.status===401){
            error(104,"");
            return;
        }
        if(!response.ok||!data.success){
            error(105,data.message);
            return;
        }
        await loadMyPosts();
    }
    catch(err){
        error(106,err);
    }
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
        document.getElementById("error_msg").innerText="尚未登入";
    }
    else if(err==102){
        if(msg==201){
            document.getElementById("error_msg").innerText="尚未登入";
        }
        else if(msg==202){
            document.getElementById("error_msg").innerText="載入貼文失敗";
        }
    }
    else if(err==103){
        document.getElementById("error_msg").innerText="伺服器連線失敗: "+msg;
    }
    else if(err==104){
        document.getElementById("error_msg").innerText="尚未登入";
    }
    else if(err==105){
        if(msg==201){
            document.getElementById("error_msg").innerText="尚未登入";
        }
        else if(msg==202){
            document.getElementById("error_msg").innerText="貼文ID不合法";
        }
        else if(msg==203){
            document.getElementById("error_msg").innerText="未找到貼文";
        }
        else if(msg==204){
            document.getElementById("error_msg").innerText="刪除貼文失敗";
        }
    }
    else if(err==106){
        document.getElementById("error_msg").innerText="伺服器連線失敗: "+msg;
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
loadMyPosts();