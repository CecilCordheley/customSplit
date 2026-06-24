class CustomSplit {
    constructor(container, onStart = null, onSplit = null, onEnd = null) {
        this.container = container;
        this.current = null;
        this.lastSegment=null
        this.splits = [];
        this.splitEl = [];
        this.curentSplit = null;
        this.index = 0;
        this.timer = 0;
        this.interval = 0;
        this.lastSplitTime = 0;
        this.timerEl = document.createElement("div");
        this.running = false;
        this.onEnd = onEnd;
        this.onStart = onStart;
        this.onSplit = onSplit;
    }
    reset() {
        this.index = 0;
        this.timer = 0;
        this.interval = 0;
        this.lastSplitTime = 0;
        this.generateSegments();
    }
    end() {
        let e = this.index >= this.splits.length;
        if (e) {
            if (this.onEnd != null)
                this.onEnd.call(this);
            return true;
        }
        return false;
    }
    async updateSplit() {
        console.log("Update !");
        fetch('/api/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.splits)
        });
    }
    generateSegments() {
        if (this.splits.length == 0) {
            throw new Error("No Splits loaded !");
        }
        console.dir(this.splits);
        this.container.innerHTML = "";
        this.splits.forEach(s => {

            const spans = new Map();
            let segment = document.createElement("div");
            segment.classList.add("segment");
            ["name", "delta", "last", "best"].forEach(span => {
                let el = document.createElement("span");
                el.classList.add("cSplit_" + span);
                spans[span] = el;
                segment.appendChild(el);
            });
            
            
            if(s.icon!=""){
                let img=document.createElement('img');
                img.src="../data/assets/icons/"+s.icon;
                console.dir(img);
                spans["name"].appendChild(img);
                spans["name"].innerHTML += s.name;
            }else
                spans["name"].innerText = s.name;
            spans["best"].innerText = formatTime(s.best ?? 0);
            spans["last"].innerText = formatTime(s.last ?? 0);
            this.splitEl.push(segment);
            this.container.appendChild(segment);
            this.timerEl.innerHTML = formatTime(this.timer);
            this.timerEl.classList.add("mainTimer");
            this.container.appendChild(this.timerEl);
        });
    }
    async loadSplit() {
        let result = await fetch("../param.json");
        let reponse = await result.json();
        console.log(reponse.file);
        let file = await fetch("../data/" + reponse.file);
        let splits = await file.json();
        this.splits = splits;
        this.generateSegments();
    }
    next() {

        // 1. sécurité fin de run
        if (this.index >= this.splits.length) {
            this.stopTimer();
            return;
        }

        // 2. calcul des temps
        const splitTime = this.timer;
        const segmentTime = splitTime - this.lastSplitTime;

        const segment = this.splits[this.index];

        // 3. delta basé sur le BEST AVANT modification
        const previousBest = segment.best;
        const isGold =
            previousBest == null || segmentTime < previousBest;

        const delta = previousBest == null
            ? 0
            : segmentTime - previousBest;

        // 4. MAJ données
        segment.last = segmentTime;

        if (isGold) {
            segment.best = segmentTime;
        }

        // 5. UI refs (évite querySelector multiples si possible ensuite)
        const el = this.splitEl[this.index];
        this.current = el;
        this.lastSegment=this.splitEl[this.index-1];
        const deltaEl = el.querySelector(".cSplit_delta");
        const lastEl = el.querySelector(".cSplit_last");
        const bestEl = el.querySelector(".cSplit_best");

        // 6. LAST
        lastEl.innerText = formatTime(segmentTime);

        // 7. BEST
        bestEl.innerText = formatTime(segment.best);

        // 8. DELTA
        deltaEl.classList.remove("ahead", "behind", "gold");

        const sign = delta > 0 ? "+" : "-";
        deltaEl.innerText = sign + formatTime(Math.abs(delta));

        if (isGold) {
            deltaEl.classList.add("gold");
        } else if (delta < 0) {
            deltaEl.classList.add("ahead");
        } else {
            deltaEl.classList.add("behind");
        }

        // 9. avancer timer global
        this.lastSplitTime = splitTime;
        this.index++;
        // 11. fin de run
        if (this.index >= this.splits.length) {
            this.stopTimer();

            if (this.onEnd) {
                this.onEnd.call(this, this.timer);
            }
            return;
        }
        // 10. callback split
        if (this.onSplit) {
            this.onSplit.call(this, {
                index: this.index - 1,
                segmentTime,
                totalTime: splitTime,
                isGold,
                delta
            });
        }


    }
    stopTimer() {
        clearInterval(this.interval);
        this.running = false;
    }
    setTimer() {
        this.timer++;
        if (this.timerEl != undefined)
            this.timerEl.innerHTML = formatTime(this.timer);
    }
    process() {
        if (this.running) return;

        this.running = true;
        if (this.onStart != null)
            this.onStart.call(this);
        this.interval = setInterval(() => {
            this.setTimer();
        }, 10);
    }
}