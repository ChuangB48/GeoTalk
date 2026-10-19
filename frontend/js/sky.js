for(let a=0;a<300;a++){
    document.getElementById('sky').innerHTML+="<div id='d"+a.toString()+"' class='star' style='left: "+Math.floor(Math.random()*window.innerWidth).toString()+"px; top: "+Math.floor(Math.random()*window.innerHeight).toString()+"px;'></div>";
    document.getElementById('sky').innerHTML+="<div id='l"+a.toString()+"' class='line'></div>";
}
window.addEventListener('mousemove',mouse=>{
    for(let a=0;a<300;a++){
        let x=parseInt(document.getElementById("d"+a.toString()).style.left)-mouse.clientX;
        let y=parseInt(document.getElementById("d"+a.toString()).style.top)-mouse.clientY;
        if(x**2+y**2<150**2){
            document.getElementById("l"+a.toString()).style.width=Math.sqrt(x**2+y**2).toString()+"px";
            document.getElementById("l"+a.toString()).style.left=(mouse.clientX+2).toString()+"px";
            document.getElementById("l"+a.toString()).style.top=(mouse.clientY+2).toString()+"px";
            document.getElementById("l"+a.toString()).style.transform="rotate("+Math.atan2(y,x)*180/Math.PI+"deg)";
            document.getElementById("l"+a.toString()).style.opacity=(1-Math.sqrt(x**2+y**2)/150).toString();
        }
        else{
            document.getElementById("l"+a.toString()).style.opacity="0";
        }
        if(x**2+y**2<200**2){
            document.getElementById("d"+a.toString()).style.opacity=(1-Math.sqrt(x**2+y**2)/200).toString();
        }
        else{
            document.getElementById("d"+a.toString()).style.opacity="0";
        }
    }
    document.getElementById("light").style.left=mouse.clientX.toString()+"px";
    document.getElementById("light").style.top=mouse.clientY.toString()+"px";
});