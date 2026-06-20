function formatTime(t) {
    const min = Math.floor(t / (60 * 100));
    let strmin=min<10?`0${min}`:min;
    const heur = Math.floor(t / (3600 * 100));
    let strh=heur<10?`0${heur}`:heur;
    const sec = Math.floor((t % (60 * 100)) / 100);
    let strs=sec<10?`0${sec}`:sec;
    const cent = t % 100;
    return `${strh}:${strmin}:${strs}:${cent}`;
   // return heur < 10 ? "0" + heur : heur + ":"+strmin+":" + sec < 10 ? "0" + sec : sec + ":" + cent;
}