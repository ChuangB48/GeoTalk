let map;
let postOverlays=[];
async function initMap(){
    const {Map}=await google.maps.importLibrary("maps");
    const worldCenter={
        lat:20,
        lng:0
    };
    map=new Map(
        document.getElementById("map"),{
            center:worldCenter,
            zoom:2,
            minZoom:2,
            mapTypeControl:false,
            streetViewControl:false,
            fullscreenControl:false
        }
    );
    class PostOverlay extends google.maps.OverlayView {
        constructor(post,map){
            super();
            this.post=post;
            this.map=map;
            this.div=null;
            this.setMap(map);
        }
        onAdd(){
            this.div=document.createElement("div");
            this.div.className="post-card";
            this.div.style.cursor="pointer";
            this.div.style.pointerEvents="auto";
            this.div.tabIndex=0;
            this.div.setAttribute("role","button");
            this.div.setAttribute(
                "aria-label",
                "查看完整貼文：" + (this.post.title||"")
            );
            this.div.innerHTML=`
                <div class="post-card-title">
                    ${escapeHTML(this.post.title||"")}
                </div>
                <div class="post-card-username">
                    ${escapeHTML(this.post.username||"未知使用者")}
                </div>
                <div class="post-card-category">
                    ${escapeHTML(this.post.category??this.post.tag??this.post.tags??"未分類")}
                </div>
            `;
            this.div.addEventListener("click",(event)=>{
                event.stopPropagation();
                showPostDetail(this.post);
            });
            this.div.addEventListener("keydown",(event)=>{
                if(event.key==="Enter"||event.key===" "){
                    event.preventDefault();
                    event.stopPropagation();
                    showPostDetail(this.post);
                }
            });
            const panes=this.getPanes();
            panes.overlayMouseTarget.appendChild(this.div);
        }
        draw(){
            if(!this.div){
                return;
            }
            const projection=this.getProjection();
            if(!projection){
                return;
            }
            const position=projection.fromLatLngToDivPixel(
                new google.maps.LatLng(
                    this.post.lat,
                    this.post.lng
                )
            );
            this.div.style.left=position.x + "px";
            this.div.style.top=position.y+"px";
            this.div.style.display="block";
        }
        onRemove(){
            if(this.div&&this.div.parentNode){
                this.div.parentNode.removeChild(this.div);
            }
            this.div=null;
        }
    }
    try{
        const response=await fetch("/api/posts",{
            credentials:"same-origin"
        });
        if(!response.ok){
            throw new Error(
                `Failed to fetch posts: HTTP ${response.status}`
            );
        }
        const data=await response.json();
        const posts=data.posts;
        if(!Array.isArray(posts)){
            throw new Error(
                "API response does not contain a posts array."
            );
        }
        posts.forEach(post=>{
            const latitude=Number(post.lat);
            const longitude=Number(post.lng);
            if(!Number.isFinite(latitude)||!Number.isFinite(longitude)||latitude<-90||latitude>90||longitude<-180||longitude>180){
                console.warn("Skipped post with invalid coordinates:",post.id);
                return;
            }
            const mapPost={
                ...post,
                lat:latitude,
                lng:longitude
            };
            const overlay=new PostOverlay(
                mapPost,
                map
            );
            postOverlays.push(overlay);
        });
    }
    catch(error){
        console.error("Failed to load map posts:",error);
    }
}
function shortenText(text,maxLength){
    if(text.length<=maxLength){
        return text;
    }
    return(
        text.substring(
            0,
            maxLength
        ) + "..."
    );
}
function showPostDetail(post){
    document.getElementById("title").innerText=post.title||"";
    document.getElementById("tag").innerText=post.category??post.tags??"未分類";
    document.getElementById("user").innerText=post.username||"未知使用者";
    document.getElementById("content").innerText=post.body||"";
    document.getElementById("article").style.zIndex="1";
    document.getElementById("back").focus();
}
function closePostDetail(){
    document.getElementById("article").style.zIndex="-1";
}
document.getElementById("back").addEventListener("click",closePostDetail);
document.getElementById("map").addEventListener("click",closePostDetail);
document.addEventListener("keydown",(event)=>{
    if(event.key=="Escape"&&document.getElementById("article").style.zIndex!="-1"){
        closePostDetail();
    }
});
function escapeHTML(text){
    const div=document.createElement("div");
    div.textContent=text;
    return div.innerHTML;
}
document.getElementById("post").addEventListener("click",()=>{
    location.href="post.html";
});
window.initMap=initMap;
loadCurrentUser();