export const COLORS={I:'#69c8cc',O:'#e7c96b',T:'#ab95cf',S:'#a2be7e',Z:'#de8a82',J:'#81a2cc',L:'#dfa373'};
export const SHAPES={I:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],O:[[1,1],[1,1]],T:[[0,1,0],[1,1,1],[0,0,0]],S:[[0,1,1],[1,1,0],[0,0,0]],Z:[[1,1,0],[0,1,1],[0,0,0]],J:[[1,0,0],[1,1,1],[0,0,0]],L:[[0,0,1],[1,1,1],[0,0,0]]};
const NORMAL_KICKS={
 '0>1':[[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],'1>0':[[0,0],[1,0],[1,1],[0,-2],[1,-2]],
 '1>2':[[0,0],[1,0],[1,1],[0,-2],[1,-2]],'2>1':[[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
 '2>3':[[0,0],[1,0],[1,-1],[0,2],[1,2]],'3>2':[[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
 '3>0':[[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],'0>3':[[0,0],[1,0],[1,-1],[0,2],[1,2]]
};
const I_KICKS={
 '0>1':[[0,0],[-2,0],[1,0],[-2,1],[1,-2]],'1>0':[[0,0],[2,0],[-1,0],[2,-1],[-1,2]],
 '1>2':[[0,0],[-1,0],[2,0],[-1,-2],[2,1]],'2>1':[[0,0],[1,0],[-2,0],[1,2],[-2,-1]],
 '2>3':[[0,0],[2,0],[-1,0],[2,-1],[-1,2]],'3>2':[[0,0],[-2,0],[1,0],[-2,1],[1,-2]],
 '3>0':[[0,0],[1,0],[-2,0],[1,2],[-2,-1]],'0>3':[[0,0],[-1,0],[2,0],[-1,-2],[2,1]]
};
export function rotateMatrix(matrix,direction=1){const n=matrix.length;return matrix.map((r,y)=>r.map((_,x)=>direction===1?matrix[n-1-x][y]:matrix[x][n-1-y]));}
export class Game{
 constructor({random=Math.random,onEvent=()=>{}}={}){this.random=random;this.onEvent=onEvent;this.reset();}
 reset(){this.board=Array.from({length:20},()=>Array(10).fill(null));this.bag=[];this.next=[];this.score=0;this.lines=0;this.level=1;this.combo=-1;this.held=null;this.canHold=true;this.active=null;this.status='ready';this.elapsed=0;this.dropClock=0;this.lockClock=0;this.lockResets=0;this.fillQueue();}
 fillQueue(){while(this.next.length<5){if(!this.bag.length){this.bag=Object.keys(SHAPES);for(let i=this.bag.length-1;i>0;i--){let j=Math.floor(this.random()*(i+1));[this.bag[i],this.bag[j]]=[this.bag[j],this.bag[i]];}}this.next.push(this.bag.pop());}}
 start(){this.reset();this.status='playing';this.spawn();this.onEvent({type:'start'});}
 spawn(type){type??=this.next.shift();this.fillQueue();const matrix=SHAPES[type].map(r=>[...r]);this.active={type,matrix,x:Math.floor((10-matrix.length)/2),y:type==='I'?-1:0,rotation:0};this.dropClock=0;this.lockClock=0;this.lockResets=0;if(!this.valid(this.active)){this.status='over';this.onEvent({type:'over'});}}
 valid(piece=this.active,dx=0,dy=0,matrix=piece?.matrix){if(!piece)return false;for(let y=0;y<matrix.length;y++)for(let x=0;x<matrix[y].length;x++){if(!matrix[y][x])continue;const bx=piece.x+x+dx,by=piece.y+y+dy;if(bx<0||bx>=10||by>=20||(by>=0&&this.board[by][bx]))return false;}return true;}
 grounded(){return this.active&&!this.valid(this.active,0,1);}
 resetLock(wasGrounded){if(wasGrounded&&this.lockResets<15){this.lockClock=0;this.lockResets++;}}
 move(dx){if(this.status!=='playing'||!this.valid(this.active,dx,0))return false;const grounded=this.grounded();this.active.x+=dx;this.resetLock(grounded);this.onEvent({type:'move'});return true;}
 rotate(direction=1){if(this.status!=='playing'||this.active.type==='O')return false;const p=this.active,rotation=(p.rotation+direction+4)%4,matrix=rotateMatrix(p.matrix,direction);const kicks=(p.type==='I'?I_KICKS:NORMAL_KICKS)[`${p.rotation}>${rotation}`];for(const [dx,dy] of kicks){if(this.valid(p,dx,dy,matrix)){const grounded=this.grounded();Object.assign(p,{matrix,rotation,x:p.x+dx,y:p.y+dy});this.resetLock(grounded);this.onEvent({type:'rotate'});return true;}}return false;}
 down(manual=false){if(this.status!=='playing'||!this.valid(this.active,0,1))return false;this.active.y++;if(manual)this.score++;this.dropClock=0;return true;}
 ghostY(){if(!this.active)return 0;let dy=0;while(this.valid(this.active,0,dy+1))dy++;return this.active.y+dy;}
 hardDrop(){if(this.status!=='playing')return;const y=this.ghostY();this.score+=(y-this.active.y)*2;this.active.y=y;this.onEvent({type:'drop'});this.lock();}
 hold(){if(this.status!=='playing'||!this.canHold)return false;const type=this.active.type;if(this.held){const held=this.held;this.held=type;this.spawn(held);}else{this.held=type;this.spawn();}this.canHold=false;this.onEvent({type:'hold'});return true;}
 lock(){if(this.status!=='playing')return;const p=this.active;let above=false;for(let y=0;y<p.matrix.length;y++)for(let x=0;x<p.matrix[y].length;x++){if(!p.matrix[y][x])continue;const by=p.y+y;if(by<0)above=true;else this.board[by][p.x+x]=p.type;}if(above){this.status='over';this.onEvent({type:'over'});return;}
 const cleared=[];this.board.forEach((row,i)=>{if(row.every(Boolean))cleared.push(i);});if(cleared.length){this.board=this.board.filter((_,i)=>!cleared.includes(i));while(this.board.length<20)this.board.unshift(Array(10).fill(null));this.combo++;const points=[0,100,300,500,800][cleared.length]*this.level+Math.max(0,this.combo)*50*this.level;this.score+=points;this.lines+=cleared.length;const oldLevel=this.level;this.level=Math.floor(this.lines/10)+1;this.onEvent({type:'clear',rows:cleared,count:cleared.length,points,levelUp:this.level>oldLevel});}else{this.combo=-1;this.onEvent({type:'lock'});}this.canHold=true;this.spawn();}
 pause(){if(this.status==='playing'){this.status='paused';return true;}return false;}
 resume(){if(this.status==='paused'){this.status='playing';return true;}return false;}
 tick(dt){if(this.status!=='playing')return;this.elapsed+=dt;const speed=Math.max(60,900*Math.pow(.78,this.level-1));this.dropClock+=dt;while(this.dropClock>=speed){this.dropClock-=speed;if(this.valid(this.active,0,1))this.active.y++;else break;}if(this.grounded()){this.lockClock+=dt;if(this.lockClock>=450)this.lock();}else this.lockClock=0;}
}
