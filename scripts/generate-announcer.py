"""Generate fixed-call candidates locally; do not embed unchecked output.
Run check-announcer-speech.py on the resulting WAVs, review listening samples,
then record matching speech/hash evidence before embed-announcer.mjs.
Models and generation dependencies are excluded from the game distribution.
"""
from pathlib import Path
import os,json,hashlib,wave,time
root=Path.cwd();folder=root/'.tooling/expressive-output';folder.mkdir(exist_ok=True)
os.environ.update(HF_HOME=str(root/'.tooling/expressive-cache'),TORCH_HOME=str(root/'.tooling/expressive-cache/torch'),HF_HUB_DISABLE_IMPLICIT_TOKEN='1',HF_HUB_DISABLE_TELEMETRY='1',PYTORCH_ENABLE_MPS_FALLBACK='1')
import torch
import numpy as np
from chatterbox.tts import ChatterboxTTS
from importlib.metadata import version
torch.set_num_threads(3)
meta=json.loads((root/'.tooling/expressive-model/sources.json').read_text())
for asset in meta['files']:
 assert hashlib.file_digest((root/'.tooling/expressive-model'/asset['file']).open('rb'),'sha256').hexdigest()==asset['sha256']
device='mps' if torch.backends.mps.is_available() else 'cpu';print('device',device,flush=True)
model=ChatterboxTTS.from_local(root/'.tooling/expressive-model',device=device)
reference=root/'.tooling/announcer-output/synthetic-reference.wav';assert reference.exists()
profiles=[('four', 'Nice move!', 0.35, 0.65, 0.6, 8602), ('five', 'Awesome!', 0.8, 0.4, 0.7, 7320), ('cross', 'Excellent!', 1.0, 0.4, 0.7, 7331), ('combo3', 'Triple combo!', 0.9, 0.4, 0.7, 7340), ('combo4', 'Monster combo!', 1.05, 0.7, 0.6, 8302), ('nova', 'Oh yeah!', 1.15, 0.65, 0.6, 8501), ('novaReady', 'Nova ready!', 0.8, 0.65, 0.6, 8702)]
report=[]
for kind,text,emotion,cfg,temperature,base_seed in profiles:
 started=time.monotonic()
 for attempt in range(3):
  seed=base_seed+attempt;torch.manual_seed(seed);np.random.seed(seed)
  samples=model.generate(text,audio_prompt_path=str(reference),exaggeration=emotion,cfg_weight=cfg,temperature=temperature,repetition_penalty=1.3).squeeze().cpu().numpy().astype(np.float64)
  rate=model.sr;duration=len(samples)/rate
  if .2<duration<(3.4 if kind=='nova' else 2.7):break
 else:raise RuntimeError(f'{kind} could not meet short-clip duration: {duration}')
 peak=float(np.max(np.abs(samples)));rms=float(np.sqrt(np.mean(samples*samples)));target=.12 if kind=='four' else .14
 # Keep the model's default PerTh watermark and waveform; attenuate only.
 gain=min(1,.86/max(peak,.001),target/max(rms,.001));samples*=gain
 path=folder/(kind+'.wav')
 with wave.open(str(path),'wb') as f:f.setnchannels(1);f.setsampwidth(2);f.setframerate(rate);f.writeframes((np.clip(samples,-1,1)*32767).astype('<i2').tobytes())
 data=path.read_bytes();report.append({'kind':kind,'phrase':text,'exaggeration':emotion,'cfg_weight':cfg,'temperature':temperature,'seed':seed,'duration':duration,'sample_rate':rate,'file':path.name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'peak':float(np.max(np.abs(samples))),'rms':float(np.sqrt(np.mean(samples*samples))),'linear_gain':gain,'watermark':'default PerTh retained; no trimming or distortion'})
 print(kind,round(duration,2),'seconds; generated in',round(time.monotonic()-started,1),'s',flush=True)
(folder/'clips.json').write_text(json.dumps({'generator':'chatterbox-tts '+version('chatterbox-tts'),'model':'ResembleAI/chatterbox','model_assets':meta,'device':device,'reference':{'kind':'synthetic only; no human speaker reference','sha256':hashlib.sha256(reference.read_bytes()).hexdigest(),'generator':'Kokoro-82M v1.0; 70% am_michael / 30% am_fenrir'},'clips':report},indent=2)+'\n')
