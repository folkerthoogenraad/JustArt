export enum GamepadButton {
    A = 0,
    B = 1,
    X = 2,
    Y = 3,

    LeftBumper = 4,
    RightBumper = 5,

    LeftTrigger = 6,
    RightTrigger = 7,

    Menu = 9,
    View = 8,

    LeftStick = 10,
    RigthStick = 11,

    DPadUp = 12,
    DPadDown = 13,   
    DPadLeft = 14,
    DPadRight = 15,

    Count,
}
export enum GamepadAxis {
    LeftStickUp,
    LeftStickDown,
    LeftStickLeft,
    LeftStickRight,

    RightStickUp,
    RightStickDown,
    RightStickLeft,
    RightStickRight,

    RightTrigger,
    LeftTrigger,
    
    Count,
}

class GamepadState {
    index: number;

    axes: number[];

    buttonsPressed: boolean[];
    buttonsReleased: boolean[];
    buttonsDown: boolean[];

    connected: boolean = false;

    constructor(index: number){
        this.index = index;

        this.axes = [];
        this.buttonsPressed = [];
        this.buttonsReleased = [];
        this.buttonsDown = [];

        for(let i = 0; i < GamepadAxis.Count; i++) {
            this.axes.push(0);
        }

        for(let i = 0; i < GamepadButton.Count; i++) {
            this.buttonsPressed.push(false);
            this.buttonsReleased.push(false);
            this.buttonsDown.push(false);
        }
    }

    poll(gamepads: (Gamepad|null)[]){
        let gamepad = gamepads[this.index];

        if(!gamepad) return;
        if(!gamepad.connected) return;

        for(let i = 0; i < GamepadButton.Count; i++){
            let pressed = gamepad.buttons[i].pressed;

            this.buttonsPressed[i] = !this.buttonsDown[i] && pressed;
            this.buttonsReleased[i] = this.buttonsDown[i] && !pressed;

            this.buttonsDown[i] = pressed;
        }


        // All the axes
        this.axes[GamepadAxis.LeftStickUp] = this.clamp01(-gamepad.axes[1]);
        this.axes[GamepadAxis.LeftStickDown] = this.clamp01(gamepad.axes[1]);
        this.axes[GamepadAxis.LeftStickLeft] = this.clamp01(-gamepad.axes[0]);
        this.axes[GamepadAxis.LeftStickRight] = this.clamp01(gamepad.axes[0]);
        
        this.axes[GamepadAxis.RightStickUp] = this.clamp01(-gamepad.axes[3]);
        this.axes[GamepadAxis.RightStickDown] = this.clamp01(gamepad.axes[3]);
        this.axes[GamepadAxis.RightStickLeft] = this.clamp01(-gamepad.axes[2]);
        this.axes[GamepadAxis.RightStickRight] = this.clamp01(gamepad.axes[2]);

        this.axes[GamepadAxis.RightTrigger] = this.clamp01(gamepad.buttons[GamepadButton.RightTrigger].value);
        this.axes[GamepadAxis.LeftTrigger] = this.clamp01(gamepad.buttons[GamepadButton.LeftTrigger].value);
    }

    clamp01(n: number){
        if(n < 0) return 0;
        if(n > 1) return 1;

        return n;
    }
}

export class GamepadInput {
    private states: GamepadState[];

    constructor() {
        this.states = [];
        
        let pads = navigator.getGamepads();

        for(let i = 0; i < pads.length; i++){
            this.states[i] = new GamepadState(i);

            if(!pads[i]?.connected) continue;

            this.states[i].connected = true;
        }

        this.setupEventListeners();
    }

    poll(){
        let pads = navigator.getGamepads();
        this.states.forEach(state => {
            if(state === null) return;

            state.poll(pads);
        });
    }

    isButtonPressed(index: number, button: GamepadButton): boolean {
        return this.states[index].buttonsPressed[button];
    }

    isButtonReleased(index: number, button: GamepadButton): boolean {
        return this.states[index].buttonsReleased[button];
    }

    isButtonDown(index: number, button: GamepadButton): boolean {
        return this.states[index]?.buttonsDown[button];
    }

    getAxis(index: number, axis: GamepadAxis): number {
        return this.states[index].axes[axis];
    }

    isConnected(index: number): boolean{
        return this.states[index].connected;
    }  

    private setupEventListeners(){
        window.addEventListener("gamepadconnected", (e) => {
            this.states[e.gamepad.index].connected = true;
        });
        
        window.addEventListener("gamepaddisconnected", (e) => {
            this.states[e.gamepad.index].connected = false;
        });
    }
}