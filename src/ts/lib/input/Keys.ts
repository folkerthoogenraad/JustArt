export enum Keys {
    Undefined,
	AltLeft,
	AltRight,
	ArrowDown,
	ArrowLeft,
	ArrowRight,
	ArrowUp,
	Backquote,
	Backspace,
	BracketLeft,
	BracketRight,
	CapsLock,
	Comma,
	ControlLeft,
	ControlRight,
	Delete,
	Digit0,
	Digit1,
	Digit2,
	Digit3,
	Digit4,
	Digit5,
	Digit6,
	Digit7,
	Digit8,
	Digit9,
	End,
	Enter,
	Equal,
	F1,
	F2,
	F3,
	F4,
	F5,
	F6,
	F7,
	F8,
	F9,
	F10,
	F11,
	F12,
	Home,
	Insert,
	KeyA,
	KeyB,
	KeyC,
	KeyD,
	KeyE,
	KeyF,
	KeyG,
	KeyH,
	KeyI,
	KeyJ,
	KeyK,
	KeyL,
	KeyM,
	KeyN,
	KeyO,
	KeyP,
	KeyQ,
	KeyR,
	KeyS,
	KeyT,
	KeyU,
	KeyV,
	KeyW,
	KeyX,
	KeyY,
	KeyZ,
	MetaRight,
	Minus,
	Numpad0,
	Numpad1,
	Numpad2,
	Numpad3,
	Numpad4,
	Numpad5,
	Numpad6,
	Numpad7,
	Numpad8,
	Numpad9,
	NumpadAdd,
	NumpadDecimal,
	NumpadDivide,
	NumpadEnter,
	NumpadMultiply,
	NumpadSubtract,
	PageDown,
	PageUp,
	Period,
	Quote,
	Semicolon,
	ShiftLeft,
	Slash,
	Space,
	Tab,
}

export function stringToKey(key: string): Keys {
    switch(key){
        case "AltLeft": return Keys.AltLeft;
        case "AltRight": return Keys.AltRight;
        case "ArrowDown": return Keys.ArrowDown;
        case "ArrowLeft": return Keys.ArrowLeft;
        case "ArrowRight": return Keys.ArrowRight;
        case "ArrowUp": return Keys.ArrowUp;
        case "Backquote": return Keys.Backquote;
        case "Backspace": return Keys.Backspace;
        case "BracketLeft": return Keys.BracketLeft;
        case "BracketRight": return Keys.BracketRight;
        case "CapsLock": return Keys.CapsLock;
        case "Comma": return Keys.Comma;
        case "ControlLeft": return Keys.ControlLeft;
        case "ControlRight": return Keys.ControlRight;
        case "Delete": return Keys.Delete;
        case "Digit0": return Keys.Digit0;
        case "Digit1": return Keys.Digit1;
        case "Digit2": return Keys.Digit2;
        case "Digit3": return Keys.Digit3;
        case "Digit4": return Keys.Digit4;
        case "Digit5": return Keys.Digit5;
        case "Digit6": return Keys.Digit6;
        case "Digit7": return Keys.Digit7;
        case "Digit8": return Keys.Digit8;
        case "Digit9": return Keys.Digit9;
        case "End": return Keys.End;
        case "Enter": return Keys.Enter;
        case "Equal": return Keys.Equal;
        case "F1": return Keys.F1;
        case "F2": return Keys.F2;
        case "F3": return Keys.F3;
        case "F4": return Keys.F4;
        case "F5": return Keys.F5;
        case "F6": return Keys.F6;
        case "F7": return Keys.F7;
        case "F8": return Keys.F8;
        case "F9": return Keys.F9;
        case "F10": return Keys.F10;
        case "F11": return Keys.F11;
        case "F12": return Keys.F12;
        case "Home": return Keys.Home;
        case "Insert": return Keys.Insert;
        case "KeyA": return Keys.KeyA;
        case "KeyB": return Keys.KeyB;
        case "KeyC": return Keys.KeyC;
        case "KeyD": return Keys.KeyD;
        case "KeyE": return Keys.KeyE;
        case "KeyF": return Keys.KeyF;
        case "KeyG": return Keys.KeyG;
        case "KeyH": return Keys.KeyH;
        case "KeyI": return Keys.KeyI;
        case "KeyJ": return Keys.KeyJ;
        case "KeyK": return Keys.KeyK;
        case "KeyL": return Keys.KeyL;
        case "KeyM": return Keys.KeyM;
        case "KeyN": return Keys.KeyN;
        case "KeyO": return Keys.KeyO;
        case "KeyP": return Keys.KeyP;
        case "KeyQ": return Keys.KeyQ;
        case "KeyR": return Keys.KeyR;
        case "KeyS": return Keys.KeyS;
        case "KeyT": return Keys.KeyT;
        case "KeyU": return Keys.KeyU;
        case "KeyV": return Keys.KeyV;
        case "KeyW": return Keys.KeyW;
        case "KeyX": return Keys.KeyX;
        case "KeyY": return Keys.KeyY;
        case "KeyZ": return Keys.KeyZ;
        case "MetaRight": return Keys.MetaRight;
        case "Minus": return Keys.Minus;
        case "Numpad0": return Keys.Numpad0;
        case "Numpad1": return Keys.Numpad1;
        case "Numpad2": return Keys.Numpad2;
        case "Numpad3": return Keys.Numpad3;
        case "Numpad4": return Keys.Numpad4;
        case "Numpad5": return Keys.Numpad5;
        case "Numpad6": return Keys.Numpad6;
        case "Numpad7": return Keys.Numpad7;
        case "Numpad8": return Keys.Numpad8;
        case "Numpad9": return Keys.Numpad9;
        case "NumpadAdd": return Keys.NumpadAdd;
        case "NumpadDecimal": return Keys.NumpadDecimal;
        case "NumpadDivide": return Keys.NumpadDivide;
        case "NumpadEnter": return Keys.NumpadEnter;
        case "NumpadMultiply": return Keys.NumpadMultiply;
        case "NumpadSubtract": return Keys.NumpadSubtract;
        case "PageDown": return Keys.PageDown;
        case "PageUp": return Keys.PageUp;
        case "Period": return Keys.Period;
        case "Quote": return Keys.Quote;
        case "Semicolon": return Keys.Semicolon;
        case "ShiftLeft": return Keys.ShiftLeft;
        case "Slash": return Keys.Slash;
        case "Space": return Keys.Space;
        case "Tab": return Keys.Tab;
    }

    return Keys.Undefined;
}
export function keyToString(key: Keys): string{
    switch(key){
        case Keys.AltLeft: return "AltLeft";
        case Keys.AltRight: return "AltRight";
        case Keys.ArrowDown: return "ArrowDown";
        case Keys.ArrowLeft: return "ArrowLeft";
        case Keys.ArrowRight: return "ArrowRight";
        case Keys.ArrowUp: return "ArrowUp";
        case Keys.Backquote: return "Backquote";
        case Keys.Backspace: return "Backspace";
        case Keys.BracketLeft: return "BracketLeft";
        case Keys.BracketRight: return "BracketRight";
        case Keys.CapsLock: return "CapsLock";
        case Keys.Comma: return "Comma";
        case Keys.ControlLeft: return "ControlLeft";
        case Keys.ControlRight: return "ControlRight";
        case Keys.Delete: return "Delete";
        case Keys.Digit0: return "Digit0";
        case Keys.Digit1: return "Digit1";
        case Keys.Digit2: return "Digit2";
        case Keys.Digit3: return "Digit3";
        case Keys.Digit4: return "Digit4";
        case Keys.Digit5: return "Digit5";
        case Keys.Digit6: return "Digit6";
        case Keys.Digit7: return "Digit7";
        case Keys.Digit8: return "Digit8";
        case Keys.Digit9: return "Digit9";
        case Keys.End: return "End";
        case Keys.Enter: return "Enter";
        case Keys.Equal: return "Equal";
        case Keys.F1: return "F1";
        case Keys.F2: return "F2";
        case Keys.F3: return "F3";
        case Keys.F4: return "F4";
        case Keys.F5: return "F5";
        case Keys.F6: return "F6";
        case Keys.F7: return "F7";
        case Keys.F8: return "F8";
        case Keys.F9: return "F9";
        case Keys.F10: return "F10";
        case Keys.F11: return "F11";
        case Keys.F12: return "F12";
        case Keys.Home: return "Home";
        case Keys.Insert: return "Insert";
        case Keys.KeyA: return "KeyA";
        case Keys.KeyB: return "KeyB";
        case Keys.KeyC: return "KeyC";
        case Keys.KeyD: return "KeyD";
        case Keys.KeyE: return "KeyE";
        case Keys.KeyF: return "KeyF";
        case Keys.KeyG: return "KeyG";
        case Keys.KeyH: return "KeyH";
        case Keys.KeyI: return "KeyI";
        case Keys.KeyJ: return "KeyJ";
        case Keys.KeyK: return "KeyK";
        case Keys.KeyL: return "KeyL";
        case Keys.KeyM: return "KeyM";
        case Keys.KeyN: return "KeyN";
        case Keys.KeyO: return "KeyO";
        case Keys.KeyP: return "KeyP";
        case Keys.KeyQ: return "KeyQ";
        case Keys.KeyR: return "KeyR";
        case Keys.KeyS: return "KeyS";
        case Keys.KeyT: return "KeyT";
        case Keys.KeyU: return "KeyU";
        case Keys.KeyV: return "KeyV";
        case Keys.KeyW: return "KeyW";
        case Keys.KeyX: return "KeyX";
        case Keys.KeyY: return "KeyY";
        case Keys.KeyZ: return "KeyZ";
        case Keys.MetaRight: return "MetaRight";
        case Keys.Minus: return "Minus";
        case Keys.Numpad0: return "Numpad0";
        case Keys.Numpad1: return "Numpad1";
        case Keys.Numpad2: return "Numpad2";
        case Keys.Numpad3: return "Numpad3";
        case Keys.Numpad4: return "Numpad4";
        case Keys.Numpad5: return "Numpad5";
        case Keys.Numpad6: return "Numpad6";
        case Keys.Numpad7: return "Numpad7";
        case Keys.Numpad8: return "Numpad8";
        case Keys.Numpad9: return "Numpad9";
        case Keys.NumpadAdd: return "NumpadAdd";
        case Keys.NumpadDecimal: return "NumpadDecimal";
        case Keys.NumpadDivide: return "NumpadDivide";
        case Keys.NumpadEnter: return "NumpadEnter";
        case Keys.NumpadMultiply: return "NumpadMultiply";
        case Keys.NumpadSubtract: return "NumpadSubtract";
        case Keys.PageDown: return "PageDown";
        case Keys.PageUp: return "PageUp";
        case Keys.Period: return "Period";
        case Keys.Quote: return "Quote";
        case Keys.Semicolon: return "Semicolon";
        case Keys.ShiftLeft: return "ShiftLeft";
        case Keys.Slash: return "Slash";
        case Keys.Space: return "Space";
        case Keys.Tab: return "Tab";
    }

    return "Undefined";
}