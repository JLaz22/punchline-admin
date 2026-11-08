"use client";
import {useActionState} from "react";
import {mutateResource} from "@/app/(admin)/manage/[resource]/actions";
import type {Resource} from "@/lib/resources";
export default function ResourceForm({resource,config,row={},options={}}:{resource:string;config:Resource;row?:Record<string,unknown>;options?:Record<string,{id:number;name:string}[]>}){
 const [state,action,pending]=useActionState(mutateResource,{});
 return <form action={action} className="editor card"><input type="hidden" name="resource" value={resource}/><input type="hidden" name="id" value={String(row.id??"")}/>
 {config.fields.map(f=><label key={f.key}>{f.label}{f.required?" *":""}{f.ref?<select name={f.key} defaultValue={String(row[f.key]??"")} disabled={config.mode==="edit"}><option value="">Choose…</option>{(options[f.ref]??[]).map(o=><option key={o.id} value={o.id}>{o.name} (#{o.id})</option>)}</select>:f.type==="checkbox"?<input style={{width:"auto"}} type="checkbox" name={f.key} defaultChecked={row[f.key]===undefined?true:row[f.key]===true}/>:f.type==="textarea"?<textarea name={f.key} rows={5} defaultValue={String(row[f.key]??"")} required={f.required} maxLength={f.max}/>:<input name={f.key} type={f.type??"text"} defaultValue={String(row[f.key]??"")} required={f.required} maxLength={f.max} min={f.min??1} max={f.max}/>}</label>)}
 {state.error&&<p className="notice" role="alert">{state.error}</p>}{state.success&&<p className="notice" role="status">{state.success}</p>}
 <button className="primary" disabled={pending} name="operation" value="save">{pending?"Saving…":"Save changes"}</button>
 {row.id && config.mode==="crud"?<details className="danger"><summary>Delete record</summary><p>Permanent deletion. Referenced records must be removed from their workflows first.</p><input name="confirmation" placeholder="Type DELETE" aria-label="Deletion confirmation"/><button className="danger-button" disabled={pending} name="operation" value="delete" formNoValidate>Delete record</button></details>:null}
 </form>;
}
