
type GlobalKey = `${string}+${string}` | string;
export type GlobalStateKey = 
    | "Auth"
    | "Atomic"
    | "Params"
    | "Query"
    | "Body"
; 

type GlobalStates = Record<GlobalStateKey, any>;

// =======================================================================
// State 제공: Annotation -> Router
const controllerState : Record<GlobalKey, GlobalStates> = {};

// // State 제공: Router -> Context
// let contextState : Record<GlobalKey, GlobalStates> = {};

export 
{ 
    controllerState, 
    // contextState 
};