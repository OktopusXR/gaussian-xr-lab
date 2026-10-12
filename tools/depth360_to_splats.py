import argparse, numpy as np, cv2
from PIL import Image
from transformers import pipeline
p=argparse.ArgumentParser();p.add_argument('image');p.add_argument('output');a=p.parse_args()
pan=np.array(Image.open(a.image).convert('RGB'));H,W=pan.shape[:2]
depth_model=pipeline('depth-estimation',model='depth-anything/Depth-Anything-V2-Small-hf',device=-1)
xyz=[];rgb=[];radii=[]
for yaw,pitch in [(0,0),(90,0),(180,0),(-90,0),(0,90),(0,-90)]:
 n=256; x=(np.arange(n)+.5)/n*2-1;y=1-(np.arange(n)+.5)/n*2; xx,yy=np.meshgrid(x,y)
 d=np.stack([xx,yy,-np.ones_like(xx)],-1); ya=np.deg2rad(yaw);pi=np.deg2rad(pitch)
 ry=np.array([[np.cos(ya),0,-np.sin(ya)],[0,1,0],[np.sin(ya),0,np.cos(ya)]])
 rx=np.array([[1,0,0],[0,np.cos(pi),-np.sin(pi)],[0,np.sin(pi),np.cos(pi)]])
 d=d@(ry@rx).T;d=d/np.linalg.norm(d,axis=-1,keepdims=True)
 az=np.arctan2(d[...,0],-d[...,2]);el=np.arcsin(np.clip(d[...,1],-1,1))
 mx=((az/(2*np.pi)+.5)*W).astype('float32');my=((.5-el/np.pi)*H).astype('float32')
 face=cv2.remap(pan,mx,my,cv2.INTER_LINEAR,borderMode=cv2.BORDER_WRAP)
 dep=np.array(depth_model(Image.fromarray(face))['depth'].resize((n,n)),dtype='float32')
 lo,hi=np.percentile(dep,[5,95]);dist=2+8*(1-np.clip((dep-lo)/max(hi-lo,1e-6),0,1))
 s=np.s_[3:-3,3:-3];xyz.append((d[s]*dist[s][...,None]).reshape(-1,3));rgb.append(face[s].reshape(-1,3));radii.append((dist[s]*2/n).ravel())
xyz=np.concatenate(xyz);rgb=np.concatenate(rgb);radii=np.concatenate(radii);count=len(xyz)
sh=(rgb.astype('float32')/255-.5)/0.28209479177387814;scale=np.log(np.maximum(radii,.003))
data=np.column_stack([xyz,np.zeros((count,3)),sh,np.full(count,3.2),scale,scale,np.full(count,np.log(.035)),np.ones(count),np.zeros((count,3))]).astype('<f4')
names=['x','y','z','nx','ny','nz','f_dc_0','f_dc_1','f_dc_2','opacity','scale_0','scale_1','scale_2','rot_0','rot_1','rot_2','rot_3']
header=f'ply\nformat binary_little_endian 1.0\ncomment inferred monocular depth, not metric or multiview-trained\nelement vertex {count}\n'+''.join('property float '+v+'\n' for v in names)+'end_header\n'
with open(a.output,'wb') as f:f.write(header.encode());f.write(data.tobytes())
print('Wrote',count,'splats to',a.output)
