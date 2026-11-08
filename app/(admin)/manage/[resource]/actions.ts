"use server";
import { requireAdmin } from "@/lib/auth";
import { getResource } from "@/lib/resources";
import { revalidatePath } from "next/cache";
export async function mutateResource(_: {error?:string;success?:string}, form:FormData):Promise<{error?:string;success?:string}> {
 const {db}=await requireAdmin();
 const key=String(form.get("resource")), r=getResource(key), id=String(form.get("id")||"");
 if(!r || r.mode==="read" || (id && !/^[1-9]\d*$/.test(id))) return {error:"Invalid operation."};
 const removing=form.get("operation")==="delete";
 if(removing && (r.mode!=="crud" || !id || form.get("confirmation")!=="DELETE")) return {error:"Type DELETE to confirm."};
 if(!id && r.mode!=="crud") return {error:"Select an existing record."};
 const values:Record<string,unknown>={};
 if(!removing) for(const f of r.fields){
  if(r.mode==="edit" && f.key==="prompt_chain_id") continue;
  if(f.type==="checkbox") {values[f.key]=form.get(f.key)==="on";continue;}
  const raw=String(form.get(f.key)||"").trim();
  if(f.required && !raw) return {error:`${f.label} is required.`};
  if(f.type==="number") {const n=Number(raw);if(!raw || !Number.isSafeInteger(n) || n<(f.min??1) || n>(f.max??Number.MAX_SAFE_INTEGER)) return {error:`Check ${f.label}.`};values[f.key]=n;}
  else {if(raw.length>(f.max??12000)) return {error:`${f.label} is too long.`};values[f.key]=["email","domain"].includes(f.key)?raw.toLowerCase():raw;}
 }
 const q=removing?db.from(r.table).delete().eq("id",id):id?db.from(r.table).update(values).eq("id",id):db.from(r.table).insert(values);
 const {error}=await q.select("id").single();
 if(error) return {error:error.code==="23503"?"This record is referenced elsewhere, or a selected reference no longer exists.":error.code==="23505"?"That record already exists.":error.code==="23514"?"A field does not meet the required format. Check your values.":"Could not save. Check your access and database setup, then retry."};
 revalidatePath(`/manage/${key}`);return {success:removing?"Record deleted.":"Changes saved."};
}
