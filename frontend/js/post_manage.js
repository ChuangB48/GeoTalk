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
            error(102,"");
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
            error(101,"");
            return;
        }
        if(!response.ok||!data.success){
            // 刪除失敗
        }
        await loadMyPosts();
    }
    catch(err){
        error(103,err);
    }
}
function error(err,msg){
    document.getElementById("error_board").style.zIndex="1";
    document.getElementById("error_board").style.opacity="1";
    if(err==101){
        document.getElementById("error_msg").innerText="尚未登入";
    }
    else if(err==102){
        document.getElementById("error_msg").innerText="載入貼文失敗";
    }
    else if(err==103){
        document.getElementById("error_msg").innerText=msg;
    }
    window.setTimeout(()=>{
        document.getElementById("error_board").style.opacity="0";
        document.getElementById("error_board").style.zIndex="-1";
    },1000);
}
loadMyPosts();