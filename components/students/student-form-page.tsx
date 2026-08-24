"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Avatar, Button, Input, Select, Spin, notification } from "antd";
import { ArrowLeftOutlined, SaveOutlined, UserAddOutlined, UserOutlined } from "@ant-design/icons";
import { ApplicationShell } from "@/components/application-shell";

type AcademicYear={id:string;name:string;status:string;isCurrent:boolean};
type Department={id:string;name:string;code:string;status:string};
type Program={id:string;name:string;code:string;department:{id:string;name:string;code:string};status:string};
type Enrollment={id:string;enrollmentNumber:string;academicYear:{id:string;name:string};department:{id:string;name:string};program:{id:string;name:string}};
type Student={id:string;studentNumber:string;firstName:string;lastName:string;email:string|null;phone:string|null;photoUrl:string|null;dateOfBirth:string|null;enrollments:Enrollment[]};
type FormState={studentNumber:string;firstName:string;lastName:string;email:string;phone:string;photoUrl:string;dateOfBirth:string;academicYearId:string;departmentId:string;programId:string;enrollmentNumber:string};
const empty:FormState={studentNumber:"",firstName:"",lastName:"",email:"",phone:"",photoUrl:"",dateOfBirth:"",academicYearId:"",departmentId:"",programId:"",enrollmentNumber:""};

export function StudentFormPage({studentId}:{studentId?:string}) {
  const editing=Boolean(studentId);
  const [api,holder]=notification.useNotification();
  const [form,setForm]=useState<FormState>(empty);
  const [years,setYears]=useState<AcademicYear[]>([]);
  const [departments,setDepartments]=useState<Department[]>([]);
  const [programs,setPrograms]=useState<Program[]>([]);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const notify=(type:"success"|"error"|"warning"|"info",message:string)=>api[type]({message,placement:"bottomRight",duration:4,className:`edu-notification edu-notification-${type}`});

  useEffect(()=>{let cancelled=false;void Promise.all([
    fetch("/api/academic/years",{cache:"no-store"}),fetch("/api/academic/departments",{cache:"no-store"}),fetch("/api/academic/programs",{cache:"no-store"}),
    studentId?fetch(`/api/students/${studentId}`,{cache:"no-store"}):Promise.resolve(null)
  ]).then(async([yr,dr,pr,sr])=>{
    const [yd,dd,pd,sd]=await Promise.all([yr.json(),dr.json(),pr.json(),sr?sr.json():Promise.resolve(null)]);
    if(!yr.ok||!dr.ok||!pr.ok||sr&&!sr.ok) throw new Error(yd.error??dd.error??pd.error??sd?.error??"Unable to load student information.");
    if(cancelled)return;
    setYears((yd.academicYears??[]).filter((x:AcademicYear)=>x.status==="ACTIVE"));
    setDepartments((dd.departments??[]).filter((x:Department)=>x.status==="ACTIVE"));
    setPrograms((pd.programs??[]).filter((x:Program)=>x.status!=="ARCHIVED"));
    if(sd?.student){const s=sd.student as Student;const e=s.enrollments[0];setForm({studentNumber:s.studentNumber,firstName:s.firstName,lastName:s.lastName,email:s.email??"",phone:s.phone??"",photoUrl:s.photoUrl??"",dateOfBirth:s.dateOfBirth?new Date(s.dateOfBirth).toISOString().slice(0,10):"",academicYearId:e?.academicYear.id??"",departmentId:e?.department.id??"",programId:e?.program.id??"",enrollmentNumber:e?.enrollmentNumber??""});}
    else setForm((x)=>({...x,academicYearId:(yd.academicYears??[]).find((y:AcademicYear)=>y.isCurrent)?.id??(yd.academicYears??[])[0]?.id??""}));
    setLoading(false);
  }).catch((error:unknown)=>{if(!cancelled){notify("error",error instanceof Error?error.message:"Unable to load student information.");setLoading(false);}});
  return()=>{cancelled=true;};},[studentId]);

  const visiblePrograms=useMemo(()=>programs.filter(p=>!form.departmentId||p.department.id===form.departmentId),[form.departmentId,programs]);
  const set=(key:keyof FormState,value:string)=>setForm(x=>({...x,[key]:value}));
  const initials=`${form.firstName[0]??""}${form.lastName[0]??""}`.toUpperCase();

  async function save(){
    if(!form.studentNumber||!form.firstName||!form.lastName||!form.academicYearId||!form.departmentId||!form.programId||!form.enrollmentNumber){notify("warning","Complete all required student and admission details.");return;}
    setSaving(true);
    try{const r=await fetch(editing?`/api/students/${studentId}`:"/api/students",{method:editing?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});const d=await r.json();if(!r.ok)throw new Error(d.error??"We couldn't save the student. Please try again.");notify("success",editing?"Student updated successfully.":"Student created successfully.");window.setTimeout(()=>window.location.assign("/students"),350);}
    catch(error){notify("error",error instanceof Error?error.message:"We couldn't save the student. Please try again.");}
    finally{setSaving(false);}
  }

  return <ApplicationShell pageTitle={editing?"Edit Student":"Add New Student"} pageContext={editing?"Update student information and academic admission details.":"Enter student information to create a new student record."} selectedKey="students">
    {holder}
    <div className="student-form-page">
      <div className="student-form-toolbar"><div className="student-breadcrumb">Home <span>›</span> <Link href="/students">Students</Link> <span>›</span> <strong>{editing?"Edit Student":"Add Student"}</strong></div><Link href="/students"><Button icon={<ArrowLeftOutlined />}>Back to Students</Button></Link></div>
      {loading?<div className="student-form-loading"><Spin size="large"/></div>:<div className="student-form-layout">
        <main className="student-form-main">
          <section className="student-form-section"><h2><span/>Personal Information</h2><div className="student-form-grid three">
            <Field label="First Name" required><Input value={form.firstName} onChange={e=>set("firstName",e.target.value)} placeholder="Enter first name"/></Field>
            <Field label="Last Name" required><Input value={form.lastName} onChange={e=>set("lastName",e.target.value)} placeholder="Enter last name"/></Field>
            <Field label="Email Address"><Input value={form.email} onChange={e=>set("email",e.target.value)} placeholder="Enter email address"/></Field>
            <Field label="Mobile Number"><Input value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="Enter mobile number"/></Field>
            <Field label="Date of Birth"><Input type="date" value={form.dateOfBirth} onChange={e=>set("dateOfBirth",e.target.value)}/></Field>
            <Field label="Student Number" required><Input value={form.studentNumber} onChange={e=>set("studentNumber",e.target.value)} placeholder="Example: STU-2026-001"/></Field>
          </div></section>
          <section className="student-form-section"><h2><span/>Admission Information</h2><div className="student-form-grid two">
            <Field label="Academic Year" required><Select value={form.academicYearId||undefined} onChange={v=>set("academicYearId",v)} options={years.map(x=>({value:x.id,label:x.name}))} placeholder="Select academic year"/></Field>
            <Field label="Department" required><Select value={form.departmentId||undefined} onChange={v=>setForm(x=>({...x,departmentId:v,programId:""}))} options={departments.map(x=>({value:x.id,label:x.name}))} placeholder="Select department"/></Field>
            <Field label="Program" required><Select value={form.programId||undefined} onChange={v=>set("programId",v)} options={visiblePrograms.map(x=>({value:x.id,label:x.name}))} placeholder="Select program"/></Field>
            <Field label="Enrollment Number" required><Input value={form.enrollmentNumber} onChange={e=>set("enrollmentNumber",e.target.value)} placeholder="Example: ENR-2026-001"/></Field>
          </div></section>
          <section className="student-form-section"><h2><span/>Contact Information</h2><div className="student-form-grid two">
            <Field label="Email Address"><Input value={form.email} onChange={e=>set("email",e.target.value)} placeholder="Enter email address"/></Field>
            <Field label="Mobile Number"><Input value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="Enter mobile number"/></Field>
          </div></section>
        </main>
        <aside className="student-photo-panel"><h2>Student Photo</h2><div className="student-photo-card"><Avatar size={104} src={form.photoUrl||undefined} icon={!form.photoUrl?<UserOutlined/>:undefined}>{!form.photoUrl?initials:null}</Avatar><strong>{form.photoUrl?"Photo preview":"Student photo"}</strong><span>Use a hosted JPG or PNG image URL</span><Input value={form.photoUrl} onChange={e=>set("photoUrl",e.target.value)} placeholder="https://example.com/photo.jpg"/>{form.photoUrl&&<Button danger type="text" onClick={()=>set("photoUrl","")}>Remove Photo</Button>}</div></aside>
      </div>}
      <div className="student-form-actions"><Button onClick={()=>setForm(empty)}>Reset</Button><Button type="primary" icon={editing?<SaveOutlined/>:<UserAddOutlined/>} loading={saving} onClick={()=>void save()}>{editing?"Save Changes":"Save Student"}</Button></div>
    </div>
  </ApplicationShell>;
}
function Field({label,required,children}:{label:string;required?:boolean;children:React.ReactNode}){return <label className="student-field"><span>{label}{required&&<b> *</b>}</span>{children}</label>;}
