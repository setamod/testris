import {DEFAULT_GAME_MODE,GAME_MODES} from './arcade-engine.mjs';

export const HOME_REVISION=1;
// Introduce the main mode to existing installs once, then remember later choices.
// This never edits scores, progress, photos or the previous settings object.
export function openingMode(settings){
 return settings?.homeRevision===HOME_REVISION&&GAME_MODES.includes(settings.mode)?settings.mode:DEFAULT_GAME_MODE;
}
