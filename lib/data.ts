import {requireAdmin} from './auth';
export type Media={id:number;user_id:string;prompt:string;style:string;content:string;model:string;upvotes:number;downvotes:number;created_at:string;image_url:string|null;image_alt:string|null;image_source:string|null};
export type Profile={id:string;first_name:string|null;last_name:string|null;is_superadmin:boolean;created_at:string};
export type Vote={id:number;generation_id:number;user_id:string;value:number;created_at:string};
export async function allRows<T>(table:string,columns:string){const {db}=await requireAdmin();const rows:T[]=[];for(let start=0;;start+=1000){const {data,error}=await db.from(table).select(columns).order('id').range(start,start+999);if(error)throw new Error('Database query failed: '+table);rows.push(...data as T[]);if(data.length<1000)break;}return rows;}
export const mediaColumns='id,user_id,prompt,style,content,model,upvotes,downvotes,created_at,image_url,image_alt,image_source';
export const date=(s:string)=>new Date(s).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'});
export const name=(p:Profile)=>[p.first_name,p.last_name].filter(Boolean).join(' ')||'Unnamed profile';
