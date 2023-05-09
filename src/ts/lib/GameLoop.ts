
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