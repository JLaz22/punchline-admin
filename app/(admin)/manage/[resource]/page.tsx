import Link from "next/link";
import {notFound} from "next/navigation";
import {requireAdmin} from "@/lib/auth";
import {getResource} from "@/lib/resources";
import ResourceForm from "@/components/resource-form";
export default async function ResourcePage({params,searchParams}:{params:Promise<{resource:string}>;searchParams:Promise<{page?:string;edit?:string}>}){
 const {resource}=await params,r=getResource(resource);if(!r)notFound();
 const {db}=await requireAdmin(),search=await searchParams,page=Math.max(1,Math.min(100000,Math.floor(Number(search.page))||1));
 const {data:rows,error,count}=await db.from(r.table).select("*",{count:"exact"}).order("created_at",{ascending:false}).order("id").range((page-1)*30,page*30-1);
 let selected:Record<string,unknown>|undefined; if(search.edit && search.edit!=="new") {const result=await db.from(r.table).select("*").eq("id",search.edit).maybeSingle();if(result.error||!result.data)notFound();selected=result.data;}
 const options:Record<string,{id:number;name:string}[]>={};
 if(search.edit) for(const f of r.fields.filter(f=>f.ref)) {const {data,error}=await db.from(f.ref!).select("id,name").order("name").limit(1000);if(error)throw Error("Could not load reference options");options[f.ref!]=data??[];}
 return <><div className="page-title"><div><span className="eyebrow">WORKSPACE DATA</span><h1>{r.title}</h1><p>{r.description}</p></div>{r.mode==="crud"&&<Link className="primary" href={`?edit=new`}>+ New record</Link>}</div>
 {error?<div className="notice" role="alert">Unable to load records. Confirm the observability migration is installed and your account has access.</div>:<>
 {search.edit&&r.mode!=="read"&&(search.edit!=="new"||r.mode==="crud")&&<section style={{marginBottom:30}}><div className="section-title"><h2>{selected?"Edit record":"New record"}</h2><Link href={`/manage/${resource}`}>Close editor ×</Link></div><ResourceForm key={search.edit} resource={resource} config={r} row={selected} options={options}/></section>}
 <div className="card table-wrap"><table><thead><tr><th>ID</th>{r.fields.map(f=><th key={f.key}>{f.label}</th>)}<th>Created</th>{r.mode!=="read"&&<th>Actions</th>}</tr></thead><tbody>{rows?.map(row=><tr key={row.id}><td className="mono">{row.id}</td>{r.fields.map(f=><td key={f.key} style={{minWidth:140,maxWidth:420,whiteSpace:"pre-wrap",overflowWrap:"anywhere"}}>{String(row[f.key]??"—").length>200?<details><summary>{String(row[f.key]).slice(0,100)}…</summary>{String(row[f.key])}</details>:String(row[f.key]??"—")}</td>)}<td>{new Date(row.created_at).toLocaleString("en-US",{timeZone:"UTC"})}</td>{r.mode!=="read"&&<td><Link className="secondary" href={`?edit=${row.id}&page=${page}`}>Edit</Link></td>}</tr>)}</tbody></table>{!rows?.length&&<p className="empty">No records yet.</p>}</div><div className="pagination">{page>1&&<Link href={`?page=${page-1}`}>← Previous</Link>}<span>{count??0} records · Page {page}</span>{page*30<(count??0)&&<Link href={`?page=${page+1}`}>Next →</Link>}</div></>}
 </>;
}
