export async function loadManifest(){
 const response=await fetch(import.meta.env.BASE_URL+'assets/manifest.json');
 if(!response.ok)throw new Error('Manifest HTTP '+response.status);
 return response.json();
}
