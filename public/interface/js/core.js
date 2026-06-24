function formatTime(t) {
    const min = Math.floor(t / (60 * 100));
    let strmin = min < 10 ? `0${min}` : min;
    const heur = Math.floor(t / (3600 * 100));
    let strh = heur < 10 ? `0${heur}` : heur;
    const sec = Math.floor((t % (60 * 100)) / 100);
    let strs = sec < 10 ? `0${sec}` : sec;
    const cent = t % 100;
    return `${strh}:${strmin}:${strs}:${cent}`;
    // return heur < 10 ? "0" + heur : heur + ":"+strmin+":" + sec < 10 ? "0" + sec : sec + ":" + cent;
}
/**
 * Composant pour généré du CSS
 */
class CSSTree {
    constructor(container, css) {
        this.container = container;
        this.css = css;
    }
    generateTree() {
        const regex = /(.*?)\{(.*?)\}/gms;
        let m;

        while ((m = regex.exec(this.css)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }

            // The result can be accessed through the `m`-variable.
            m.forEach((match, groupIndex) => {
                console.log(`Found match, group ${groupIndex}: ${match}`);
            });
        }
    }
}