"use server";
import {requireAdmin} from "@/lib/auth";
import {detectPhotoType,MAX_MEME_PHOTO_BYTES} from "@/lib/image-upload";
import {revalidatePath} from "next/cache";
export async function imageAction(_: {error?:string;success?:string},form:FormData):Promise<{error?:string;success?:string}>{
 const {db,user}=await requireAdmin(), id=String(form.get("id")||""), op=String(form.get("operation"));
 if(id&&!/^[1-9]\d*$/.test(id))return {error:"Invalid image."};
 if(op==="delete"){
  if(!id||form.get("confirmation")!=="DELETE")return {error:"Type DELETE to confirm."};
  const {data:row,error}=await db.from("images").select("storage_path").eq("id",id).single();
  if(error)return {error:"Image not found."};
  const removed=await db.storage.from("meme-photos").remove([row.storage_path]);if(removed.error)return {error:"Could not remove image. Retry."};
  const result=await db.from("images").delete().eq("id",id).select("id").single();if(result.error)return {error:"File removed; metadata cleanup failed. Retry deletion."};
 }else{
  const alt=String(form.get("alt")||"").trim();if(!alt||alt.length>300)return {error:"Add an image description of 1–300 characters."};
  if(id){const {error}=await db.from("images").update({alt}).eq("id",id).select("id").single();if(error)return {error:"Could not update image."};}
  else{
   const file=form.get("file");if(!(file instanceof File)||!file.size||file.size>MAX_MEME_PHOTO_BYTES)return {error:"Choose a JPG, PNG or WebP under 3 MB."};
   const bytes=Buffer.from(await file.arrayBuffer()),type=detectPhotoType(bytes);if(!type||type!==file.type)return {error:"Invalid image file."};
   const path=`${user.id}/admin-${crypto.randomUUID()}.${type==="image/jpeg"?"jpg":type==="image/png"?"png":"webp"}`;
   const upload=await db.storage.from("meme-photos").upload(path,bytes,{contentType:type});if(upload.error)return {error:"Upload failed. Check storage access."};
   const {error}=await db.from("images").insert({storage_path:path,alt});if(error){await db.storage.from("meme-photos").remove([path]);return {error:"Could not save image metadata."};}
  }
 }
 revalidatePath("/images");return {success:op==="delete"?"Image deleted.":"Image saved."};
}
