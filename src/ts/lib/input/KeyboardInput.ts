import { Keys, stringToKey } from "./Keys";

export class KeyboardInput {
    private root: Document|HTMLElement;

    private internalPressedKeys: Set<Keys>;
    private internalDownKeys: Set<Keys>;
    private internalReleasedKeys: Set<Keys>;

    private pressedKeys: Set<Keys>;
    private downKeys: Set<Keys>;
    private releasedKeys: Set<Keys>;

    constructor(root?: HTMLElement|Document){
        this.root = root ?? document;

        this.pressedKeys = new Set<Keys>();
        this.downKeys = new Set<Keys>();
        this.releasedKeys = new Set<Keys>();

        this.internalPressedKeys = new Set<Keys>();
        this.internalDownKeys = new Set<Keys>();
        this.internalReleasedKeys = new Set<Keys>();

        this.setupEventListeners();
    }

    poll(){
        //Swap internal and external lists, clear the internal lists.
        [this.pressedKeys, this.internalPressedKeys] = [this.internalPressedKeys, this.pressedKeys];
        [this.releasedKeys, this.internalReleasedKeys] = [this.internalReleasedKeys, this.releasedKeys];

        this.internalPressedKeys.clear();
        this.internalReleasedKeys.clear();

        // Copy the downkeys over to the external buffer
        this.downKeys.clear();

        this.internalDownKeys.forEach(key => {
            this.downKeys.add(key);
        })
    }

    isKeyPressed(key: Keys){
        return this.pressedKeys.has(key);
    }
    isKeyReleased(key: Keys){
        return this.releasedKeys.has(key);
    }
    isKeyDown(key: Keys){
        return this.downKeys.has(key);
    }

    private setupEventListeners(){
        // Stupid hackfix to get the compiler to recognize the keydown and keyup events
        let root = this.root as HTMLElement; 

        root.addEventListener("keydown", (e: KeyboardEvent) => {
            if(e.repeat){
                return;
            }

            let key = stringToKey(e.code);

            this.internalDownKeys.add(key);
            this.internalPressedKeys.add(key);
        });
        root.addEventListener("keyup", (e: KeyboardEvent) => {
            let key = stringToKey(e.code);

            this.internalDownKeys.delete(key);
            this.internalReleasedKeys.add(key);

        });
    }
}