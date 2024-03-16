let songs = [];
let currentAudio = new Audio();
let curFolder = '';
let playBtn = document.querySelector('#play-btn');
console.log(playBtn);
let songUL;

const secToMin = function (seconds) {
    // Check if input is a number and not negative
    if (typeof seconds !== 'number' || seconds < 0 || typeof seconds !== 'number') {
        return "Invalid input";
    }

    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = Math.floor(seconds % 60);

    // Convert to strings and pad with leading zeros
    var minutesStr = String(minutes).padStart(2, '0');
    var secondsStr = String(remainingSeconds).padStart(2, '0');

    return minutesStr + ":" + secondsStr;
}

const getSongs = async function (folder) {
    curFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text();

    let div = document.createElement('div');
    div.innerHTML = response;
    let songs = [];

    let as = div.getElementsByTagName('a');
    for (let i = 0; i < as.length; i++) {
        const ele = as[i];
        if (ele.href.endsWith('.mp3')) {
            songs.push(ele.href);
        }
    }

    songUL = document.querySelector('.song-list').getElementsByTagName('ul')[0];
    songUL.innerHTML = '';

    for (const song of songs) {
        // console.log(song.split('/').slice(-1).join('').split('%20').slice(0, 2).join(' '));
        const songName = `${song.split('/').slice(-1).join('').split('%20').slice(0, 2).join(' ')}`;
        const songArtist = '';

        songUL.innerHTML = songUL.innerHTML + `              
            <li class="song-item">
                <img src="./SVGFILE/music.svg" class="invert" alt="music" />
                    <div class="info">
                        <div>${songName}</div>
                        <div>${songArtist}</div>
                    </div>
                <img src="./SVGFILE/play.svg" class="invert play-svg" alt="play">
            </li>`;
    }

    Array.from(document.querySelector('.song-list').getElementsByTagName('li')).forEach(e => {
        e.addEventListener('click', function () {
            // console.log(`${e.querySelector('.info').firstElementChild.innerHTML}`)
            playMusic(e.querySelector('.info').firstElementChild.innerHTML);
        })
    });
    return songs;
}

const dispalyAlbum = async function () {
    let a = await fetch(`http://127.0.0.1:5500/Songs/`);
    let response = await a.text();

    let div = document.createElement('div');
    div.innerHTML = response;
    let anchors = div.getElementsByTagName('a');
    cardContainer = document.querySelector('.card-container');
    let array = Array.from(anchors);

    for (let index = 0; index < array.length; index++) {
        let a = array[index];
        if (a.href.includes('/Songs/')) {
            let folder = (a.href.split('/').slice(-1)[0]);
            // get metadata
            let res = await fetch(`http://127.0.0.1:5500/Songs/${folder}/info.json`);
            res = await res.json();

            cardContainer.innerHTML = cardContainer.innerHTML + `
            <div data-folder="${folder}" class="card">
                <div class="play-green">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="#000"
                    >
                        <circle cx="12" cy="12" r="11" fill="#4CAF50" />
                        <path d="M15.5 12L10 8V16L15.5 12Z" fill="black" />
                    </svg>
                </div>
                <img class="cover-img"
                    src="./Songs/${folder}/cover.png"
                    alt=""
                />
                <h2>${res.title}</h2>
                <p>${res.decriptions}</p>
            </div>`
        }

        Array.from(document.querySelectorAll('.card')).forEach(card => {
            card.addEventListener('click', async function (e) {
                songs = await getSongs(`Songs/${card.dataset.folder}`);
                songUL = '';
            });
        })
    }
}

const playMusic = function (track) {
    for (let song of songs) {
        let match = `${song.split('/').slice(-1).join('').split('%20').slice(0, 2).join(' ')}`;
        if (match === track) {
            currentAudio.src = song;
            currentAudio.play();
            playBtn.src = './SVGFILE/pause.svg';
            document.querySelector('.songinfo').innerHTML = `${track.split('/').slice(-1).join('').split('%20').slice(0, 2).join(' ')}`;
            document.querySelector('.songtime').innerHTML = "00:00 / 00:00";
            break;
        }
    }

    if (!currentAudio.src) {
        return;
    }
}

async function main() {

    // Dispaly All The All the Album on the page
    await dispalyAlbum();

    // Event Listner for Hamburger
    document.querySelector('.hamburger').addEventListener('click', function () {
        document.querySelector('.left').style.left = 0;
        document.querySelector('.right').classList.add('blur');
        document.querySelector('.playbar').classList.add('blur');
    });

    document.querySelector('.close-svg').addEventListener('click', function (e) {
        document.querySelector('.left').style.left = -120 + '%';
        document.querySelector('.right').classList.remove('blur');
        document.querySelector('.playbar').classList.remove('blur');
    });

    playBtn.addEventListener('click', function () {
        console.log('hello');

        if (!currentAudio.src) {
            return;
        }

        if (currentAudio.paused) {
            currentAudio.play();
            playBtn.src = './SVGFILE/pause.svg';
        }
        else {
            currentAudio.pause();
            playBtn.src = './SVGFILE/play.svg';
        }
    })

    document.getElementById('prev-btn').addEventListener('click', function () {
        let index = songs.indexOf(currentAudio.src);
        if (index > 0) {
            let currentTrack = songs[index - 1];
            currentTrack = `${currentTrack.split('/').slice(-1).join('').split('%20').slice(0, 2).join(' ')}`;
            playMusic(currentTrack);
        }
    });

    document.getElementById('next-btn').addEventListener('click', function () {
        let index = songs.indexOf(currentAudio.src);
        if (index < songs.length) {
            let currentTrack = songs[index + 1];
            currentTrack = `${currentTrack.split('/').slice(-1).join('').split('%20').slice(0, 2).join(' ')}`;
            playMusic(currentTrack);
        }
    })

    currentAudio.addEventListener('timeupdate', function () {
        let currentTime = currentAudio.currentTime;
        let duration = currentAudio.duration;

        document.querySelector('.songtime').innerHTML = `${secToMin(currentTime)} / ${secToMin(duration)}`;
        document.querySelector('.seek-circle').style.left = currentTime / duration * 98 + '%';
    });

    document.querySelector('.seekbar').addEventListener('click', function (e) {
        const percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector('.seek-circle').style.left = percent + '%';
        currentAudio.currentTime = (percent * currentAudio.duration) / 100;
    });
}

main();

