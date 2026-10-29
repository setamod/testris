"""Offline production diagnostic for synthetic announcer clips.
Uses the public OpenAI Whisper base.en checkpoint locally; model stays in .tooling.
No private recordings, API calls, forced phrase hints or runtime game inference.
Run from the game root with explicit candidate WAV paths. Human listening remains necessary.
"""
from pathlib import Path
import os,json,hashlib,wave,sys
root=Path.cwd();folder=root/'.tooling/voice-asr';model_dir=folder/'model'
os.environ.update(HF_HOME=str(root/'.tooling/expressive-cache'),HF_HUB_DISABLE_IMPLICIT_TOKEN='1',HF_HUB_DISABLE_TELEMETRY='1')
from huggingface_hub import HfApi,hf_hub_download
repo='openai/whisper-base.en'
if not (model_dir/'sources.json').exists():
 meta=HfApi().model_info(repo,files_metadata=True,token=False);rev=meta.sha;report=[]
 names=['model.safetensors','config.json','generation_config.json','preprocessor_config.json','tokenizer_config.json','special_tokens_map.json','vocab.json','merges.txt','normalizer.json']
 files={x.rfilename:x for x in meta.siblings}
 for name in names:
  if name not in files:continue
  p=Path(hf_hub_download(repo,name,revision=rev,local_dir=model_dir,token=False));digest=hashlib.file_digest(p.open('rb'),'sha256').hexdigest()
  if files[name].lfs:assert digest==files[name].lfs.sha256
  report.append({'file':name,'sha256':digest,'bytes':p.stat().st_size});print('Verified',name,flush=True)
 (model_dir/'sources.json').write_text(json.dumps({'repo':repo,'revision':rev,'files':report},indent=2))
import torch,numpy as np
from scipy.signal import resample_poly
from transformers import WhisperForConditionalGeneration,WhisperProcessor
torch.set_num_threads(3)
processor=WhisperProcessor.from_pretrained(model_dir,local_files_only=True)
model=WhisperForConditionalGeneration.from_pretrained(model_dir,local_files_only=True).eval()
results=[]
paths=[Path(x).resolve() for x in sys.argv[1:]] or sorted((root/'.tooling/expressive-output-0.9.5').glob('*.wav'))
for p in paths:
 with wave.open(str(p),'rb') as f:
  rate=f.getframerate();assert f.getsampwidth()==2 and f.getnchannels()==1
  samples=np.frombuffer(f.readframes(f.getnframes()),dtype='<i2').astype(np.float32)/32768
 samples=resample_poly(samples,2,3) if rate==24000 else samples
 assert rate in [16000,24000]
 inputs=processor(samples,sampling_rate=16000,return_tensors='pt',return_attention_mask=True)
 with torch.no_grad():ids=model.generate(**inputs,max_new_tokens=64,do_sample=False,num_beams=5)
 text=processor.batch_decode(ids,skip_special_tokens=True)[0].strip();entry={'file':str(p.relative_to(root)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'transcript':text};results.append(entry);print(json.dumps(entry),flush=True)
(folder/'latest-check.json').write_text(json.dumps({'model':repo,'source':json.loads((model_dir/'sources.json').read_text()),'note':'Unprompted local ASR diagnostic, not a substitute for owner listening. No game inference or user audio.','results':results},indent=2)+'\n')
