import { GamepadAxis, GamepadButton, GamepadInput } from "./GamepadInput";
import { KeyboardInput } from "./KeyboardInput";
import { Keys } from "./Keys";

export abstract class InputAction {
    getStrength(): number{ 
        throw new Error("Unsupported action 'getStrength' on " + this);
    }
    isPressed(): boolean{ 
        throw new Error("Unsupported action 'isPressed' on " + this);
    }
    isReleased(): boolean{ 
        throw new Error("Unsupported action 'isReleased' on " + this);
    }
    isDown(): boolean{ 
        throw new Error("Unsupported action 'isDown' on " + this);
    }
}
export abstract class ButtonInputAction extends InputAction {
    getStrength(): number{ 
        return this.isDown() ? 1 : 0;
    }
}

export class GamepadAxisAction extends InputAction {
    gamepads: GamepadInput;
    gamepadIndex: number;
    axis: GamepadAxis;
    deadzone: number = 0.1;

    constructor(gamepads: GamepadInput, gamepadIndex: number, axis: GamepadAxis){
        super();
        this.gamepads = gamepads;
        this.gamepadIndex = gamepadIndex;
        this.axis = axis;
    }

    getStrength(): number{ 
        let value = this.gamepads.getAxis(this.gamepadIndex, this.axis);

        if(value < this.deadzone) return 0;

        return value;
    }
}

export class GamepadButtonInputAction extends ButtonInputAction {
    gamepads: GamepadInput;
    gamepadIndex: number;
    button: GamepadButton;

    constructor(gamepads: GamepadInput, gamepadIndex: number, button: GamepadButton){
        super();
        this.gamepads = gamepads;
        this.gamepadIndex = gamepadIndex;
        this.button = button;
    }

    isPressed(): boolean{ 
        return this.gamepads.isButtonPressed(this.gamepadIndex, this.button);
    }
    isReleased(): boolean{ 
        return this.gamepads.isButtonReleased(this.gamepadIndex, this.button);
    }
    isDown(): boolean{ 
        return this.gamepads.isButtonDown(this.gamepadIndex, this.button);
    }
}


export class KeyboardInputAction extends ButtonInputAction {
    keyboard: KeyboardInput;
    key: Keys;

    constructor(keyboard: KeyboardInput, key: Keys){
        super();
        this.keyboard = keyboard;
        this.key = key;
    }

    isPressed(): boolean{ 
        return this.keyboard.isKeyPressed(this.key);
    }
    isReleased(): boolean{ 
        return this.keyboard.isKeyReleased(this.key);
    }
    isDown(): boolean{ 
        return this.keyboard.isKeyDown(this.key);
    }
}