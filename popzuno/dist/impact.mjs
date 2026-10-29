// Original procedural impacts. Render once, play as one buffered voice per power.
export function impactSamples(kind,sampleRate=48000){
 const duration={bomb:.9,rocket:1.12,cross:1.02,nova:1.5}[kind]??.9,length=Math.ceil(sampleRate*duration),channels=[];
 const blast=kind==='rocket'?.19:kind==='nova'?.07:0,big=kind==='nova';
 for(let channel=0;channel<2;channel++){
  const data=new Float32Array(length);let seed=(channel+1)*7919+kind.charCodeAt(0)*104729,low=0,previous=0,phase=0;
  for(let i=0;i<length;i++){
   seed=(Math.imul(seed,1664525)+1013904223)>>>0;const noise=seed/2147483648-1,t=i/sampleRate,u=t-blast;
   low+=.1*(noise-low);const high=noise-previous;previous=noise;
   let value=0;
   if(u>=0){
    phase+=Math.PI*2*(29+(big?105:150)*Math.exp(-u*24))/sampleRate;
    const attack=1-Math.exp(-u*1700),body=Math.sin(phase)*Math.exp(-u*(big?3.6:6.5));
    value=attack*(body*.65+low*2.5*Math.exp(-u*(big?4:7))+noise*.35*Math.exp(-u*14));
    for(const offset of [0,.027,.073])if(u>=offset)value+=high*.22*Math.exp(-(u-offset)*90);
    if(u>.1)value+=Math.sin(2*Math.PI*(kind==='cross'?1150:790)*(u-.1))*Math.exp(-(u-.1)*22)*.065;
   }
   if(kind==='rocket'&&t<blast)value+=high*.22*(t/blast)**1.3;
   if(kind==='nova'&&t<blast)value+=Math.sin(2*Math.PI*180*t)*.1*(t/blast);
   data[i]=value/(1+Math.abs(value));
  }
  // Short, softened reflections are baked into the tail, not real-time effects.
  for(const [delay,gain]of [[.09+channel*.006,.19],[.21-channel*.008,.1]]){
   const offset=Math.round(delay*sampleRate);for(let i=length-1;i>=offset;i--)data[i]+=data[i-offset]*gain;
  }
  channels.push(data);
 }
 let peak=.001;for(const channel of channels)for(const sample of channel)peak=Math.max(peak,Math.abs(sample));
 for(const channel of channels)for(let i=0;i<length;i++)channel[i]*=.86/peak;
 return {channels,duration};
}
export function createImpactBank(context){
 const bank={};for(const kind of ['bomb','rocket','cross','nova']){const {channels}=impactSamples(kind,context.sampleRate);const buffer=context.createBuffer(2,channels[0].length,context.sampleRate);channels.forEach((data,index)=>buffer.getChannelData(index).set(data));bank[kind]=buffer;}return bank;
}
