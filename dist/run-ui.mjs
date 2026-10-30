export const MODE_RULES={
 ascend:{goal:'modeAscendGoal',pressure:'modeAscendPressure',end:'modeRiseEnd',badge:'modeStages'},
 survival:{goal:'modeRushGoal',pressure:'modeRushPressure',end:'modeRiseEnd',badge:'modeEndless'},
 blitz:{goal:'modeBlitzGoal',pressure:'modeBlitzPressure',end:'modeBlitzEnd',badge:'mode60'},
 timeRush:{goal:'modeTimeGoal',pressure:'modeTimePressure',end:'modeTimeEnd',badge:'modeTimeBank'},
 relax:{goal:'modeRelaxGoal',pressure:'modeRelaxPressure',end:'modeRelaxEnd',badge:'modeCalm'},
 daily:{goal:'modeDailyGoal',pressure:'modeDailyPressure',end:'modeDailyEnd',badge:'mode90'}
};
export function runPressure(game){
 const seconds=game.timed?Math.max(0,Math.ceil(game.remaining/1000)):null;
 const rising=!game.renewing,playing=game.status==='playing',intermission=game.phase?.kind==='wave';
 const timeRisk=game.mode==='timeRush'&&game.status==='over'&&game.reason==='time'?'ended':!game.timed||!playing?'none':seconds<=5?'critical':seconds<=15?'warning':'normal';
 const overflowRisk=!rising||!playing||intermission?'none':game.board.slice(0,8).some(x=>x!==null)?'critical':game.danger?'warning':'normal';
 return {seconds,timeRisk,overflowRisk,nextRowSeconds:Math.max(1,Math.ceil((1-game.riseProgress)*game.interval/1000)),timeFraction:game.timed?Math.min(1,game.remaining/(game.mode==='timeRush'?60000:game.duration)):1};
}
export function reminderPower(game,lastAction,lastReminder){
 if(game.mode==='relax'||game.status!=='playing'||game.busy||game.elapsed-lastReminder<8000||game.elapsed-lastAction<4000)return null;
 return ['nova','cross','rocket','bomb','shuffle'].find(power=>game.powers[power]>0&&(game.height>0||!['nova','shuffle'].includes(power)))??null;
}
