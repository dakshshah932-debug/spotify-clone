console.log("js is running");
let currentsong = new Audio()
let songs;
let currFolder;
function secondsToMinutesSeconds(totalSeconds) {
    const totalSecondsInt = Math.floor(totalSeconds);
    const minutes = Math.floor(totalSecondsInt / 60); const secondsRemaining = totalSecondsInt % 60;
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(secondsRemaining).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder) {
    currFolder = folder

    let a = await fetch(`/${folder}/`)

    let response = await a.text();

    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")

    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }

    }

    //show all songs in the playlist
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
                  <img src="images/music.svg" alt="" style="filter: invert();">
                          <div class="songinfo">
                              <div class="name"> ${song.replaceAll("%20", " ")} </div>
                              
                          </div>
                          <div class="playnow">
                              <div>Play</div>
                          <button class="playbtn"><img src="images/play.svg" alt=""></button>
                          </div>
          </li>`;
    }
    
    //attach eventlistner to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {

            playmusic(e.querySelector(".songinfo").firstElementChild.innerHTML.trim())
        })
    })
    return songs
    return folder
}

const playmusic = (track, pause = false) => {
    currentsong.src = `/${currFolder}/` + track
    if (!pause) {
        currentsong.play()
        play.src = "images/pause.svg"

    }

    document.querySelector(".sname").innerHTML = decodeURI(track)
    document.querySelector(".stime").innerHTML = "00:00/00:00"
    

}
async function displayAlbums() {
    try {
        let a = await fetch(`/songs/`);
        let response = await a.text();
        let div = document.createElement("div");
        div.innerHTML = response;
        let anchors = div.getElementsByTagName("a");
        let array = Array.from(anchors);

        for (let index = 0; index < array.length; index++) {
            const e = array[index];
            
            console.log(`Anchor href: ${e.href}`); // Log each href to see its structure
            
            if (e.href.includes("songs/") && !e.href.includes(".htaccess")) {
                let parts = e.href.split("/");
                let folder = parts[parts.length - 1] || parts[parts.length - 2]; // Last part or second last if empty
                
                if (folder) {
                    console.log(`Fetching data for folder: ${folder}`);
                    
                    let cardcontainer = document.querySelector(".contr");
                    
                    try {
                        let infoResponse = await fetch(`/songs/${folder}/info.json`);
                        if (!infoResponse.ok) throw new Error(`Could not fetch info.json for folder: ${folder}`);
                        
                        let albumInfo = await infoResponse.json();
                        
                        cardcontainer.innerHTML += `
                            <div data-folder="${folder}" class="card">
                                <div class="play">
                                    <button class="round-button" aria-label="Play">
                                        <img src="images/play.svg" alt="" style="filter: invert();">
                                    </button>
                                </div>
                                <img src="songs/${folder}/cover.jpg">
                                <p class="songname">${albumInfo.title}</p>
                                <p class="singer">${albumInfo.description}</p>
                            </div>`;
                    } catch (error) {
                        console.error(`Error fetching info.json for folder '${folder}':`, error);
                    }
                } else {
                    console.warn(`Skipping folder with empty name`);
                }
            }
        }
    } catch (error) {
        console.error("Error fetching album list:", error);
    }
}


async function main() {
    await getsongs("songs/likedsongs")
    playmusic(songs[0], true)
    

    //display all albums on page
    await displayAlbums()

    play.addEventListener("click", e => {
        if (currentsong.paused) {
            currentsong.play()


            play.src = "images/pause.svg"
        }
        else {

            currentsong.pause()
            play.src = "images/play.svg"
        }
    })
    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".stime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)}/${secondsToMinutesSeconds(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration * 100) + "%"
        // document.querySelector(".greenbox").style.width=(currentsong.currentTime/currentsong.duration*100) + "%"
        if(currentsong.currentTime==currentsong.duration){
            console.log("ohhok")
            let index = songs.indexOf(currentsong.src.split("/").slice("-1")[0])
            playmusic(songs[index+1])
        }
    })
    document.querySelector(".thinbox").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currentsong.currentTime = currentsong.duration * percent / 100
    })
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%"
    })



   
  
  
     //get the metadata from the folder
     Array.from(document.getElementsByClassName("card")).forEach(e => {

        e.addEventListener("click", async item => {
           
            console.log("fetching songs")
            console.log(item.currentTarget)
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
             playmusic(songs[0])
           
        })
    })
    //to mute the song
    document.querySelector(".volume img").addEventListener("click",(e)=>{
        
        console.log(e.target.src)
        if(e.target.src.includes("volume.svg")){
            e.target.src=e.target.src.replace("volume.svg","mute.svg")
            currentsong.volume=0 
            document.querySelector(".range").getElementsByTagName("input")[0].value=0       
        }
        else{
            e.target.src=e.target.src.replace("mute.svg","volume.svg")
            currentsong.volume=0.5
            document.querySelector(".range").getElementsByTagName("input")[0].value=50
        }
    }) 
    //autoplay next songs
    
    next.addEventListener("click", () => {
        console.log("next clicked")
        console.log(songs)
        
        let index = songs.indexOf(currentsong.src.split("/").slice("-1")[0])
        console.log(index)
    
        if ((index + 1) < songs.length) {
    
            playmusic(songs[index + 1])
        }
    })
    //to play the previous song 
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice("-1")[0])
    
        if ((index) > 0) {
            console.log("previous clicked")
            playmusic(songs[index - 1])
        }
    }) 
    //add an event to change the volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
      currentsong.volume=parseInt(e.target.value)/100
    })         


}
main()