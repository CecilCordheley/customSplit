function formatTime(t) {

    const hours = Math.floor(t / 360000);
    const minutes = Math.floor((t % 360000) / 6000);
    const seconds = Math.floor((t % 6000) / 100);
    const centiseconds = t % 100;

    return [
        String(hours).padStart(2, "0"),
        String(minutes).padStart(2, "0"),
        String(seconds).padStart(2, "0"),
        String(centiseconds).padStart(2, "0")
    ].join(":");
}