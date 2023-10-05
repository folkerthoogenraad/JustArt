
export function gameLoop(update: (delta: number) => void){
    let previousTime = performance.now();

    let frame = () => {
        let time = performance.now();

        let delta = (time - previousTime) / 1000;

        update(delta);

        previousTime = time;
        
        requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
}

export function waitFor(seconds: number): Promise<void> {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), seconds * 1000);
    });
}
export function waitForNextFrame(): Promise<void> {
    return new Promise((resolve, reject) => {
        requestAnimationFrame(() => resolve());
    });
}