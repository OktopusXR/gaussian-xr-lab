"""Convert an equirectangular panorama into a spherical 3DGS proof of concept.

IMPORTANT: This creates a fixed-radius splat shell, NOT recovered scene geometry.
Requires Pillow, numpy, scipy.
Usage: python tools/panorama_to_splats.py frame.jpg assets/splats/bosque_spherical.ply
"""
import argparse
import numpy as np
from PIL import Image
from scipy.spatial.transform import Rotation

def main():
    p=argparse.ArgumentParser()
    p.add_argument('image')
    p.add_argument('output')
    p.add_argument('--width',type=int,default=256)
    p.add_argument('--radius',type=float,default=8.0)
    a=p.parse_args()
    w=a.width; h=w//2
    im=np.asarray(Image.open(a.image).convert('RGB').resize((w,h),Image.Resampling.LANCZOS),dtype=np.float32)/255
    theta=(np.arange(h)+.5)/h*np.pi
    phi=(np.arange(w)+.5)/w*2*np.pi-np.pi
    tt,pp=np.meshgrid(theta,phi,indexing='ij')
    directions=np.stack([np.sin(tt)*np.sin(pp),np.cos(tt),-np.sin(tt)*np.cos(pp)],axis=-1).reshape(-1,3)
    u=np.stack([np.cos(pp),np.zeros_like(pp),np.sin(pp)],axis=-1)
    v=np.stack([np.cos(tt)*np.sin(pp),-np.sin(tt),-np.cos(tt)*np.cos(pp)],axis=-1)
    basis=np.stack([u,v,directions.reshape(h,w,3)],axis=-1).reshape(-1,3,3)
    basis[np.linalg.det(basis)<0,:,1]*=-1
    quat=Rotation.from_matrix(basis).as_quat()[:,[3,0,1,2]]
    xyz=directions*a.radius
    sh=(im.reshape(-1,3)-.5)/0.28209479177387814
    arc=a.radius*2*np.pi/w
    scales=np.stack([np.full(len(xyz),np.log(arc*.9)),np.log(np.maximum(np.sin(tt.reshape(-1)),.05)*arc*.9),np.full(len(xyz),np.log(.06))],axis=1)
    records=np.concatenate([xyz,np.zeros_like(xyz),sh,np.full((len(xyz),1),4.),scales,quat],axis=1).astype('<f4')
    names=['x','y','z','nx','ny','nz','f_dc_0','f_dc_1','f_dc_2','opacity','scale_0','scale_1','scale_2','rot_0','rot_1','rot_2','rot_3']
    header='ply\nformat binary_little_endian 1.0\ncomment Fixed-radius spherical splats; NOT depth reconstruction\nelement vertex %d\n'%len(records)+''.join('property float '+n+'\n' for n in names)+'end_header\n'
    with open(a.output,'wb') as f:
        f.write(header.encode())
        f.write(records.tobytes())
    print(f'Created {len(records)} Gaussian splats in {a.output}')

if __name__=='__main__': main()
