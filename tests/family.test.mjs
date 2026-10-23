import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeFamily,shuffledAssignments} from '../dist/family.mjs';
import {Game} from '../dist/engine.mjs';

const photo='data:image/jpeg;base64,YQ==';
test('family storage accepts selected local JPEGs and limits names',()=>{
 const saved=normalizeFamily(JSON.stringify({version:1,people:[{name:'A'.repeat(40),photo}],order:[0,0,0,0,0,0,0]}));
 assert.equal(saved.people[0].name.length,24);assert.equal(saved.enabled,true);assert.equal(saved.people[0].photo,photo);
});
test('family storage rejects remote photos, malformed JSON, and oversized data',()=>{
 assert.equal(normalizeFamily('{'),null);
 assert.equal(normalizeFamily(JSON.stringify({version:1,people:[{photo:'https://example.com/person.jpg'}]})),null);
 assert.equal(normalizeFamily(JSON.stringify({version:1,people:Array(8).fill({name:'a',photo})})),null);
 assert.equal(normalizeFamily('x'.repeat(1_000_001)),null);
});
test('invalid family assignments fall back to every available person',()=>{
 const saved=normalizeFamily(JSON.stringify({version:1,people:[{name:'a',photo},{name:'b',photo}],order:[99,0,0,0,0,0,0]}));
 assert.deepEqual(saved.order,[0,1,0,1,0,1,0]);
});
test('shuffling assigns all seven shapes and keeps each selected person',()=>{
 for(let count=1;count<=7;count++){
  const order=shuffledAssignments(count,()=>.37);assert.equal(order.length,7);assert.equal(new Set(order).size,count);assert.ok(order.every(n=>n>=0&&n<count));
 }
});
test('locked character tiles remember their rotated image coordinates',()=>{
 const game=new Game({random:()=>.5});game.start();game.rotate();const p=structuredClone(game.active);game.hardDrop();
 const tiles=game.tiles.flat().filter(Boolean);assert.equal(tiles.length,4);assert.ok(tiles.every(t=>t.type===p.type&&t.rotation===p.rotation));
 assert.deepEqual(tiles.map(t=>[t.x,t.y]).sort(),p.matrix.flatMap((row,y)=>row.flatMap((v,x)=>v?[[x,y]]:[])).sort());
});
test('line clears move remaining character fragments with the matching board cells',()=>{
 const game=new Game();game.start();game.board[19]=Array(10).fill('J');game.board[19][4]=null;game.board[19][5]=null;
 game.active={type:'O',matrix:[[1,1],[1,1]],x:4,y:18,rotation:0};game.lock();
 assert.equal(game.lines,1);assert.equal(game.board[19][4],'O');assert.equal(game.tiles[19][4].y,0);assert.equal(game.tiles[19][5].x,1);assert.equal(game.tiles[19][5].y,0);
 assert.ok(game.tiles[0].every(v=>v===null));game.start();assert.ok(game.tiles.flat().every(v=>v===null));
});
