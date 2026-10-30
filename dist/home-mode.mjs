import {DEFAULT_GAME_MODE} from './arcade-engine.mjs';
export const HOME_REVISION=1;
// Blitz scores remain stored; new sessions use the five current menu choices.
export const MENU_MODES=['ascend','survival','timeRush','daily','relax'];
export function menuMode(mode){return mode==='blitz'?'daily':MENU_MODES.includes(mode)?mode:DEFAULT_GAME_MODE;}
export function openingMode(settings){return settings?.homeRevision===HOME_REVISION?menuMode(settings.mode):DEFAULT_GAME_MODE;}
export function homeRecord(read,day){
 let best=null;
 for(const mode of MENU_MODES){
  if(mode==='relax')continue;
  const value=read(mode==='daily'?'shapes1-daily':'best-shapes1-'+mode,0);
  const score=mode==='daily'?(value?.day===day?value.score:0):value;
  if(Number.isFinite(score)&&score>0&&score<=9e12&&(!best||score>best.score))best={mode,score:Math.floor(score)};
 }
 return best;
}
