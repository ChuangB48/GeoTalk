async function loadCurrentUser(){
    try{
        const response=await fetch("/api/me");
        const data=await response.json();
        if(response.ok){
            document.getElementById("username_text").textContent=data.user.username;
            console.log("Current user:",data.user);
        }
        else{
            document.getElementById("username_text").textContent="尚未登入";
            console.log("User is not logged in.");
        }
    }
    catch(error){
        console.error("Failed to load current user:",error);
        document.getElementById("username_text").textContent="尚未登入";
    }
}
let map;
const posts=[
    {
        id:1,
        username:"Alice",
        title:"台北今天天氣很好",
        body:"第一次來台北，今天天氣真的很好！",
        lat:25.0330,
        lng:121.5654
    },{
        id:2,
        username:"Bob",
        title:"東京的晚上",
        body:"東京晚上真的很漂亮。",
        lat:35.6762,
        lng:139.6503
    },{
        id:3,
        username:"Charlie",
        title:"Hello New York",
        body:"Greetings from New York City!",
        lat:40.7128,
        lng:-74.0060
    }
];
let postOverlays=[];
async function initMap(){
    console.log("Starting Google Maps...");
    const {Map}=await google.maps.importLibrary("maps");
    console.log("Google Maps API detected.");
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
    console.log("Google Maps loaded.");
    console.log("Map width:",document.getElementById("map").offsetWidth);
    console.log("Map height:",document.getElementById("map").offsetHeight);
    class PostOverlay extends google.maps.OverlayView {
        constructor(post,map){
            super();
            this.post=post;
            this.map=map;
            this.div=null;
            this.setMap(map);
        }
        onAdd(){
            console.log("Adding post overlay:",this.post.username);
            this.div=document.createElement("div");
            this.div.className="post-card";
            this.div.innerHTML=`
                <div class="post-card-username">
                    ${escapeHTML(this.post.username)}
                </div>
                <div class="post-card-title">
                    ${escapeHTML(this.post.title)}
                </div>
                <div class="post-card-body">
                    ${escapeHTML(shortenText(this.post.body,45))}
                </div>
            `;
            const panes=this.getPanes();
            panes.floatPane.appendChild(this.div);
            console.log("Post card added to Google Maps:",this.post.username);
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
            console.log("Post position:",this.post.username,position.x,position.y);
        }
        onRemove(){
            console.log("Removing post overlay:",this.post.username);
            if(this.div&&this.div.parentNode){
                this.div.parentNode.removeChild(this.div);
            }
            this.div=null;
        }
    }
    posts.forEach(function(post){
        const overlay=new PostOverlay(post,map);
        postOverlays.push(overlay);
    });
    console.log("Total post overlays:",postOverlays.length);
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
function escapeHTML(text){
    const div=document.createElement("div");
    div.textContent=text;
    return div.innerHTML;
}
window.initMap=initMap;
loadCurrentUser();