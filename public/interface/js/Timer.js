class Timer {
  /**
   * container : élément DOM parent
   * initTime : "MM:SS:CC" ou nombre (secondes) ou undefined
   */
  constructor(container, initTime = "00:00:00") {
    this.initTime = initTime;
    this.endEvt = null;
    this.component = {
      "content-timer": document.createElement("div"),
      "sub-timer": document.createElement("span"),
      "timer": document.createElement("span"),
    };
    this.component["sub-timer"].classList.add("sub-timer");
    this.component["timer"].classList.add("main-timer");
    this.component["sub-timer"].innerHTML = "00:00:00";
    // mettra une valeur correcte via setTime
    this.component.timer.innerHTML = initTime;

    this.component["content-timer"].appendChild(this.component["sub-timer"]);
    this.component["content-timer"].appendChild(this.component.timer);
    container.appendChild(this.component["content-timer"]);

    this.interval = null;

    // initialise le temps (gère string "MM:SS:CC" ou number de secondes)
    this.setTime(initTime);
  }
  onEnd(fnc) {
    // callback à override pour action à la fin du timer
    this.endEvt = fnc;
  }

  // Convertit différents formats en string "MM:SS:CC"
  setTime(time) {
    if (typeof time === "number" && Number.isFinite(time)) {
      // time en secondes (float possible)
      const totalCent = Math.max(0, Math.round(time * 100)); // centièmes
      const min = Math.floor(totalCent / (60 * 100));
      const sec = Math.floor((totalCent % (60 * 100)) / 100);
      const cent = totalCent % 100;
      this.component.timer.innerHTML = Timer._format(min, sec, cent);
      return;
    }

    if (typeof time === "string") {
      // nettoyage et split
      const parts = time.trim().split(":").map(p => p.trim());
      // pad à 3 éléments si nécessaire
      while (parts.length < 3) parts.push("0");
      let [minS, secS, centS] = parts;

      // parseInt safes
      let min = parseInt(minS, 10);
      let sec = parseInt(secS, 10);
      let cent = parseInt(centS, 10);

      if (Number.isNaN(min)) min = 0;
      if (Number.isNaN(sec)) sec = 0;
      if (Number.isNaN(cent)) cent = 0;

      // si cent fourni en millisecondes (ex: 523) -> ramener en centièmes
      if (cent > 99) cent = Math.floor(cent / 10) % 100;

      this.component.timer.innerHTML = Timer._format(min, sec, cent);
      return;
    }

    // fallback
    this.component.timer.innerHTML = "00:00:00";
  }

  // utilitaire de formatage
  static _format(min, sec, cent) {
    const pad = v => (v < 10 ? "0" + v : "" + v);
    return `${pad(min)}:${pad(sec)}:${pad(cent)}`;
  }

  // démarre le timer (décrémentation)
  process() {
    if (this.interval) return; // empêche double lancement

    this.interval = setInterval(() => {
      // récupération et parsing sûr
      const text = (this.component.timer.innerHTML || "00:00:00").trim();
      const parts = text.split(":").map(p => parseInt(p.trim(), 10));

      // garantir 3 parties et valeurs numériques
      let min = Number.isFinite(parts[0]) ? parts[0] : 0;
      let sec = Number.isFinite(parts[1]) ? parts[1] : 0;
      let cent = Number.isFinite(parts[2]) ? parts[2] : 0;

      // décrémentation des centièmes (10ms tick -> centièmes)
      cent++;
      if (cent < 0) {
        cent = 99;
        sec++;
        if (sec < 0) {
          sec = 59;
          min++;
        }
      }

      // si le chrono est écoulé ou min passe sous 0
    /*  if (min <= 0 && sec <= 0 && cent <= 0) {
        clearInterval(this.interval);
        this.interval = null;
        this.component["content-timer"].innerHTML = "Time's Up ⏰";
        if (this.endEvt) this.endEvt(); // callback de fin
        return;
      }*/

      // mise à jour de l'affichage (sécurisé)
      if (min < 0) min = 0;
      if (sec < 0) sec = 0;
      if (cent < 0) cent = 0;

      this.component.timer.innerHTML = Timer._format(min, sec, cent);
    }, 10); // 10ms -> centième decrement
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    } else {
      // si pas de timer en cours, on peut aussi considérer que stop remet à 0
      this.process(); // démarre le timer pour qu'il puisse décrémenter à 0
    }
  }

  reset() {
    this.stop();
    // remet le DOM contenu (garde sub-timer)
    this.component["content-timer"].innerHTML = "";
    this.component["content-timer"].appendChild(this.component["sub-timer"]);
    this.component["content-timer"].appendChild(this.component.timer);
    this.setTime(this.initTime);
  }
}
