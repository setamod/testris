from pathlib import Path
import os,wave
os.environ['OMP_NUM_THREADS']='2'
import onnxruntime as ort
ort.disable_telemetry_events()
from kokoro_onnx import Kokoro
import numpy as np
root=Path.cwd();model=Kokoro(str(root/'.tooling/announcer-models/kokoro-v1.0.onnx'),str(root/'.tooling/announcer-models/voices-v1.0.bin'));voice=model.get_voice_style('am_michael')*.7+model.get_voice_style('am_fenrir')*.3
samples,rate=model.create('What a play! This is your moment. Keep it going. Incredible moves. Can you believe that finish?',voice=voice,speed=1.0,lang='en-us')
with wave.open(str(root/'.tooling/announcer-output/synthetic-reference.wav'),'wb') as f:f.setnchannels(1);f.setsampwidth(2);f.setframerate(rate);f.writeframes((np.clip(samples,-1,1)*32767).astype('<i2').tobytes())
print('Synthetic-only reference:',len(samples)/rate,'seconds')
