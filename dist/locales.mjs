export const LANGUAGES={tr:{name:'Türkçe',locale:'tr-TR'},en:{name:'English',locale:'en-US'},it:{name:'Italiano',locale:'it-IT'},es:{name:'Español',locale:'es-ES'},de:{name:'Deutsch',locale:'de-DE'},ru:{name:'Русский',locale:'ru-RU'}};
export function normalizeLanguage(value){return Object.hasOwn(LANGUAGES,value)?value:'tr';}
