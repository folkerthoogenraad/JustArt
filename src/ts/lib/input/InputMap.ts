import { InputAction } from "./InputAction";

export class InputMap {
    map: Map<string, InputAction>;
    
    constructor(){
        this.map = new Map<string, InputAction>();
    }

    getActionStrength(name: string): number {
        let action = this.getAction(name);

        return action.getStrength();
    }
    isActionPressed(name: string): boolean {
        let action = this.getAction(name);
        
        return action.isPressed();
    }
    isActionReleased(name: string): boolean {
        let action = this.getAction(name);
        
        return action.isReleased();
    }
    isActionDown(name: string): boolean {
        let action = this.getAction(name);
        
        return action.isDown();
    }
    getAxis(negative: string, positive: string) {
        return this.getActionStrength(positive) - this.getActionStrength(negative);
    }
    getAction(name: string): InputAction{
        let action = this.map.get(name);

        if(action === undefined) throw new Error(`Action '${name}' is not defined.`);

        return action;
    }
    registerAction(name: string, action: InputAction) {
        this.map.set(name, action);
    }
}